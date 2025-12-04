import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { checkOut, getTodayAppointments } from '../../services/api';
import { PenTool, ArrowRight, ArrowLeft, Check, Eraser, CircleCheck, X } from 'lucide-react';

interface VisitorData {
    id: number;
    visitor: {
        contactName: string;
        vendorName: string;
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
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'visitor' | 'guard' | 'success'>('visitor');
    const [checkOutTime, setCheckOutTime] = useState<string>('');

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
            } finally {
                setLoading(false);
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

    const handleVisitorSignComplete = () => {
        if (visitorSigCanvas.current?.isEmpty()) {
            alert('Please sign before proceeding.');
            return;
        }
        setStep('guard');
    };

    const handleCheckOut = async () => {
        if (guardSigCanvas.current?.isEmpty()) {
            alert('Guard signature is required to complete check-out.');
            return;
        }

        const visitorSignatureData = visitorSigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
        const guardSignatureData = guardSigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

        if (visitorSignatureData && guardSignatureData && visitorData) {
            try {
                await checkOut(visitorData.id, visitorSignatureData, guardSignatureData);
                setCheckOutTime(new Date().toISOString());
                setStep('success');
            } catch (error) {
                console.error('Check-out failed', error);
                alert('Check-out failed. Please try again.');
            }
        }
    };

    const handleBackToHome = () => {
        navigate('/kiosk');
    };

    if (loading) return <div>Loading...</div>;
    if (!visitorData) return <div>Visitor not found</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
                <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>辦理離場</h2>
                <div style={{ width: '100px' }}></div>
            </div>
            {/* Visitor Signature Step */}
            {step === 'visitor' && (
                <div className="card">
                    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0 }}>Visitor Information</h3>
                        <p><strong>Name:</strong> {visitorData.visitor.contactName}</p>
                        <p><strong>Company:</strong> {visitorData.visitor.vendorName}</p>
                        <p style={{ marginBottom: 0 }}>
                            <strong>Check-in Time:</strong>{' '}
                            {new Date(visitorData.actualEnterTime || visitorData.scheduleStartTime).toLocaleString('zh-TW', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>

                    <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PenTool size={20} color="var(--primary-color)" /> Visitor Signature (Sign-out)
                    </h3>
                    <div style={{
                        border: '2px solid #ccc',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <SignatureCanvas
                            ref={visitorSigCanvas}
                            canvasProps={{ width: 700, height: 250, className: 'sigCanvas' }}
                            backgroundColor="white"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => navigate('/kiosk/dashboard')}
                            style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <X size={16} /> Cancel
                        </button>
                        <button
                            onClick={clearVisitorSignature}
                            style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Eraser size={16} /> Clear
                        </button>
                        <button
                            onClick={handleVisitorSignComplete}
                            className="btn-primary"
                            style={{ padding: '12px 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            Next: Guard Signature <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Guard Signature Step */}
            {step === 'guard' && (
                <div className="card">
                    <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>Guard Confirmation</h2>

                    <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
                        Visitor <strong>{visitorData.visitor.contactName}</strong> has signed out.
                    </p>

                    <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PenTool size={20} color="var(--primary-color)" /> Guard Signature (Finalize)
                    </h3>
                    <div style={{
                        border: '2px solid #ccc',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <SignatureCanvas
                            ref={guardSigCanvas}
                            canvasProps={{ width: 700, height: 250, className: 'sigCanvas' }}
                            backgroundColor="white"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setStep('visitor')}
                            style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <button
                            onClick={clearGuardSignature}
                            style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Eraser size={16} /> Clear
                        </button>
                        <button
                            onClick={handleCheckOut}
                            className="btn-primary"
                            style={{ padding: '12px 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Check size={16} /> Confirm Check-out (結案送出)
                        </button>
                    </div>
                </div>
            )}

            {/* Success Screen */}
            {step === 'success' && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
                        <CircleCheck size={100} color="var(--success-color)" style={{ margin: '0 auto' }} />
                    </div>

                    <h2 style={{ color: 'var(--success-color)', marginBottom: '30px', fontSize: '2rem' }}>
                        Check-out Successful!
                    </h2>

                    <div style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '30px',
                        marginBottom: '40px',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Visitor Details</h3>

                        <div style={{ fontSize: '1.2rem', lineHeight: '2' }}>
                            <p>
                                <strong>Name:</strong> {visitorData.visitor.contactName}
                            </p>
                            <p>
                                <strong>Company:</strong> {visitorData.visitor.vendorName}
                            </p>
                            <p>
                                <strong>Entry Time:</strong>{' '}
                                {new Date(visitorData.actualEnterTime || visitorData.scheduleStartTime).toLocaleString('zh-TW', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </p>
                            <p style={{ marginBottom: 0 }}>
                                <strong>Exit Time:</strong>{' '}
                                {new Date(checkOutTime).toLocaleString('zh-TW', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleBackToHome}
                        className="btn-primary"
                        style={{
                            padding: '15px 40px',
                            fontSize: '1.2rem',
                            minWidth: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            margin: '0 auto'
                        }}
                    >
                        <Check size={20} /> Confirm (確認)
                    </button>
                </div>
            )}
        </div>
    );
};

export default CheckOut;
