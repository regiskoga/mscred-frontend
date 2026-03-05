import { useState, useEffect } from 'react';
import { Target, TrendingUp, Plus, Trash2, Edit2, AlertCircle, Save, X } from 'lucide-react';
import { goalsAPI, Goal } from '../lib/api/goals';
import { tiersAPI, CommissionTier } from '../lib/api/tiers';
import { catalogsApi, CatalogItem } from '../lib/api/catalogs';
import { api } from '../lib/axios';

interface UserItem { id: string; name: string; role: string }
interface StoreItem { id: number; name: string }

export function GoalsManagement() {
    const [activeTab, setActiveTab] = useState<'goals' | 'tiers'>('goals');

    // Data State
    const [goals, setGoals] = useState<Goal[]>([]);
    const [tiers, setTiers] = useState<CommissionTier[]>([]);

    // Aux Data State
    const [products, setProducts] = useState<CatalogItem[]>([]);
    const [stores, setStores] = useState<StoreItem[]>([]);
    const [users, setUsers] = useState<UserItem[]>([]);

    // Loading & Error States
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal States
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isTierModalOpen, setIsTierModalOpen] = useState(false);

    // Form States
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [goalForm, setGoalForm] = useState({
        product_id: '',
        store_id: '',
        user_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        target: ''
    });

    const [editingTier, setEditingTier] = useState<CommissionTier | null>(null);
    const [tierForm, setTierForm] = useState({
        product_id: '',
        min_value: '',
        percentage: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'goals') loadGoals();
        if (activeTab === 'tiers') loadTiers();
    }, [activeTab]);

    async function loadData() {
        try {
            setIsLoading(true);
            const [prods, strs, usrs] = await Promise.all([
                catalogsApi.getItems('products'),
                api.get('/stores').then((res: any) => res.data),
                api.get('/users').then((res: any) => res.data)
            ]);
            setProducts(Array.isArray(prods) ? prods.filter((p: any) => p.active !== false) : []);
            setStores(Array.isArray(strs) ? strs : (strs?.stores || strs?.data || []));
            setUsers(Array.isArray(usrs) ? usrs : (usrs?.users || usrs?.data || []));
            await loadGoals();
        } catch (err: any) {
            setError('Erro ao carregar dados auxiliares. ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function loadGoals() {
        try {
            const data = await goalsAPI.list();
            setGoals(data);
        } catch (err: any) {
            setError('Erro ao carregar metas.');
        }
    }

    async function loadTiers() {
        try {
            const data = await tiersAPI.list();
            setTiers(data);
        } catch (err: any) {
            setError('Erro ao carregar comissões.');
        }
    }

    // Handlers Metas
    async function handleSaveGoal(e: React.FormEvent) {
        e.preventDefault();
        try {
            const payload = {
                product_id: Number(goalForm.product_id),
                month: Number(goalForm.month),
                year: Number(goalForm.year),
                target: Number(goalForm.target),
                store_id: goalForm.store_id ? Number(goalForm.store_id) : null,
                user_id: goalForm.user_id ? goalForm.user_id : null,
            };

            if (editingGoal) {
                await goalsAPI.update(editingGoal.id, { target: payload.target });
            } else {
                await goalsAPI.create(payload as any);
            }

            setIsGoalModalOpen(false);
            setEditingGoal(null);
            loadGoals();
        } catch (err: any) {
            alert('Erro ao salvar meta: ' + err.message);
        }
    }

    async function handleDeleteGoal(id: number) {
        if (!confirm('Deseja realmente remover esta meta?')) return;
        try {
            await goalsAPI.delete(id);
            loadGoals();
        } catch (err: any) {
            alert('Erro ao remover meta.');
        }
    }

    // Handlers Tiers
    async function handleSaveTier(e: React.FormEvent) {
        e.preventDefault();
        try {
            const payload = {
                product_id: Number(tierForm.product_id),
                min_value: Number(tierForm.min_value),
                percentage: Number(tierForm.percentage),
                max_value: null,
            };

            if (editingTier) {
                await tiersAPI.update(editingTier.id, payload);
            } else {
                await tiersAPI.create(payload);
            }

            setIsTierModalOpen(false);
            setEditingTier(null);
            loadTiers();
        } catch (err: any) {
            alert('Erro ao salvar faixa: ' + err.message);
        }
    }

    async function handleDeleteTier(id: number) {
        if (!confirm('Deseja realmente remover esta faixa?')) return;
        try {
            await tiersAPI.delete(id);
            loadTiers();
        } catch (err: any) {
            alert('Erro ao remover faixa.');
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <TrendingUp className="text-mscred-orange" />
                        Motor Financeiro
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gerencie Metas de Vendas e Faixas de Comissionamento Global ou por Unidade.</p>
                </div>
                {activeTab === 'goals' && (
                    <button onClick={() => { setEditingGoal(null); setGoalForm({ product_id: products[0]?.id?.toString() || '', store_id: '', user_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), target: '' }); setIsGoalModalOpen(true); }} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        <Plus className="w-4 h-4 mr-2" /> Nova Meta
                    </button>
                )}
                {activeTab === 'tiers' && (
                    <button onClick={() => { setEditingTier(null); setTierForm({ product_id: products[0]?.id?.toString() || '', min_value: '', percentage: '' }); setIsTierModalOpen(true); }} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        <Plus className="w-4 h-4 mr-2" /> Nova Faixa
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="border-b border-gray-100 px-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('goals')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'goals'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="flex items-center gap-2"><Target className="w-4 h-4" /> Metas de Vendas (Mensal)</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tiers')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'tiers'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Faixas de Comissionamento</span>
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div>
                    ) : activeTab === 'goals' ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mês/Ano</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Produto</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Escopo</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Alvo (R$)</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {goals.map((goal) => {
                                        const scopeLabel = goal.user ? `Apenas Consultor: ${goal.user.name}` : (goal.store ? `Unidade: ${goal.store.name}` : 'Global (Atividade Padrão)');
                                        return (
                                            <tr key={goal.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{String(goal.month).padStart(2, '0')}/{goal.year}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{goal.product?.name || 'Desconhecido'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${goal.user ? 'bg-purple-100 text-purple-700' : (goal.store ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700')}`}>
                                                        {scopeLabel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold text-right">
                                                    {(goal.target || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => { setEditingGoal(goal); setIsGoalModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4 transition"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-600 hover:text-red-900 transition"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {goals.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Nenhuma meta configurada.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Produto</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Volume Mínimo Atingido (R$)</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Percentual Base</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tiers.map((tier) => (
                                        <tr key={tier.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{tier.product?.name || 'Desconhecido'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 text-right">
                                                A partir de {(tier.min_value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-mscred-orange font-bold text-right">
                                                {tier.percentage}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => { setEditingTier(tier); setTierForm({ product_id: tier.product_id.toString(), min_value: tier.min_value.toString(), percentage: tier.percentage.toString() }); setIsTierModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4 transition"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteTier(tier.id)} className="text-red-600 hover:text-red-900 transition"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {tiers.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Nenhuma faixa de comissão hierárquica configurada. A comissão resultará em 0.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Metas */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                {editingGoal ? 'Editar Meta Financeira' : 'Criar Nova Meta Estratégica'}
                            </h3>
                            <button onClick={() => setIsGoalModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
                            {!editingGoal && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                                            <input type="number" min="1" max="12" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={goalForm.month} onChange={e => setGoalForm({ ...goalForm, month: parseInt(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                                            <input type="number" min="2020" max="2050" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={goalForm.year} onChange={e => setGoalForm({ ...goalForm, year: parseInt(e.target.value) })} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Produto Associado</label>
                                        <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={goalForm.product_id} onChange={e => setGoalForm({ ...goalForm, product_id: e.target.value })}>
                                            <option value="">Selecione...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                                        <p className="text-xs text-slate-500 font-semibold uppercase">Escopo da Meta (Deixe em branco para Global)</p>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Específica para Loja</label>
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={goalForm.store_id} onChange={e => setGoalForm({ ...goalForm, store_id: e.target.value })}>
                                                <option value="">Todas (Global)</option>
                                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Específica para Consultor</label>
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" value={goalForm.user_id} onChange={e => setGoalForm({ ...goalForm, user_id: e.target.value })}>
                                                <option value="">Todos</option>
                                                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Alvo da Meta (R$ Volume)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">R$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        value={editingGoal ? (editingGoal as any).targetEdit || editingGoal.target : goalForm.target}
                                        onChange={e => editingGoal ? setEditingGoal({ ...editingGoal, targetEdit: e.target.value } as any) : setGoalForm({ ...goalForm, target: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Soma monetária exigida deste produto que qualifica o batedor da meta.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsGoalModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition"><Save className="w-4 h-4" /> Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Tiers */}
            {isTierModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                {editingTier ? 'Editar Regra de Comissão' : 'Nova Regra de Comissão'}
                            </h3>
                            <button onClick={() => setIsTierModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSaveTier} className="p-6 space-y-5">
                            {!editingTier && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Produto Vinculado</label>
                                    <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={tierForm.product_id} onChange={e => setTierForm({ ...tierForm, product_id: e.target.value })}>
                                        <option value="">Selecione o Produto...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">A regra será aplicada para atendimentos deste produto.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Atingir o Mínimo de (R$ Volume Acumulado)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">R$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        value={tierForm.min_value}
                                        onChange={e => setTierForm({ ...tierForm, min_value: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Para garantir N% de comissão, o vendedor precisa vender pelo menos isso no mês.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Percentual de Prêmio (%)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-mscred-orange sm:text-sm font-bold">%</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-mscred-orange"
                                        placeholder="Por exemplo: 1.5"
                                        value={tierForm.percentage}
                                        onChange={e => setTierForm({ ...tierForm, percentage: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsTierModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition"><Save className="w-4 h-4" /> Salvar Faixa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
