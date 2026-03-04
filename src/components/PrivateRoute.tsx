import { Navigate, Outlet } from 'react-router-dom';

export function PrivateRoute() {
    // Zero-Trust Frontend: Check if the token exists to allow rendering the protected layout.
    // If not, redirect immediately to login.
    const token = localStorage.getItem('@mscred:token');

    // Módulos futuros poderão adicionar verificação de expiração JWT local aqui antes do backend negar.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

