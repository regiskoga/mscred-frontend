import { useState, useEffect } from 'react';
import { Plus, Users as UsersIcon, Building2, Trash2, Mail, ShieldAlert, BadgeCheck, Loader2, X } from 'lucide-react';
import { api } from '../lib/axios';

interface Store {
    id: number;
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: { id: number, name: string };
    store: Store | null;
    created_at: string;
}

export function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Auth State validation
    const storedUser = localStorage.getItem('@mscred:user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const canManageStores = currentUser?.role === 'ADMIN';

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('');
    const [storeId, setStoreId] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
        if (canManageStores) {
            fetchStores();
        }
    }, [canManageStores]);

    async function fetchUsers() {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.users || response.data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchStores() {
        try {
            const response = await api.get('/stores');
            setStores(response.data.stores || response.data);
        } catch (error) {
            console.error('Failed to load stores:', error);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Senha temporária deve ter no mínimo 6 caracteres.');
            return;
        }

        try {
            setSubmitting(true);
            const payload: any = {
                name,
                email,
                password,
                role_id: parseInt(roleId, 10),
            };

            if (storeId) {
                payload.store_id = parseInt(storeId, 10);
            }

            await api.post('/users', payload);

            // Refetch and close
            await fetchUsers();
            setIsModalOpen(false);

            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setRoleId('');
            setStoreId('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao criar colaborador. Verifique os dados (E-mail único).');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string, userName: string) {
        if (!confirm(`Auditoria Zero-Trust: Tem certeza que deseja INATIVAR (Soft Delete) o perfil de ${userName}? O registro será bloqueado permanentemente, mas o histórico mantido.`)) {
            return;
        }

        try {
            await api.delete(`/users/${id}`);
            // Update table without full reload payload
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error('Failed to soft-delete user:', err);
            alert('Não foi possível inativar o colaborador. Tente novamente ou contate T.I.');
        }
    }

    // Role ID Maps based on Prisma Seed Order
    // 1: ADMIN, 2: GESTOR, 3: OPERADOR
    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'GESTOR': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-bmg-blue" />
                        Quadro de Colaboradores
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Gerencie a equipe e defina privilégios na hierarquia do ERP.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-lg shadow-sm bg-bmg-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bmg-orange"
                >
                    <Plus className="w-4 h-4 mr-2 -ml-1" />
                    Novo Colaborador
                </button>
            </div>

            {/* Table */}
            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden border border-slate-200 shadow-sm sm:rounded-2xl bg-white">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Nome & E-mail
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Cargo (RBAC)
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Lotação (Loja)
                                        </th>
                                        <th scope="col" className="relative px-6 py-4 text-right">
                                            <span className="sr-only">Ações</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex justify-center items-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-bmg-blue" />
                                                    <span className="ml-2">Buscando quadros funcionais...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                Nenhum colaborador alocado visível.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                                            <span className="text-sm font-bold text-slate-500 uppercase">
                                                                {u.name.substring(0, 2)}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-slate-900">{u.name}</div>
                                                            <div className="text-sm text-slate-500 flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {u.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(u.role?.name || '')}`}>
                                                        {u.role?.name === 'ADMIN' && <ShieldAlert className="w-3 h-3 mr-1" />}
                                                        {u.role?.name === 'GESTOR' && <BadgeCheck className="w-3 h-3 mr-1" />}
                                                        {u.role?.name || 'DESCONHECIDO'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {u.store ? (
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="w-4 h-4 text-slate-400" />
                                                            {u.store.name}
                                                        </div>
                                                    ) : (
                                                        <span className="italic">Acesso Global</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {/* Hide delete button if it's the current user preventing self-deletion lockouts */}
                                                    {currentUser?.id !== u.id && (
                                                        <button
                                                            onClick={() => handleDelete(u.id, u.name)}
                                                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors border border-red-100"
                                                            title="Soft Delete (Inativar)"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-slate-900/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} aria-hidden="true"></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bmg-blue">
                                    <span className="sr-only">Fechar</span>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start">
                                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-orange-50 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                                    <UsersIcon className="w-6 h-6 text-bmg-orange" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900" id="modal-title">
                                        Novo Colaborador
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-slate-500">
                                            Atenção: A geração é Zero-Trust. O colaborador criado terá acesso de acordo com o Role atribuído.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreate} className="mt-5 sm:mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nome Oficial</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Login (E-mail corporativo)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Senha Provisória Gerada Pelo RH</label>
                                    <input
                                        type="text"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 6 caracteres"
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm font-mono"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Cargo de Acesso</label>
                                        <select
                                            value={roleId}
                                            onChange={(e) => setRoleId(e.target.value)}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm bg-white"
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="3">OPERADOR (Vendas)</option>
                                            <option value="2">GESTOR (Loja)</option>
                                            <option value="1">ADMINISTRADOR</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Lotação na Loja</label>
                                        <select
                                            value={storeId}
                                            onChange={(e) => setStoreId(e.target.value)}
                                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm bg-white"
                                            required={roleId !== '1'} // Required unless admin
                                            disabled={roleId === '1'} // Admins dont need stores
                                        >
                                            <option value="">{roleId === '1' ? 'Acesso Global' : 'Selecione...'}</option>
                                            {stores.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t border-slate-200 pt-5">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-bmg-orange text-base font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bmg-orange sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {submitting ? 'Emitindo...' : 'Cadastrar Colaborador'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bmg-blue sm:mt-0 sm:w-auto sm:text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
