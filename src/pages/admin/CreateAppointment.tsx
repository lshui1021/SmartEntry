import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    Clock, 
    User, 
    Users, 
    Building, 
    Save, 
    X,
    ChevronDown,
    AlertCircle,
    Phone
} from 'lucide-react';

// --- Types ---
interface AppointmentForm {
    hostId: number;
    vendorName: string;
    visitorName: string;
    visitorCount: number;
    visitDate: string;
    visitTimeStart: string;
    visitTimeEnd: string;
    locationId: number;
    extension: string; // Added extension field
    purpose?: string;
}

interface FormErrors {
    [key: string]: string;
}

// --- Components---

const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        fontSize: '14px', 
        fontWeight: 600, 
        color: '#374151' // Gray-700
    }}>
        {children}
        {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
    </label>
);

const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => {
    if (!message) return null;
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            marginTop: '6px', 
            color: '#ef4444', 
            fontSize: '13px'
        }}>
            <AlertCircle size={14} />
            <span>{message}</span>
        </div>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

const InputField: React.FC<InputProps> = ({ label, error, icon, style, ...props }) => (
    <div style={{ marginBottom: '20px' }}>
        <Label required={props.required}>{label}</Label>
        <div style={{ position: 'relative' }}>
            <input
                {...props}
                style={{
                    width: '100%',
                    minWidth: '260px',
                    maxWidth: '320px',
                    padding: '10px 12px',
                    paddingLeft: icon ? '38px' : '12px',
                    borderRadius: '6px',
                    border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`, // Gray-300
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    backgroundColor: '#fff',
                    color: '#111827',
                    ...style
                }}
                onFocus={(e) => {
                    if (!error) e.target.style.borderColor = '#3b82f6'; // Blue-500
                    e.target.style.boxShadow = error ? 'none' : '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                }}
            />
            {icon && (
                <div style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#9ca3af', // Gray-400
                    pointerEvents: 'none'
                }}>
                    {icon}
                </div>
            )}
        </div>
        <ErrorMessage message={error} />
    </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
    options: { value: string | number; label: string }[];
}

const SelectField: React.FC<SelectProps> = ({ label, error, icon, options, ...props }) => (
    <div style={{ marginBottom: '20px' }}>
        <Label required={props.required}>{label}</Label>
        <div style={{ position: 'relative' }}>
            <select
                {...props}
                style={{
                    width: '100%',
                    padding: '10px 36px',
                    borderRadius: '4px',
                    border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
                    fontSize: '16px',
                    appearance: 'none',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    color: '#111827'
                }}
                onFocus={(e) => {
                    if (!error) e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = error ? 'none' : '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                }}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {/* Left Icon */}
            <div style={{ 
                position: 'absolute', 
                left: '8px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af',
                pointerEvents: 'none'
            }}>
                {icon || <Building size={18} />}
            </div>
            {/* Dropdown Arrow */}
            <div style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af',
                pointerEvents: 'none'
            }}>
                <ChevronDown size={16} />
            </div>
        </div>
        <ErrorMessage message={error} />
    </div>
);

// --- Main Component ---

const CreateAppointment: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<AppointmentForm>({
        hostId: 1,
        vendorName: '',
        visitorName: '',
        visitorCount: 1,
        visitDate: new Date().toISOString().split('T')[0], // Default today
        visitTimeStart: '09:00',
        visitTimeEnd: '10:00',
        locationId: 1,
        extension: '',
        purpose: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        
        if (!formData.vendorName.trim()) newErrors.vendorName = '請輸入單位名稱';
        if (!formData.visitorName.trim()) newErrors.visitorName = '請輸入訪客姓名';
        if (formData.visitorCount < 1) newErrors.visitorCount = '訪客人數至少為 1';
        if (!formData.visitDate) newErrors.visitDate = '請選擇訪問日期';
        if (!formData.visitTimeStart) newErrors.visitTimeStart = '請選擇開始時間';
        if (!formData.visitTimeEnd) newErrors.visitTimeEnd = '請選擇結束時間';
        
        if (formData.visitTimeStart && formData.visitTimeEnd) {
            if (formData.visitTimeEnd <= formData.visitTimeStart) {
                newErrors.visitTimeEnd = '結束時間必須晚於開始時間';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            console.log('Creating appointment:', formData);
            alert('預約建立成功！');
            navigate('/admin/appointments');
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <header style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ 
                            background: 'none', 
                            border: '1px solid #e5e7eb', 
                            cursor: 'pointer', 
                            padding: '8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#4b5563',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                    >
                        <X size={20} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#111827' }}>新增預約紀錄</h1>
                </div>
                <p style={{ margin: 0, paddingLeft: '56px', color: '#6b7280', fontSize: '16px' }}>
                    請填寫以下資訊以建立新的訪客預約紀錄。
                </p>
            </header>

            <form onSubmit={handleSubmit}>
                {/* 1: 接待人 */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '4px', 
                    border: '1px solid #e5e7eb',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '18px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        接待窗口
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                        <SelectField
                            label="員工 (系統帶入)"
                            name="hostId"
                            value={formData.hostId}
                            onChange={handleInputChange}
                            icon={<User size={18} />}
                            options={[
                                { value: 1, label: 'Alice Smith' },
                            ]}
                        />
                        <SelectField
                            label="部門 (系統帶入)"
                            name="locationId" 
                            value={formData.locationId}
                            onChange={handleInputChange}
                            icon={<Building size={18} />}
                            options={[
                                { value: 1, label: '資訊部' }
                            ]}
                        />
                        <InputField
                            label="分機"
                            name="extension"
                            value={formData.extension}
                            onChange={handleInputChange}
                            placeholder="例如: 1234"
                            icon={<Phone size={18} />}
                        />
                    </div>
                </div>

                {/* 2: 訪客資訊 */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '4px', 
                    border: '1px solid #e5e7eb',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '18px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        訪客資訊
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                        <InputField
                            label="單位名稱"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleInputChange}
                            placeholder="例如：格斯科技, 個人"
                            error={errors.vendorName}
                            icon={<Building size={18} />}
                        />

                        <InputField
                            label="主要訪客姓名"
                            name="visitorName"
                            value={formData.visitorName}
                            onChange={handleInputChange}
                            placeholder="請輸入訪客全名"
                            error={errors.visitorName}
                            icon={<User size={18} />}
                        />

                        <InputField
                            label="人數"
                            type="number"
                            name="visitorCount"
                            value={formData.visitorCount}
                            onChange={handleInputChange}
                            min="1"
                            error={errors.visitorCount}
                            icon={<Users size={18} />}
                        />
                    </div>
                </div>

                {/* 3: 時間與地點 */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    padding: '32px',
                    marginBottom: '32px'
                }}>
                    <h3 style={{ 
                        marginTop: 0, 
                        marginBottom: '24px', 
                        fontSize: '18px', 
                        fontWeight: 600, 
                        color: '#111827', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                    }}>
                        <div style={{ width: '4px', height: '18px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        時間與地點
                    </h3>

                    <div style={{ marginBottom: '24px' }}>
                        <InputField
                            label="訪問日期"
                            type="date"
                            name="visitDate"
                            value={formData.visitDate}
                            onChange={handleInputChange}
                            error={errors.visitDate}
                            icon={<Calendar size={18} />}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <InputField
                            label="開始時間"
                            type="time"
                            name="visitTimeStart"
                            value={formData.visitTimeStart}
                            onChange={handleInputChange}
                            error={errors.visitTimeStart}
                            icon={<Clock size={18} />}
                        />

                        <InputField
                            label="結束時間"
                            type="time"
                            name="visitTimeEnd"
                            value={formData.visitTimeEnd}
                            onChange={handleInputChange}
                            error={errors.visitTimeEnd}
                            icon={<Clock size={18} />}
                        />
                    </div>

                    <div>
                        <SelectField
                            label="會議地點"
                            name="locationId"
                            value={formData.locationId}
                            onChange={handleInputChange}
                            icon={<Building size={18} />}
                            options={[
                                { value: 1, label: '辦公室' },
                                { value: 2, label: '會議室201' },
                                { value: 3, label: '會議室202' }
                            ]}
                        />
                    </div>
                </div>

                 {/* 3: 時間與地點 */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    padding: '32px',
                    marginBottom: '32px'
                }}>
                    <h3 style={{ 
                        marginTop: 0, 
                        marginBottom: '24px', 
                        fontSize: '18px', 
                        fontWeight: 600, 
                        color: '#111827', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                    }}>
                        <div style={{ width: '4px', height: '18px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        備註
                    </h3>
                     <div style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>


                {/* 操作 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/appointments')}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#3b82f6', // Blue-500
                            color: 'white',
                            cursor: isSubmitting ? 'wait' : 'pointer',
                            fontSize: '15px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'} // Blue-600
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        <Save size={18} />
                        {isSubmitting ? '處理中...' : '確認預約'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAppointment;

