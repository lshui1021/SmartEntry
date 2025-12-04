import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import KioskLayout from './layouts/KioskLayout';
import KioskHome from './pages/kiosk/KioskHome';
import Dashboard from './pages/kiosk/Dashboard';
import Login from './pages/auth/Login';
import Appointments from './pages/admin/Appointments';
import UserManagement from './pages/admin/UserManagement';
import CheckIn from './pages/kiosk/CheckIn';
import WalkIn from './pages/kiosk/WalkIn';
import CheckOut from './pages/kiosk/CheckOut';
import Reports from './pages/admin/Reports';
import CreateAppointment from './pages/admin/CreateAppointment';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<MainLayout />}>
                    <Route index element={<Navigate to="appointments" />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="appointments/new" element={<CreateAppointment />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="users" element={<UserManagement />} />
                </Route>

                {/* Kiosk Routes */}
                <Route path="/kiosk" element={<KioskLayout />}>
                    <Route index element={<KioskHome />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="checkin/:id" element={<CheckIn />} />
                    <Route path="checkout/:id" element={<CheckOut />} />
                    <Route path="walkin" element={<WalkIn />} />
                </Route>

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/kiosk" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
