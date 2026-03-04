import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Stores } from './pages/Stores';
import { Users } from './pages/Users';
import { PrivateRoute } from './components/PrivateRoute';

export function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Rotas Protegidas Administrativas */}
            <Route element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/stores" element={<Stores />} />
                    <Route path="/dashboard/users" element={<Users />} />
                    {/* Futuras rotas aqui (e.g. /dashboard/attendances) */}
                </Route>
            </Route>
        </Routes>
    );
}
