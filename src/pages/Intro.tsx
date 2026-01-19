import { useNavigate } from 'react-router-dom';

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* Top Section */}
      <div className="top-section">
        <h1 className="top-title">
          매일 기록하는<br />나만의 기도 노트
        </h1>
      </div>

      {/* Content Area */}
      <div className="content-section">
        {/* Link to History */}
        <div style={{ padding: '8px 0' }}>
          <button
            className="link-button"
            onClick={() => navigate('/history')}
          >
            나의 기록 보기
            <span style={{ fontSize: '12px' }}>›</span>
          </button>
        </div>

        {/* Prayer Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <div className="icon-circle">
            🙏
          </div>
        </div>

        {/* How to Use Section */}
        <div>
          <h2 className="section-title">어떻게 사용하나요?</h2>

          <div className="step-list">
            {/* Step 1 */}
            <div className="step-item">
              <div className="step-indicator">
                <div className="step-number">1</div>
                <div className="step-line" />
              </div>
              <div className="step-text">마음 속 거친 파도같은 고민을 적고</div>
            </div>

            {/* Step 2 */}
            <div className="step-item">
              <div className="step-indicator">
                <div className="step-number">2</div>
                <div className="step-line" />
              </div>
              <div className="step-text">AI가 전하는 따뜻한 위로를 듣고</div>
            </div>

            {/* Step 3 */}
            <div className="step-item">
              <div className="step-indicator">
                <div className="step-number">3</div>
              </div>
              <div className="step-text">매일의 은혜를 기록으로 남겨요</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed-bottom-cta">
        <button
          className="btn-primary"
          onClick={() => navigate('/write')}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
