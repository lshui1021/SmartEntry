import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { checkIn, getTodayAppointments } from '../../services/api';
import { PenTool, ArrowRight, ArrowLeft, Check, Eraser, Info, Building, User, Clock } from 'lucide-react';


const CheckIn: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const visitorSigCanvas = useRef<SignatureCanvas>(null);
    const guardSigCanvas = useRef<SignatureCanvas>(null);
    const [visitor, setVisitor] = useState<any>(null);
    // 狀態定義：1: 資訊確認, 2: 訪客簽名, 3: 警衛簽名
    const [step, setStep] = useState<1 | 2 | 3>(1);

    useEffect(() => {
        const loadVisitor = async () => {
            try {
                const data = await getTodayAppointments();
                const appointment = data.find((a: any) => a.id === parseInt(id || '0'));
                setVisitor(appointment);
            } catch (error) {
                console.error('Error loading visitor', error);
            }
        };
        loadVisitor();
    }, [id]);

    const clearVisitorSignature = () => {
        visitorSigCanvas.current?.clear();
    };

    const clearGuardSignature = () => {
        guardSigCanvas.current?.clear();
    };

    // 步驟 1 -> 步驟 2 (警衛確認資訊無誤) 
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

    const handleCheckIn = async () => {
        if (guardSigCanvas.current?.isEmpty()) {
            alert('警衛簽名是完成報到所必需的。');
            return;
        }

        const visitorSignatureData = visitorSigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
        const guardSignatureData = guardSigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

        if (visitorSignatureData && guardSignatureData) {
            try {
                // 假設 checkIn 服務會同時更新狀態、時間和簽名
                await checkIn(parseInt(id || '0'), visitorSignatureData, guardSignatureData);
                alert('報到成功！');
                navigate('/kiosk/dashboard');
            } catch (error) {
                console.error('Check-in failed', error);
                alert('報到失敗。請重試。');
            }
        }
    };

    if (!visitor) return <div>載入中...</div>;
    
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
                <h2 style={{ color: primaryColor, margin: 0 }}>訪客報到流程</h2> {/* 簡化標題 */}
                <div style={{ width: '100px' }}></div>
            </div>

            {/* *** 步驟指示條 (Step Indicator) - 轉換 Tailwind 至內聯樣式 *** */}
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

                    {/* 步驟 3: 警衛簽名 (原代碼中沒有，但邏輯中是步驟 3) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step >= 3 ? primaryColor : secondaryTextColor }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step >= 3 ? primaryColor : inactiveBgColor, color: step >= 3 ? 'white' : 'black' }}>
                            3
                        </div>
                        <span style={{ display: 'none' }}>警衛確認</span>
                    </div>

                </div>
            </div>

            {/* 確認基本資訊畫面*/}
            {step === 1 && (
                <div className="card" style={{ padding: '30px', border: '1px solid #ddd' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px',marginBottom: '20px', color: primaryColor }}>
                        <Info size={20} /> 訪客資訊
                    </h3>
                    
                    <div style={{ margin: '20px 0', padding: '15px', borderLeft: `3px solid ${primaryColor}`, backgroundColor: '#f8f9fa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={20} color={primaryColor}/>
                        <p>訪客姓名: {visitor.visitor.contactName}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building size={20} color={primaryColor}/>
                        <p>單位名稱:</p>
                        <p>{visitor.visitor.vendorName}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={20} color={primaryColor}/>
                        <p>接待窗口: {visitor.user.employeeName}</p>
                        </div> 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={20} color={primaryColor}/>
                        <p>預計時段: {new Date(visitor.scheduleStartTime).toLocaleString('zh-TW')} - {new Date(visitor.scheduleEndTime).toLocaleString('zh-TW')}</p>
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
                    <p>請於下方簽名板簽名</p>
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
                        
                        <button onClick={handleCheckIn} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: primaryColor, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                            <Check size={16} /> 確認報到
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckIn;