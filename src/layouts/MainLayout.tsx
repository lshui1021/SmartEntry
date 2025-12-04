import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Calendar, FilePlus, FileText, Users, LogOut } from 'lucide-react';

const MainLayout: React.FC = () => {
    // Mock Role: Change this to 'receptionist', 'guard', or 'admin' to test
    const userRole: string = 'admin';

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ margin: 0 }}>SmartEntry</h2>
                    <div style={{ fontSize: '1rem',paddingBottom: '8px' }}>訪客預約系統</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{userRole.toUpperCase()} Console</div>
                </div>
                <nav style={{ flex: 1, padding: '20px 0' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {(userRole === 'receptionist' || userRole === 'admin') && (
                            <>
                                <li>
                                    <Link to="/admin/appointments/new" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', color: 'white', textDecoration: 'none', transition: 'background 0.2s' }}>
                                        <FilePlus size={20} /> 新增預約
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/appointments" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', color: 'white', textDecoration: 'none', transition: 'background 0.2s' }}>
                                        <Calendar size={20} /> 預約管理
                                    </Link>
                                </li>
                            </>
                        )}
                        {(userRole === 'guard' || userRole === 'admin') && (
                            <li>
                                <Link to="/admin/reports" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', color: 'white', textDecoration: 'none', transition: 'background 0.2s' }}>
                                    <FileText size={20} /> 報表管理
                                </Link>
                            </li>
                        )}
                        {userRole === 'admin' && (
                            <>
                                <li>
                                    <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', color: 'white', textDecoration: 'none', transition: 'background 0.2s' }}>
                                        <Users size={20} /> 權限管理
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Link to="/login" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LogOut size={20} /> <span>登出</span>
                    </Link>
                </div>
            </aside>
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
