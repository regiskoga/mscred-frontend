import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    Store,
    LogOut,
    Menu,
    X,
    UserCircle
} from 'lucide-react';

export function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    // Add reactivity for Avatar updates
    const [userData, setUserData] = useState<any>(() => {
        const storedUser = localStorage.getItem('@mscred:user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        const handleProfileUpdate = () => {
            const storedUser = localStorage.getItem('@mscred:user');
            if (storedUser) {
                setUserData(JSON.parse(storedUser));
                setAvatarError(false);
            }
        };
        window.addEventListener('mscred:profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('mscred:profileUpdated', handleProfileUpdate);
    }, []);

    // Auth State Validation (Zero-Trust Frontend)
    if (!userData) {
        navigate('/login', { replace: true });
        return null;
    }

    const { name, role, avatar_url } = userData;

    // RBAC Permissions
    const canManageUsers = ['ADMIN', 'GESTOR'].includes(role);
    const canManageStores = role === 'ADMIN';

    // Menu Definitions
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
        { name: 'Atendimentos', href: '/dashboard/attendances', icon: FileText, show: true },
        { name: 'Colaboradores', href: '/dashboard/users', icon: Users, show: canManageUsers },
        { name: 'Lojas', href: '/dashboard/stores', icon: Store, show: canManageStores },
    ];

    function handleLogout() {
        localStorage.removeItem('@mscred:token');
        localStorage.removeItem('@mscred:user');
        navigate('/login', { replace: true });
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Desktop & Mobile */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-20 px-4 bg-slate-950/80 border-b border-slate-800 relative shadow-sm">
                    <img src="/logo.png" alt="MSCRED" className="max-h-12 w-auto object-contain drop-shadow-md" />
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute right-4 text-slate-300 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col flex-1 px-4 mt-8 space-y-2">
                    {navigation.filter(item => item.show).map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-mscred-orange text-white shadow-md'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sm:px-6 lg:px-8 shadow-sm relative z-10">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-slate-500 hover:text-slate-700 lg:hidden p-2 -ml-2 rounded-md"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center space-x-4 ml-auto">
                        <div className="flex flex-col items-end mr-2 hidden sm:flex">
                            <span className="text-sm font-semibold text-slate-800">{name}</span>
                            <span className="text-xs font-medium px-2 py-0.5 mt-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                {role}
                            </span>
                        </div>

                        <Link to="/dashboard/profile" title="Meu Perfil" className="h-10 w-10 shrink-0 bg-slate-100 border-2 border-slate-200 rounded-full flex items-center justify-center text-mscred-blue hover:border-mscred-orange transition-all overflow-hidden shadow-sm">
                            {avatar_url && !avatarError ? (
                                <img
                                    src={avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <span className="text-sm font-bold tracking-tight">{name ? name.substring(0, 2).toUpperCase() : 'ME'}</span>
                            )}
                        </Link>

                        <div className="h-6 w-px bg-slate-200 mx-2"></div>

                        <button
                            onClick={handleLogout}
                            title="Sair do Sistema"
                            className="flex items-center text-slate-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Render View (Outlet) */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

