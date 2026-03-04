import { useState, useEffect } from 'react';
import { catalogsApi, CatalogItem, CatalogTypeDb, CatalogTypeEndpoint } from '../lib/api/catalogs';
import { integrationsApi, SyncStats } from '../lib/api/integrations';
import { api } from '../lib/axios';
import { Settings, Plus, Edit2, X, Loader2, AlertCircle, Database, Save, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TabConfig {
    id: string;
    label: string;
    dbType: CatalogTypeDb;
    endpoint: CatalogTypeEndpoint;
}

const TABS: TabConfig[] = [
    { id: 'operations', label: 'Tipos de Operação', dbType: 'operation_types', endpoint: 'operation-types' },
    { id: 'channels', label: 'Canais de Venda', dbType: 'sales_channels', endpoint: 'sales-channels' },
    { id: 'products', label: 'Produtos', dbType: 'products', endpoint: 'products' },
    { id: 'statuses', label: 'Status da Esteira', dbType: 'attendance_statuses', endpoint: 'attendance-statuses' },
    { id: 'migration', label: 'Migração Planilhas', dbType: 'products', endpoint: 'products' }, // products is dummy here
];

export function Catalogs() {
    const [activeTab, setActiveTab] = useState<TabConfig>(TABS[0]);
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
    const [itemName, setItemName] = useState('');
    const [saving, setSaving] = useState(false);

    // Migration state
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [sheetId, setSheetId] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ message: string, stats: SyncStats } | null>(null);

    useEffect(() => {
        if (activeTab.id === 'migration') {
            fetchUsers();
            return;
        }
        fetchData(activeTab.endpoint);
    }, [activeTab]);

    async function fetchUsers() {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.users || response.data);
        } catch (err) {
            setError('Erro ao carregar colaboradores.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (selectedUserId) {
            const user = users.find(u => u.id === selectedUserId);
            setSheetId(user?.google_sheet_id || '');
            setSyncResult(null);
        }
    }, [selectedUserId, users]);

    async function fetchData(endpoint: CatalogTypeEndpoint) {
        try {
            setLoading(true);
            setError('');
            const data = await catalogsApi.getItems(endpoint);
            setItems(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar dados do catálogo.');
        } finally {
            setLoading(false);
        }
    }

    const openModal = (item?: CatalogItem) => {
        if (item) {
            setEditingItem(item);
            setItemName(item.name);
        } else {
            setEditingItem(null);
            setItemName('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setItemName('');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemName.trim() || itemName.length < 2) return;

        try {
            setSaving(true);
            if (editingItem) {
                await catalogsApi.updateItem(activeTab.dbType, editingItem.id, itemName);
            } else {
                await catalogsApi.createItem(activeTab.dbType, itemName);
            }
            await fetchData(activeTab.endpoint);
            closeModal();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar o item.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (item: CatalogItem) => {
        try {
            await catalogsApi.toggleItemStatus(activeTab.dbType, item.id, !item.active);
            setItems(items.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao alterar status.');
        }
    };

    const handleSaveSheetId = async () => {
        if (!selectedUserId || !sheetId.trim()) return;
        try {
            setSaving(true);
            await integrationsApi.updateUserSheetId(selectedUserId, sheetId);
            // Update local users state
            setUsers(users.map(u => u.id === selectedUserId ? { ...u, google_sheet_id: sheetId } : u));
            alert('ID da planilha salvo com sucesso!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar ID da planilha.');
        } finally {
            setSaving(false);
        }
    };

    const handleSync = async () => {
        if (!selectedUserId) return;
        try {
            setSyncing(true);
            setSyncResult(null);
            const result = await integrationsApi.syncGoogleSheets(selectedUserId);
            setSyncResult(result);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao sincronizar dados.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Settings className="w-6 h-6 text-mscred-orange" />
                        Configurações do Sistema
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Gerencie as opções dos formulários de triagem, como canais e produtos.
                    </p>
                </div>
                {activeTab.id !== 'migration' && (
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-lg shadow-sm bg-mscred-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange"
                    >
                        <Plus className="w-4 h-4 mr-2 -ml-1" />
                        Novo {activeTab.label}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {TABS.map((tab) => {
                        const isActive = activeTab.id === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive
                                        ? 'border-mscred-orange text-mscred-orange'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Content area: Tables or Migration Form */}
            {activeTab.id === 'migration' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <Database className="w-5 h-5 text-mscred-blue" />
                            <h2 className="text-lg font-semibold text-slate-800">Vincular Planilha</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Consultor (Proprietário da Planilha)
                                </label>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-mscred-orange focus:border-mscred-orange bg-white text-sm"
                                >
                                    <option value="">Selecione um colaborador...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Google Sheet ID
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ex: 1a2b3c4d5e6f7g8h9i0j..."
                                        value={sheetId}
                                        onChange={(e) => setSheetId(e.target.value)}
                                        className="flex-1 border border-slate-300 rounded-lg py-2 px-3 focus:ring-mscred-orange focus:border-mscred-orange text-sm font-mono"
                                    />
                                    <button
                                        onClick={handleSaveSheetId}
                                        disabled={saving || !selectedUserId || !sheetId}
                                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-mscred-blue hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                                    >
                                        <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    Dica: O ID está na URL da planilha, entre '/d/' e '/edit'. A planilha deve ser pública ou compartilhada para exportação.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center space-y-4">
                        <div className={`p-4 rounded-full ${syncing ? 'bg-orange-100' : 'bg-mscred-orange/10'}`}>
                            <RefreshCw className={`w-8 h-8 text-mscred-orange ${syncing ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Sincronizar Dados</h3>
                            <p className="text-sm text-slate-500 max-w-xs mt-1">
                                Importa automaticamente os atendimentos da planilha vinculada para o sistema.
                            </p>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={syncing || !selectedUserId || !sheetId}
                            className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-mscred-orange hover:bg-orange-600 focus:outline-none disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
                        >
                            {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                        </button>

                        {syncResult && (
                            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left w-full animate-bounce-in">
                                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {syncResult.message}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                                        <div className="text-xs text-slate-500">Criados</div>
                                        <div className="text-sm font-bold text-emerald-600">{syncResult.stats.created}</div>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                                        <div className="text-xs text-slate-500">Ignorados</div>
                                        <div className="text-sm font-bold text-slate-600">{syncResult.stats.skipped}</div>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                                        <div className="text-xs text-slate-500">Erros</div>
                                        <div className="text-sm font-bold text-red-600">{syncResult.stats.errors}</div>
                                    </div>
                                </div>
                                {syncResult.stats.errorDetails && syncResult.stats.errorDetails.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-emerald-200">
                                        <p className="text-sm font-medium text-slate-800 mb-2">Detalhes dos Erros:</p>
                                        <ul className="text-xs text-slate-600 space-y-1 max-h-40 overflow-y-auto w-full text-left pr-2 custom-scrollbar">
                                            {syncResult.stats.errorDetails.map((err, i) => (
                                                <li key={i} className="flex gap-2 items-start bg-white p-2 text-red-700 rounded border border-red-100">
                                                    <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                                    <span className="leading-relaxed">{err}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 text-center">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-mscred-orange" />
                                            <span className="ml-2">Carregando dados...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Nenhum item cadastrado nesta categoria.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            #{item.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">
                                                {item.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleToggleStatus(item)}
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${item.active
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                                    }`}
                                                title="Clique para Ativar/Inativar"
                                            >
                                                {item.active ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openModal(item)}
                                                className="text-mscred-orange hover:text-orange-600 transition-colors"
                                                title="Editar Nome"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Criação / Edição */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-slate-900/75 backdrop-blur-sm" onClick={closeModal} aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button type="button" onClick={closeModal} className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange">
                                    <span className="sr-only">Fechar</span>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start mb-6">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900" id="modal-title">
                                        {editingItem ? `Editar ${activeTab.label}` : `Novo ${activeTab.label}`}
                                    </h3>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        Nome
                                    </label>
                                    <input
                                        type="text"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-orange focus:border-mscred-orange sm:text-sm"
                                        placeholder="Ex: Refinanciamento"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="pt-4 flex sm:flex-row-reverse gap-3">
                                    <button
                                        type="submit"
                                        disabled={saving || !itemName.trim()}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-mscred-orange text-base font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {saving ? 'O' : 'Salvar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange sm:mt-0 sm:w-auto sm:text-sm"
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
