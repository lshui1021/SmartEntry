import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { walkIn } from '../../services/api';
import { User, Building, FileText, PenTool, Eraser, Send, ArrowLeft } from 'lucide-react';

const WalkIn: React.FC = () => {
    const navigate = useNavigate();
    const sigCanvas = useRef<SignatureCanvas>(null);

    const [formData, setFormData] = useState({
        visitorName: '',
        vendorName: '',
        visitorPhone: '',
        hostId: 1, // Default to first user for demo
        visitorCount: 1,
        purpose: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const clearSignature = () => {
        sigCanvas.current?.clear();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (sigCanvas.current?.isEmpty()) {
            alert('Please sign before registering.');
            return;
        }

        const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

        try {
            await walkIn({ ...formData, signature: signatureData });
            alert('Registration successful!');
            navigate('/kiosk/dashboard?tab=checkin');
        } catch (error) {
            console.error('Registration failed', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/kiosk')}
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
                <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>臨時預約</h2>
                <div style={{ width: '100px' }}></div>
            </div>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <User size={18} color="var(--primary-color)" /> 姓名
                        </label>
                        <input
                            type="text"
                            name="visitorName"
                            value={formData.visitorName}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <Building size={18} color="var(--primary-color)" /> 單位名稱
                        </label>
                        <input
                            type="text"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <FileText size={18} color="var(--primary-color)" /> 事由
                        </label>
                        <input
                            type="text"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <PenTool size={18} color="var(--primary-color)" /> 簽名
                        </label>
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                                backgroundColor="white"
                            />
                        </div>
                        <button type="button" onClick={clearSignature} style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Eraser size={14} /> 清除簽名
                        </button>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Send size={18} /> 新增預約
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WalkIn;
