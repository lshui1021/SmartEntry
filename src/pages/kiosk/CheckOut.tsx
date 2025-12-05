import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { checkOut, getTodayAppointments } from '../../services/api';
import { PenTool, ArrowRight, ArrowLeft, Check, Eraser, Info, Building, User, Clock } from 'lucide-react';

interface VisitorData {
    id: number;
    visitor: {
        contactName: string;
        vendorName: string;
    };
    user: {
        employeeName: string;
    };
    actualEnterTime: string;
    scheduleStartTime: string;
}

const CheckOut: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const visitorSigCanvas = useRef<SignatureCanvas>(null);
    const guardSigCanvas = useRef<SignatureCanvas>(null);

    const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
    // 狀態定義：1: 資訊確認, 2: 訪客簽名, 3: 警衛簽名
    const [step, setStep] = useState<1 | 2 | 3>(1);

    useEffect(() => {
        const loadVisitor = async () => {
            try {
                const data = await getTodayAppointments();
                const visitor = data.find((a: any) => a.id === Number(id));
                if (visitor) {
                    setVisitorData(visitor);
                } else {
                    alert('Visitor not found');
                    navigate('/kiosk/dashboard');
                }
            } catch (error) {
                console.error('Error loading visitor', error);
            }
        };
        loadVisitor();
    }, [id, navigate]);

    const clearVisitorSignature = () => {
        visitorSigCanvas.current?.clear();
    };

    const clearGuardSignature = () => {
        guardSigCanvas.current?.clear();
    };

    // 步驟 1 -> 步驟 2 (確認資訊無誤)
    const handleInfoConfirm = () => {
        setStep(2);
    };

    // 步驟 2 -> 步驟 3 (訪客簽名完成)
    const handleVisitorSignComplete = () => {
        if (visitorSigCanvas.current?.isEmpty()) {
            alert('訪客簽名前，請先完成簽名。');
            return;
        }
        setStep(3);
    };

    const handleCheckOut = async () => {
        if (guardSigCanvas.current?.isEmpty()) {
            alert('警衛簽名是完成離場手續所必需的。');
            return;
        }

        const visitorSignatureData = visitorSigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
        const guardSignatureData = guardSigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

        if (visitorSignatureData && guardSignatureData && visitorData) {
            try {
                await checkOut(visitorData.id, visitorSignatureData, guardSignatureData);
                alert('離場手續完成！');
                navigate('/kiosk/dashboard');
            } catch (error) {
                console.error('Check-out failed', error);
                alert('離場失敗。請重試。');
            }
        }
    };

    if (!visitorData) return <div>載入中...</div>;
    
    const primaryColor = '#1E3A8A'; 
    const secondaryTextColor = '#9CA3AF'; 
    const inactiveBgColor = '#E5E7EB'; 

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/kiosk/dashboard')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    <ArrowLeft size={20} /> 返回
                </button>
                <h2 style={{ color: primaryColor, margin: 0 }}>訪客離場流程</h2>
                <div style={{ width: '100px' }}></div>
            </div>

            {/* *** 步驟指示條 (Step Indicator) *** */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>

                    {/* 步驟 1: 確認資訊 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step >= 1 ? primaryColor : secondaryTextColor }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step >= 1 ? primaryColor : inactiveBgColor, color: step >= 1 ? 'white' : 'black' }}>
                            1
                        </div>
                        <span style={{ display: 'none' }}>確認資訊</span>
                    </div>

                    <ArrowRight size={20} style={{ color: secondaryTextColor }} />

                    {/* 步驟 2: 訪客簽名 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step >= 2 ? primaryColor : secondaryTextColor }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step >= 2 ? primaryColor : inactiveBgColor, color: step >= 2 ? 'white' : 'black' }}>
                            2
                        </div>
                        <span style={{ display: 'none' }}>訪客簽名</span>
                    </div>

                    <ArrowRight size={20} style={{ color: secondaryTextColor }} />

                    {/* 步驟 3: 警衛簽名 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step >= 3 ? primaryColor : secondaryTextColor }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step >= 3 ? primaryColor : inactiveBgColor, color: step >= 3 ? 'white' : 'black' }}>
                            3
                        </div>
                        <span style={{ display: 'none' }}>警衛確認</span>
                    </div>

                </div>
            </div>

            {/* 確認基本資訊畫面 */}
            {step === 1 && (
                <div className="card" style={{ padding: '30px', border: '1px solid #ddd' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: primaryColor }}>
                        <Info size={20} /> 訪客資訊
                    </h3>
                    
                    <div style={{ margin: '20px 0', padding: '15px', borderLeft: `3px solid ${primaryColor}`, backgroundColor: '#f8f9fa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={20} color={primaryColor}/>
                            <p>訪客姓名: {visitorData.visitor.contactName}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building size={20} color={primaryColor}/>
                            <p>單位名稱: {visitorData.visitor.vendorName}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={20} color={primaryColor}/>
                            <p>接待窗口: {visitorData.user?.employeeName || 'N/A'}</p>
                        </div> 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={20} color={primaryColor}/>
                            <p>簽到時間: {new Date(visitorData.actualEnterTime || visitorData.scheduleStartTime).toLocaleString('zh-TW')}</p>
                        </div>
                    </div>

                    <button onClick={handleInfoConfirm} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem', padding: '12px 25px', backgroundColor: primaryColor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        確認資訊無誤，進行下一步 <ArrowRight size={20} />
                    </button>
                </div>
            )}

            {/* 訪客簽名 */}
            {step === 2 && (
                <div className="card" style={{ padding: '30px', border: '1px solid #ddd' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#28a745' }}>
                        <PenTool size={20} /> 訪客簽名
                    </h3>
                    <p>請於下方簽名板簽名 (確認離場)</p>
                    <div style={{ border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white' }}>
                        <SignatureCanvas
                            ref={visitorSigCanvas}
                            canvasProps={{ width: 600, height: 250, className: 'sigCanvas' }}
                            backgroundColor="white"
                        />
                    </div>
                    <button onClick={clearVisitorSignature} style={{ marginBottom: '24px', fontSize: '0.9rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eraser size={16}  /> 重新簽名
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setStep(1)} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <ArrowLeft size={16} /> 返回確認資訊
                        </button>
                        <button onClick={handleVisitorSignComplete} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                            下一步 <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* 警衛簽名 */}
            {step === 3 && (
                <div className="card" style={{ padding: '30px', border: '1px solid #ddd' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f3ba11e5' }}>
                        <PenTool size={20} /> 警衛簽名
                    </h3>

                    <div style={{ border: '1px solid #ccc', borderRadius: '4px', marginBottom: '4px', backgroundColor: 'white' }}>
                        <SignatureCanvas
                            ref={guardSigCanvas}
                            canvasProps={{ width: 600, height: 250, className: 'sigCanvas' }}
                            backgroundColor="white"
                        />
                    </div>
                      <button onClick={clearGuardSignature} style={{ marginBottom: '24px', fontSize: '0.9rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eraser size={16} /> 重新簽名
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setStep(2)} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <ArrowLeft size={16} /> 返回訪客簽名
                        </button>
                        
                        <button onClick={handleCheckOut} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: primaryColor, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                            <Check size={16} /> 確認離場
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckOut;
