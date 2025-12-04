import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const Login: React.FC = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Login Logic
        if (employeeId && password) {
            localStorage.setItem('user', JSON.stringify({ employeeId, role: 'admin' }));
            navigate('/admin/appointments');
        } else {
            alert('Please enter Employee ID and Password');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'var(--accent-color)'
        }}>
            <div className="card" style={{ width: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Building2 size={36} style={{ justifyContent: 'center', color: 'var(--primary-color)' }} />
                    <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '4px' }}>SmartEntry</h2>
                    <p style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '20px' }}>訪客預約系統</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>工號</label>
                        <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>登入</button>
                </form>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <a href="/kiosk" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Switch to Kiosk Mode</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
