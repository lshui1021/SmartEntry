import React from 'react';
import { Outlet } from 'react-router-dom';

const KioskLayout: React.FC = () => {
    return (
        <div className="kiosk-container">
            <header style={{ textAlign: 'center', marginBottom: '8px' }}>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default KioskLayout;
