import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@toss/tds-mobile';
import { generateResponse } from '../utils/ai';
import { v4 as uuidv4 } from 'uuid';
import { saveRecord } from '../utils/storage';
import { useRewardedAd } from '../hooks/useRewardedAd';

export default function Write() {
    const navigate = useNavigate();
    const [prayer, setPrayer] = useState('');
    const { showRewardAd, isWaiting: adWaiting } = useRewardedAd();
    const [aiLoading, setAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const hasProcessedRef = useRef(false);

    const handleNext = async () => {
        if (!prayer.trim() || isSubmitting) return;
        setIsConfirmOpen(true);
    };

    const startAdProcess = () => {
        setIsConfirmOpen(false);
        setIsSubmitting(true);
        hasProcessedRef.current = false;

        showRewardAd({
            onRewarded: () => {
                if (!hasProcessedRef.current) {
                    hasProcessedRef.current = true;
                    processSubmission();
                }
            },
            onDismiss: () => {
                if (!hasProcessedRef.current) {
                    setIsSubmitting(false);
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
            <ConfirmDialog
                open={isConfirmOpen}
                title={<ConfirmDialog.Title>기도를 전송하시겠습니까?</ConfirmDialog.Title>}
                description={
                    <ConfirmDialog.Description>
                        AI 말씀을 받기 위해 광고 시청이 필요합니다.
                    </ConfirmDialog.Description>
                }
                cancelButton={
                    <ConfirmDialog.CancelButton onClick={() => setIsConfirmOpen(false)}>
                        취소
                    </ConfirmDialog.CancelButton>
                }
                confirmButton={
                    <ConfirmDialog.ConfirmButton onClick={startAdProcess}>
                        시작하기
                    </ConfirmDialog.ConfirmButton>
                }
                onClose={() => setIsConfirmOpen(false)}
            />

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
                    disabled={!prayer.trim() || aiLoading || isSubmitting}
                    onClick={handleNext}
                >
                    {aiLoading ? '준비 중...' : '기도하기'}
                </button>
            </div>
            {(isSubmitting || aiLoading || adWaiting) && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">
                        지극한 마음으로 기도를 전하는 중입니다...
                    </p>
                </div>
            )}
        </div>
    );
}
