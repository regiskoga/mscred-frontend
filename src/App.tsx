import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
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
                    {/* Futuras rotas aqui (e.g. /dashboard/users) */}
                </Route>
            </Route>
        </Routes>
    );
}
