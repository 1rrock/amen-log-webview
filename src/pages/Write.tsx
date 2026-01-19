import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateResponse } from '../utils/ai';
import { v4 as uuidv4 } from 'uuid';
import { saveRecord } from '../utils/storage';
import { useRewardedAd } from '../hooks/useRewardedAd';

export default function Write() {
    const navigate = useNavigate();
    const [prayer, setPrayer] = useState('');
    const { loading: adLoading, showRewardAd } = useRewardedAd();
    const [aiLoading, setAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasProcessedRef = useRef(false);

    const handleNext = async () => {
        if (!prayer.trim() || isSubmitting) return;

        setIsSubmitting(true);
        hasProcessedRef.current = false;

        showRewardAd({
            onRewarded: () => {
                // 리워드를 성공적으로 획득했을 때만 처리 (광고 시청 완료)
                if (!hasProcessedRef.current) {
                    hasProcessedRef.current = true;
                    processSubmission();
                }
            },
            onDismiss: () => {
                // 광고를 그냥 닫았을 경우 처리
                if (!hasProcessedRef.current) {
                    setIsSubmitting(false); // 다시 기도하기 버튼 누를 수 있게 초기화
                }
            }
        });
    };

    const processSubmission = async () => {
        setAiLoading(true);
        try {
            const response = await generateResponse(prayer);
            const record = {
                id: uuidv4(),
                prayer,
                response,
                date: new Date().toISOString()
            };
            saveRecord(record);
            navigate('/result', { state: { record } });
        } catch (error) {
            alert("오류가 발생했습니다. 다시 시도해주세요.");
            setAiLoading(false);
            setIsSubmitting(false);
            hasProcessedRef.current = false;
        }
    };

    return (
        <div className="page-container">
            {/* Top Section */}
            <div className="top-section">
                <h1 className="top-title">어떤 기도를 드리고 싶나요?</h1>
                <p className="top-subtitle">하늘에 전하고 싶은 진심을 적어주세요.</p>
            </div>

            {/* Content */}
            <div className="content-section">
                <textarea
                    className="textarea-box"
                    value={prayer}
                    onChange={(e) => setPrayer(e.target.value)}
                    placeholder="어떤 고민이든 괜찮아요!"
                />

                <p className="tip-text">
                    💡 Tip: 키보드의 마이크 버튼(🎤)을 눌러<br />음성으로도 기도할 수 있어요.
                </p>
            </div>

            {/* Fixed Bottom CTA */}
            <div className="fixed-bottom-cta fixed-bottom-cta-dual">
                <button
                    className="btn-secondary flex-1"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                >
                    취소
                </button>
                <button
                    className="btn-primary flex-1"
                    disabled={!prayer.trim() || aiLoading || adLoading || isSubmitting}
                    onClick={handleNext}
                >
                    {aiLoading ? '준비 중...' : '기도하기'}
                </button>
            </div>
        </div>
    );
}
