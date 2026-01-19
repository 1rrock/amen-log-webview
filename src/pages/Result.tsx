import { useLocation, useNavigate } from 'react-router-dom';
import type { PrayerRecord } from '../utils/storage';
import { motion } from 'framer-motion';

export default function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const record = location.state?.record as PrayerRecord;

    if (!record) {
        return (
            <div className="page-container" style={{
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 40px'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>⚠️</div>
                <p style={{ fontSize: '16px', color: 'var(--grey-500)', marginBottom: '20px' }}>
                    메시지를 찾을 수 없어요.
                </p>
                <button
                    className="btn-secondary"
                    onClick={() => navigate('/')}
                    style={{ width: 'auto', padding: '12px 24px' }}
                >
                    홈으로 돌아가기
                </button>
            </div>
        );
    }

    const { response } = record;

    return (
        <div className="page-container result-page">
            {/* Top Section */}
            <div className="top-section" style={{ backgroundColor: 'var(--grey-100)' }}>
                <p className="top-subtitle" style={{ marginBottom: '4px' }}>
                    하늘의 지혜를 담은 말씀이 도착했습니다.
                </p>
                <h1 className="top-title">당신을 향한 위로</h1>
            </div>

            {/* Content */}
            <div className="content-section" style={{ backgroundColor: 'var(--grey-100)', paddingTop: '20px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="result-card"
                    style={{ margin: '0' }}
                >
                    <div className="result-header">
                        <span className="result-badge">오늘의 말씀</span>
                        <span className="result-verse-ref">
                            {response.book} {response.chapter}:{response.verse}
                        </span>
                    </div>

                    <p className="result-verse-text">
                        "{response.verseText}"
                    </p>

                    <div className="result-divider" />

                    <p className="result-guidance">
                        {response.guidance}
                    </p>
                </motion.div>
            </div>

            {/* Fixed Bottom CTA */}
            <div className="fixed-bottom-cta" style={{ backgroundColor: 'var(--grey-100)' }}>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/history')}
                >
                    기록 보기
                </button>
            </div>
        </div>
    );
}
