import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';

const AD_GROUP_ID = 'ait.v2.live.4499f806e45e4767';

interface RewardedAdCallbacks {
    onRewarded?: () => void;
    onDismiss?: () => void;
    onAdReady?: () => void; // 광고 시청 시작점 (API 호출 타이밍)
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
    const [isWaiting, setIsWaiting] = useState(false);

    // 상태 참조용 Ref (의존성 사이클 방지 및 최신값 참조용)
    const adStateRef = useRef({ loading: true, adLoaded: false });
    const rewardCallbackRef = useRef<(() => void) | undefined>(undefined);
    const dismissCallbackRef = useRef<(() => void) | undefined>(undefined);
    const cleanupRef = useRef<(() => void) | undefined>(undefined);
    const pendingRequestRef = useRef<RewardedAdCallbacks | undefined>(undefined);


    /**
     * 광고 로드 함수
     */
    const loadRewardAd = useCallback(() => {
        if (!isAdSupported()) {
            setLoading(false);
            setAdLoaded(false);
            adStateRef.current = { loading: false, adLoaded: false };
            return;
        }

        setLoading(true);
        setAdLoaded(false);
        adStateRef.current = { loading: true, adLoaded: false };

        cleanupRef.current?.();

        const cleanup = GoogleAdMob.loadAppsInTossAdMob({
            options: { adGroupId: AD_GROUP_ID },
            onEvent: (event: { type: string }) => {
                if (event.type === 'loaded') {
                    console.log('[Ad] 광고 로드 성공');
                    setAdLoaded(true);
                    setLoading(false);
                    adStateRef.current = { loading: false, adLoaded: true };

                    if (pendingRequestRef.current) {
                        const callbacks = pendingRequestRef.current;
                        pendingRequestRef.current = undefined;
                        setIsWaiting(false);

                        // [User Flow Case 2] 로딩 대기 종료 -> API 호출 및 광고 송출 시작
                        callbacks.onAdReady?.();
                        setTimeout(() => triggerShowAd(callbacks), 0);
                    }
                    cleanup();
                }
            },
            onError: (error: unknown) => {
                console.error('[Ad] 광고 로드 실패:', error);
                setLoading(false);
                adStateRef.current = { loading: false, adLoaded: false };
                if (pendingRequestRef.current) {
                    // 로드 실패 시에도 결과를 볼 수 있게 처리
                    pendingRequestRef.current.onAdReady?.();
                    pendingRequestRef.current.onRewarded?.();
                    pendingRequestRef.current = undefined;
                    setIsWaiting(false);
                }
                cleanup?.();
            },
        });

        cleanupRef.current = cleanup;
    }, []);

    /**
     * 실제 광고 노출 엔진
     */
    const triggerShowAd = useCallback(({ onRewarded, onDismiss }: RewardedAdCallbacks) => {
        setIsWaiting(false);
        rewardCallbackRef.current = onRewarded;
        dismissCallbackRef.current = onDismiss;

        GoogleAdMob.showAppsInTossAdMob({
            options: { adGroupId: AD_GROUP_ID },
            onEvent: (event: { type: string }) => {
                switch (event.type) {
                    case 'requested':
                        setAdLoaded(false);
                        adStateRef.current.adLoaded = false;
                        break;
                    case 'userEarnedReward':
                        rewardCallbackRef.current?.();
                        rewardCallbackRef.current = undefined;
                        break;
                    case 'dismissed':
                        dismissCallbackRef.current?.();
                        dismissCallbackRef.current = undefined;
                        loadRewardAd();
                        break;
                    case 'failedToShow':
                        // [보완] 광고 보여주기 실패 시에도 유저를 위해 보상 처리
                        rewardCallbackRef.current?.();
                        rewardCallbackRef.current = undefined;
                        break;
                }
            },
            onError: () => {
                rewardCallbackRef.current?.();
                rewardCallbackRef.current = undefined;
            },
        });
    }, [loadRewardAd]);

    /**
     * 외부로 노출하는 광고 보여주기 함수
     */
    const showRewardAd = useCallback((callbacks: RewardedAdCallbacks) => {
        if (!isShowAdSupported()) {
            console.log('[Ad] 광고 미지원 환경.');
            callbacks.onAdReady?.();
            callbacks.onRewarded?.();
            return;
        }

        const { loading: curLoading, adLoaded: curLoaded } = adStateRef.current;

        if (curLoading || !curLoaded) {
            console.log('[Ad] 광고 준비 중... 예약됨');
            setIsWaiting(true);
            pendingRequestRef.current = callbacks;
            return;
        }

        // [User Flow Case 1] 로드된 경우 바로 호출
        callbacks.onAdReady?.();
        triggerShowAd(callbacks);
    }, [triggerShowAd]);

    useEffect(() => {
        loadRewardAd();
        return () => cleanupRef.current?.();
    }, [loadRewardAd]);

    return {
        loading,
        adLoaded,
        isWaiting,
        loadRewardAd,
        showRewardAd,
    };
}
