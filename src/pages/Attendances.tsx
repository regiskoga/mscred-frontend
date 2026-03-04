import { useState, useEffect } from 'react';
import { Plus, Briefcase, Calendar, CreditCard, Banknote, MapPin, User, Loader2, X, CheckCircle, Search } from 'lucide-react';
import { api } from '../lib/axios';

// Interfaces baseadas no Prisma Schema
interface CatalogItem {
    id: number;
    name: string;
}

interface Attendance {
    id: string;
    customer_name: string;
    customer_cpf: string;
    attendance_date: string;
    product: CatalogItem;
    operation_type: CatalogItem;
    attendance_status: CatalogItem;
    sales_channel: CatalogItem;
    paid_approved: boolean;
    city: string;
    origin_bank: string | null;
    user: { name: string };
    store: { name: string };
    created_at: string;
}

export function Attendances() {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Catalog States
    const [products, setProducts] = useState<CatalogItem[]>([]);
    const [operationTypes, setOperationTypes] = useState<CatalogItem[]>([]);
    const [attendanceStatuses, setAttendanceStatuses] = useState<CatalogItem[]>([]);
    const [salesChannels, setSalesChannels] = useState<CatalogItem[]>([]);

    // Form states
    const [customerName, setCustomerName] = useState('');
    const [customerCpf, setCustomerCpf] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [productId, setProductId] = useState('');
    const [operationTypeId, setOperationTypeId] = useState('');
    const [attendanceStatusId, setAttendanceStatusId] = useState('');
    const [salesChannelId, setSalesChannelId] = useState('');
    const [paidApproved, setPaidApproved] = useState(false);
    const [city, setCity] = useState('');
    const [originBank, setOriginBank] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendances();
        fetchCatalogs();
    }, []);

    async function fetchAttendances() {
        try {
            setLoading(true);
            const response = await api.get('/attendances');
            setAttendances(response.data.attendances || response.data);
        } catch (error) {
            console.error('Failed to load attendances:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCatalogs() {
        try {
            const [prodRes, opRes, statusRes, channelRes] = await Promise.all([
                api.get('/catalogs/products'),
                api.get('/catalogs/operation-types'),
                api.get('/catalogs/attendance-statuses'),
                api.get('/catalogs/sales-channels'),
            ]);

            setProducts(prodRes.data.products || prodRes.data);
            setOperationTypes(opRes.data.operation_types || opRes.data);
            setAttendanceStatuses(opRes.data.attendance_statuses || statusRes.data); // Fixed typical typo fallback
            setSalesChannels(channelRes.data.sales_channels || channelRes.data);
        } catch (error) {
            console.error('Failed to load catalogs:', error);
        }
    }

    // A simple CPF mask to clean before sending (Zeros, dots)
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.slice(0, 11);
        setCustomerCpf(val);
    };

    const formatCpfView = (cpf: string) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (customerCpf.length !== 11) {
            setError('O CPF do cliente deve conter exatamente 11 números, sem pontos.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                customer_name: customerName,
                customer_cpf: customerCpf,
                attendance_date: new Date(attendanceDate).toISOString(),
                product_id: parseInt(productId, 10),
                operation_type_id: parseInt(operationTypeId, 10),
                attendance_status_id: parseInt(attendanceStatusId, 10),
                sales_channel_id: parseInt(salesChannelId, 10),
                paid_approved: paidApproved,
                city,
                origin_bank: originBank.trim() || undefined,
            };

            await api.post('/attendances', payload);

            // Refetch and close
            await fetchAttendances();
            setIsModalOpen(false);

            // Reset form
            setCustomerName('');
            setCustomerCpf('');
            setProductId('');
            setOperationTypeId('');
            setAttendanceStatusId('');
            setSalesChannelId('');
            setPaidApproved(false);
            setCity('');
            setOriginBank('');
        } catch (err: any) {
            // Tratamento robusto para Admins que tentam registrar venda sem Store vinculada (Abort)
            setError(err.response?.data?.message || 'Erro ao registrar atendimento. Valide os campos.');
        } finally {
            setSubmitting(false);
        }
    }

    const filteredAttendances = attendances.filter(a =>
        a.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.customer_cpf.includes(searchTerm) ||
        a.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('pago') || s.includes('aprovado')) return 'bg-emerald-100 text-emerald-700';
        if (s.includes('negado')) return 'bg-red-100 text-red-700';
        if (s.includes('análise') || s.includes('desbloquear')) return 'bg-amber-100 text-amber-700';
        return 'bg-blue-100 text-blue-700';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-mscred-orange" />
                        Esteira de Atendimentos
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Acompanhe propostas, prospecções e conversões da franquia.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente, CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-mscred-orange focus:border-mscred-orange text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-lg shadow-sm bg-mscred-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange"
                    >
                        <Plus className="w-4 h-4 mr-2 -ml-1" />
                        Novo Atendimento
                    </button>
                </div>
            </div>

            {/* Table Map */}
            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden border border-slate-200 shadow-sm sm:rounded-2xl bg-white">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Cliente / CPF
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Operação & Produto
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                            Origem (Loja & Op)
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Data
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex justify-center items-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-mscred-orange" />
                                                    <span className="ml-2">Carregando esteira...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredAttendances.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                Nenhum atendimento listado nos seus limites de acesso.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAttendances.map((a) => (
                                            <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                                        <User className="w-4 h-4 text-mscred-blue" />
                                                        {a.customer_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 font-mono">
                                                        {formatCpfView(a.customer_cpf)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900 font-semibold flex items-center gap-1.5">
                                                        <CreditCard className="w-4 h-4 text-slate-400" />
                                                        {a.product?.name || 'Inexistente'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-600">
                                                            {a.operation_type?.name}
                                                        </span>
                                                        {a.sales_channel?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(a.attendance_status?.name || '')}`}>
                                                        {a.attendance_status?.name || 'Pendente'}
                                                    </span>
                                                    {a.paid_approved && (
                                                        <span className="ml-2 inline-flex items-center text-emerald-600" title="Pago/Aprovado Financeiramente">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                    <div className="text-sm text-slate-900">
                                                        {a.user?.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center mt-1">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {a.store?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {new Date(a.attendance_date).toLocaleDateString('pt-BR')}
                                                    </div>
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

                        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-xl sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange">
                                    <span className="sr-only">Fechar</span>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start mb-6">
                                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-orange-50 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                                    <Banknote className="w-6 h-6 text-mscred-orange" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900" id="modal-title">
                                        Registrar Novo Atendimento
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Preencha os dados da triagem ou proposta formalizada.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreate} className="space-y-6">
                                {/* Secão 1: Cliente */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Dados do Cliente</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Nome Completo</label>
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">CPF (Somente Números)</label>
                                            <input
                                                type="text"
                                                value={customerCpf}
                                                onChange={handleCpfChange}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm font-mono"
                                                placeholder="00011122233"
                                                required
                                                maxLength={11}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Cidade Residente</label>
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Data do Atendimento</label>
                                            <input
                                                type="date"
                                                value={attendanceDate}
                                                onChange={(e) => setAttendanceDate(e.target.value)}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Seção 2: Negociação */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Estrutura da Negociação</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Produto</label>
                                            <select
                                                value={productId}
                                                onChange={(e) => setProductId(e.target.value)}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm bg-white"
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Tipo da Operação</label>
                                            <select
                                                value={operationTypeId}
                                                onChange={(e) => setOperationTypeId(e.target.value)}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm bg-white"
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {operationTypes.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Canal de Venda</label>
                                            <select
                                                value={salesChannelId}
                                                onChange={(e) => setSalesChannelId(e.target.value)}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm bg-white"
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {salesChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Banco Origem (Opcional)</label>
                                            <input
                                                type="text"
                                                value={originBank}
                                                onChange={(e) => setOriginBank(e.target.value)}
                                                placeholder="Ex: Itaú, INSS..."
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Seção 3: Finalização */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Status Atual do Funil</label>
                                            <select
                                                value={attendanceStatusId}
                                                onChange={(e) => setAttendanceStatusId(e.target.value)}
                                                className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm bg-white"
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {attendanceStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center mt-5">
                                            <input
                                                id="paid"
                                                type="checkbox"
                                                checked={paidApproved}
                                                onChange={(e) => setPaidApproved(e.target.checked)}
                                                className="w-5 h-5 text-mscred-orange border-slate-300 rounded focus:ring-mscred-orange"
                                            />
                                            <label htmlFor="paid" className="ml-3 block text-sm font-medium text-slate-900">
                                                Comissão / Pago Aprovado
                                                <p className="font-normal text-slate-500 text-xs">Marcar caso a transação já tenha rendido lucro.</p>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-mscred-orange text-base font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {submitting ? 'Salvando Venda...' : 'Salvar Atendimento'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange sm:mt-0 sm:w-auto sm:text-sm"
                                    >
                                        Voltar
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

