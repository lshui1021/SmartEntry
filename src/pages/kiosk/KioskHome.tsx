import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, LogOut, History } from 'lucide-react';

const KioskHome: React.FC = () => {
    const navigate = useNavigate();

    // 共用按鈕樣式
    const baseCardStyle: React.CSSProperties = {
        padding: '24px',
        border: '3px solid var(--primary-color)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%'
    };

    const handleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
    };

    const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            gap: '20px 40px',
            padding: '0 20px'
        }}>
            <h1 style={{
                fontSize: '2rem',
                color: 'var(--primary-color)',
                marginBottom: '8px',
                textAlign: 'center'
            }}>
                訪客登記系統
            </h1>

            <div style={{
                display: 'flex',
                gap: '28px',
                width: '100%',
                maxWidth: '800px'
            }}>
                {/* 訪客報到 */}
                <button
                    onClick={() => navigate('/kiosk/dashboard?tab=checkin')}
                    className="card"
                    style={{ ...baseCardStyle, flex: 1 }}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                >
                    <div style={{ textAlign: 'center' }}>
                        <Calendar size={48} style={{ color: 'var(--primary-color)', marginBottom: '4px' }} />
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'var(--primary-color)',
                            marginBottom: '10px'
                        }}>訪客報到</h2>
                    </div>
                </button>

                {/* 辦理離場 */}
                <button
                    onClick={() => navigate('/kiosk/dashboard?tab=checkout')}
                    className="card"
                    style={{ ...baseCardStyle, flex: 1 }}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                >
                    <div style={{ textAlign: 'center' }}>
                        <LogOut size={48} style={{ color: 'var(--primary-color)', marginBottom: '4px' }} />
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'var(--primary-color)',
                            marginBottom: '10px'
                        }}>辦理離場</h2>
                    </div>
                </button>
            </div>

            {/* 下方單獨按鈕：100% - 歷史查詢 */}
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <button
                    onClick={() => navigate('/kiosk/dashboard?tab=history')}
                    className="card"
                    style={{ ...baseCardStyle, width: '100%' }}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                >
                    <div style={{ textAlign: 'center' }}>
                        <History size={48} style={{ color: 'var(--primary-color)' }} />
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'var(--primary-color)',
                            marginBottom: '4px'
                        }}>歷史紀錄</h2>
                    </div>
                </button>
            </div>

        </div>
    );
};

export default KioskHome;
