import { useState, useEffect } from 'react';
import { Plus, Store as StoreIcon, Building2, MapPin, Hash, X, Loader2 } from 'lucide-react';
import { api } from '../lib/axios';

interface Store {
    id: number;
    name: string;
    address: string | null;
    bmg_code: string | null;
    created_at: string;
}

export function Stores() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [editingStoreId, setEditingStoreId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [bmgCode, setBmgCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStores();
    }, []);

    async function fetchStores() {
        try {
            setLoading(true);
            const response = await api.get('/stores');
            // Assuming response looks like { stores: [...] } or just [...]
            // depending on the backend controller, let's gracefully handle both
            setStores(response.data.stores || response.data);
        } catch (error) {
            console.error('Failed to load stores:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('O nome da loja é obrigatório.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name,
                address: address.trim() || undefined,
                bmg_code: bmgCode.trim() || undefined
            };

            if (editingStoreId) {
                await api.put(`/stores/${editingStoreId}`, payload);
            } else {
                await api.post('/stores', payload);
            }

            // Refetch and close
            await fetchStores();
            handleCloseModal();

        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao processar. Verifique os dados (BMG Code deve ser único).');
        } finally {
            setSubmitting(false);
        }
    }

    function handleOpenEdit(store: Store) {
        setEditingStoreId(store.id);
        setName(store.name);
        setAddress(store.address || '');
        setBmgCode(store.bmg_code || '');
        setIsModalOpen(true);
    }

    function handleOpenCreate() {
        setEditingStoreId(null);
        setName('');
        setAddress('');
        setBmgCode('');
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setEditingStoreId(null);
        setName('');
        setAddress('');
        setBmgCode('');
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <StoreIcon className="w-6 h-6 text-mscred-orange" />
                        Lojas da Franquia
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Gerencie as unidades físicas e códigos de operação BMG.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-lg shadow-sm bg-mscred-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-blue"
                >
                    <Plus className="w-4 h-4 mr-2 -ml-1" />
                    Nova Loja
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
                                            ID
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Nome da Loja
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Endereço
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            BMG Code
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex justify-center items-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-mscred-blue" />
                                                    <span className="ml-2">Carregando lojas...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : stores.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                Nenhuma loja encontrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        stores.map((store) => (
                                            <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    #{store.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100">
                                                            <Building2 className="h-5 w-5 text-mscred-orange" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-slate-900">{store.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900 flex items-center gap-1.5 opacity-80">
                                                        {store.address ? (
                                                            <>
                                                                <MapPin className="w-4 h-4" />
                                                                <span className="truncate max-w-[200px]">{store.address}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Não informado</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium flex items-center gap-1.5">
                                                        <Hash className="w-4 h-4 text-slate-400" />
                                                        <span className="bg-slate-100 text-slate-700 py-1 px-2.5 rounded-md border border-slate-200">
                                                            {store.bmg_code || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleOpenEdit(store)}
                                                        className="text-mscred-blue hover:text-blue-900 transition-colors"
                                                    >
                                                        Editar
                                                    </button>
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
                                <button type="button" onClick={handleCloseModal} className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-blue">
                                    <span className="sr-only">Fechar</span>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="sm:flex sm:items-start">
                                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-50 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                                    <Building2 className="w-6 h-6 text-mscred-blue" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg font-medium leading-6 text-slate-900" id="modal-title">
                                        {editingStoreId ? 'Editar Loja Existente' : 'Cadastrar Nova Loja'}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-slate-500">
                                            {editingStoreId ? 'Atualize os dados da filial.' : 'Insira os dados da nova filial corporativa.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Oficial *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-blue focus:border-mscred-blue sm:text-sm"
                                        placeholder="Ex: Loja Matriz BH"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bmg" className="block text-sm font-medium text-slate-700">Código BMG (Opcional)</label>
                                    <input
                                        type="text"
                                        id="bmg"
                                        value={bmgCode}
                                        onChange={(e) => setBmgCode(e.target.value)}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-blue focus:border-mscred-blue sm:text-sm font-mono uppercase"
                                        placeholder="Ex: XYZ-1234"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-slate-700">Endereço Completo (Opcional)</label>
                                    <input
                                        type="text"
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-mscred-blue focus:border-mscred-blue sm:text-sm"
                                        placeholder="Ex: Av. Afonso Pena, 1000..."
                                    />
                                </div>

                                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t border-slate-200 pt-5">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-mscred-blue text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-blue sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {submitting ? 'Salvando...' : editingStoreId ? 'Salvar Edição' : 'Cadastrar Loja'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-blue sm:mt-0 sm:w-auto sm:text-sm"
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

