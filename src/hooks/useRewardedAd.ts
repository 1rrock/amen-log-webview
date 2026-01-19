import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';

const AD_GROUP_ID = 'ait.v2.live.4499f806e45e4767';

interface RewardedAdCallbacks {
    onRewarded?: () => void;
    onDismiss?: () => void;
}

// Check if we're in a supported environment
const isAdSupported = (): boolean => {
    try {
        return GoogleAdMob?.loadAppsInTossAdMob?.isSupported?.() === true;
    } catch {
        return false;
    }
};

const isShowAdSupported = (): boolean => {
    try {
        return GoogleAdMob?.showAppsInTossAdMob?.isSupported?.() === true;
    } catch {
        return false;
    }
};

export function useRewardedAd() {
    const [loading, setLoading] = useState(true);
    const [adLoaded, setAdLoaded] = useState(false);
    const rewardCallbackRef = useRef<(() => void) | undefined>(undefined);
    const dismissCallbackRef = useRef<(() => void) | undefined>(undefined);
    const cleanupRef = useRef<(() => void) | undefined>(undefined);

    const loadRewardAd = useCallback(() => {
        // 광고 지원 여부 확인
        if (!isAdSupported()) {
            console.warn('[Ad] 광고가 지원되지 않는 환경입니다. (브라우저 또는 샌드박스)');
            setLoading(false);
            setAdLoaded(false);
            return;
        }

        setLoading(true);
        setAdLoaded(false);

        // 이전 cleanup 호출
        cleanupRef.current?.();

        const cleanup = GoogleAdMob.loadAppsInTossAdMob({
            options: {
                adGroupId: AD_GROUP_ID,
            },
            onEvent: (event: { type: string }) => {
                console.log('[Ad] Event:', event.type);
                switch (event.type) {
                    case 'loaded':
                        console.log('[Ad] 광고 로드 성공');
                        setAdLoaded(true);
                        setLoading(false);
                        cleanup();
                        break;
                }
            },
            onError: (error: unknown) => {
                console.error('[Ad] 광고 로드 실패:', error);
                setLoading(false);
                cleanup?.();
            },
        });

        cleanupRef.current = cleanup;
    }, []);

    useEffect(() => {
        loadRewardAd();
        return () => {
            cleanupRef.current?.();
        };
    }, [loadRewardAd]);

    const showRewardAd = useCallback(({ onRewarded, onDismiss }: RewardedAdCallbacks) => {
        // 광고 지원 여부 확인 - 지원하지 않으면 바로 dismiss 콜백 실행
        if (!isShowAdSupported()) {
            console.warn('[Ad] 광고 표시가 지원되지 않는 환경입니다. 바로 진행합니다.');
            // Non-Toss 환경에서는 광고 없이 바로 진행
            onDismiss?.();
            return;
        }

        if (loading || !adLoaded) {
            console.warn('[Ad] 광고가 아직 로딩 중이거나 로드되지 않았습니다.');
            onDismiss?.();
            return;
        }

        rewardCallbackRef.current = onRewarded;
        dismissCallbackRef.current = onDismiss;

        GoogleAdMob.showAppsInTossAdMob({
            options: {
                adGroupId: AD_GROUP_ID,
            },
            onEvent: (event: { type: string; data?: { unitType?: string; unitAmount?: number } }) => {
                console.log('[Ad] Show Event:', event.type);
                switch (event.type) {
                    case 'show':
                        console.log('[Ad] 광고 컨텐츠 보여졌음');
                        break;
                    case 'requested':
                        console.log('[Ad] 광고 보여주기 요청 완료');
                        setAdLoaded(false);
                        break;
                    case 'impression':
                        console.log('[Ad] 광고 노출');
                        break;
                    case 'clicked':
                        console.log('[Ad] 광고 클릭');
                        break;
                    case 'userEarnedReward':
                        console.log('[Ad] 리워드 획득!');
                        rewardCallbackRef.current?.();
                        rewardCallbackRef.current = undefined;
                        break;
                    case 'dismissed':
                        console.log('[Ad] 광고 닫힘');
                        dismissCallbackRef.current?.();
                        dismissCallbackRef.current = undefined;
                        // 광고를 닫은 후 다음 광고를 미리 로드
                        loadRewardAd();
                        break;
                    case 'failedToShow':
                        console.log('[Ad] 광고 보여주기 실패');
                        dismissCallbackRef.current?.();
                        dismissCallbackRef.current = undefined;
                        break;
                }
            },
            onError: (error: unknown) => {
                console.error('[Ad] 광고 보여주기 실패:', error);
                dismissCallbackRef.current?.();
                dismissCallbackRef.current = undefined;
            },
        });
    }, [loading, adLoaded, loadRewardAd]);

    return {
        loading,
        adLoaded,
        loadRewardAd,
        showRewardAd,
    };
}
