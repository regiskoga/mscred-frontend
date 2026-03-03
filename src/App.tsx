import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';

export function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<div>Dashboard Principal (Placeholder)</div>} />
        </Routes>
    );
}
