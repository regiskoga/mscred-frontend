import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, TrendingUp, Target, Award, ArrowUpRight, Clock, AlertCircle, RefreshCw, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { dashboardAPI, DashboardMetricsResponse } from '../lib/api/dashboard';
import { api } from '../lib/axios';

export function Dashboard() {
    const storedUser = localStorage.getItem('@mscred:user');
    const user = storedUser ? JSON.parse(storedUser) : { name: 'Consultor', role: 'OPERADOR' };

    const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Default to current Month and Year
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Filtros de Admin/Gestor
    const [consultants, setConsultants] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [selectedConsultantId, setSelectedConsultantId] = useState('');
    const [selectedStoreId, setSelectedStoreId] = useState('');

    const isAdmin = user.role === 'ADMIN';
    const isGestor = user.role === 'GESTOR';

    useEffect(() => {
        if (isAdmin || isGestor) {
            fetchFilters();
        }
    }, [isAdmin, isGestor]);

    async function fetchFilters() {
        try {
            const [usersRes, storesRes] = await Promise.all([
                api.get('/users'),
                api.get('/stores')
            ]);
            setConsultants(usersRes.data.users || usersRes.data);
            setStores(storesRes.data.stores || storesRes.data);
        } catch (err) {
            console.error('Erro ao carregar filtros:', err);
        }
    }

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await dashboardAPI.getMetrics(
                selectedMonth,
                selectedYear,
                selectedConsultantId || undefined,
                selectedStoreId ? Number(selectedStoreId) : undefined
            );
            setMetrics(data);
        } catch (err: any) {
            setError('Não foi possível carregar as métricas neste momento.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [selectedMonth, selectedYear, selectedConsultantId, selectedStoreId]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Sincronizando Motor Financeiro...</p>
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center gap-3 text-center max-w-sm border border-red-100 shadow-sm">
                    <AlertCircle className="w-10 h-10" />
                    <h3 className="font-bold">Erro de Sincronização</h3>
                    <p className="text-sm">{error}</p>
                    <button onClick={fetchMetrics} className="mt-4 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors text-sm font-semibold">Tentar Novamente</button>
                </div>
            </div>
        );
    }

    const { workingDays, financialTotals, goalsProgress } = metrics;

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // -2 to +2 years

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Área */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl border border-slate-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-mscred-orange opacity-20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Resumo Operacional</h1>
                    <p className="text-slate-300">
                        Bem-vindo ao seu painel financeiro, <span className="font-semibold text-white">{user.name}</span>.
                    </p>
                </div>
                <div className="relative z-10 text-right space-y-3">
                    <div className="flex items-center justify-end gap-3 mb-1">
                        <button onClick={fetchMetrics} className="p-2 bg-white/10 rounded-xl text-slate-300 hover:text-mscred-orange transition-all border border-white/5" title="Atualizar">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {(isAdmin || isGestor) && (
                            <div className="flex gap-2">
                                {isAdmin && (
                                    <select
                                        value={selectedStoreId}
                                        onChange={e => { setSelectedStoreId(e.target.value); setSelectedConsultantId(''); }}
                                        className="bg-white/10 border-white/10 text-white rounded-xl text-xs py-1.5 focus:ring-mscred-orange focus:border-mscred-orange backdrop-blur-md"
                                    >
                                        <option value="" className="text-slate-800">Unidade: Todas</option>
                                        {stores.map(s => <option key={s.id} value={s.id} className="text-slate-800">{s.name}</option>)}
                                    </select>
                                )}
                                <select
                                    value={selectedConsultantId}
                                    onChange={e => setSelectedConsultantId(e.target.value)}
                                    className="bg-white/10 border-white/10 text-white rounded-xl text-xs py-1.5 focus:ring-mscred-orange focus:border-mscred-orange backdrop-blur-md"
                                >
                                    <option value="" className="text-slate-800">{isAdmin ? 'Consultor: Todos' : 'Meus Consultores'}</option>
                                    {consultants
                                        .filter(c => !selectedStoreId || c.store_id === Number(selectedStoreId))
                                        .map(c => <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>)
                                    }
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/10 overflow-hidden">
                        <div className="flex items-center justify-center pl-2 pr-3 py-1 border-r border-white/10">
                            <Calendar className="w-4 h-4 text-mscred-orange mr-2" />
                            <span className="font-medium text-sm whitespace-nowrap">{workingDays.elapsed} de {workingDays.total} dias úteis</span>
                        </div>
                        <div className="flex items-center">
                            <select
                                className="bg-transparent border-none text-white focus:ring-0 text-sm font-semibold outline-none cursor-pointer appearance-none px-2"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            >
                                {monthNames.map((m, idx) => (
                                    <option key={m} value={idx + 1} className="text-slate-800">{m}</option>
                                ))}
                            </select>
                            <span className="text-white/50">/</span>
                            <select
                                className="bg-transparent border-none text-white focus:ring-0 text-sm font-semibold outline-none cursor-pointer appearance-none px-2"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {years.map(y => (
                                    <option key={y} value={y} className="text-slate-800">{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards (High-End FinTech Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Comissão Atual */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-orange-400 to-mscred-orange rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Comissão Acumulada</p>
                            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(financialTotals.currentCommission)}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-2xl text-mscred-orange border border-orange-100">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Valor Pago Aprovado */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Volume Pago Aprovado</p>
                            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(financialTotals.paidApproved)}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Tempo Restante */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Contagem Regressiva</p>
                            <h3 className="text-3xl font-bold text-slate-900">{workingDays.remaining} <span className="text-base font-medium text-slate-500">dias úteis</span></h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    {/* Progress Bar do Mês */}
                    <div className="mt-4 relative z-10 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${(workingDays.elapsed / workingDays.total) * 100}%` }}
                        ></div>
                    </div>
                </div>

            </div>

            {/* Resumo por Produto (Screenshot Style) */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
                    <div className="bg-mscred-orange px-6 py-3 flex justify-between items-center">
                        <h3 className="text-white font-bold uppercase tracking-wider text-sm">Resumo de Vendas por Produto</h3>
                        <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] text-white font-bold">ATUAL</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {metrics.salesByProduct.map((item, idx) => {
                            const isCountable = ['BMG MED', 'EMISSAO CARDS', 'BMG_MED', 'EMISSAO_CARDS'].some(n =>
                                item.productName.toUpperCase().includes(n)
                            );

                            // Cores baseadas no screenshot
                            let rowColor = "bg-white";
                            let textColor = "text-slate-700";

                            const name = item.productName.toUpperCase();
                            if (name.includes('CNC')) rowColor = "bg-[#FFD700]/10";
                            if (name.includes('CARD')) rowColor = "bg-[#6495ED]/10";
                            if (name.includes('FGTS')) rowColor = "bg-[#FF8C00]/10";
                            if (name.includes('BMG MED')) rowColor = "bg-[#FFA500]/10";
                            if (name.includes('CLT')) rowColor = "bg-[#FF4500]/10";
                            if (name.includes('CONSIGNADO')) rowColor = "bg-[#D2691E]/10 font-bold";

                            return (
                                <div key={idx} className={`flex justify-between items-center px-6 py-2.5 ${rowColor} transition-colors hover:bg-slate-50`}>
                                    <span className={`text-sm font-bold uppercase ${textColor}`}>{item.productName}</span>
                                    <span className="text-sm font-black text-right">
                                        {isCountable
                                            ? item.count.toString().padStart(2, '0')
                                            : formatCurrency(item.totalValue)
                                        }
                                    </span>
                                </div>
                            );
                        })}

                        {/* Linha de Total */}
                        <div className="flex justify-between items-center px-6 py-3 bg-[#D2691E] text-white">
                            <span className="text-sm font-black uppercase tracking-widest">Total Geral Aprovado</span>
                            <span className="text-lg font-black">{formatCurrency(metrics.financialTotals.paidApproved)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Evolução Histórica (Gráficos) - Apenas para Gestores e Admins */}
            {(isAdmin || isGestor) && metrics.monthlyEvolution && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                    {/* Evolução por Produto */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-mscred-orange/10 rounded-lg text-mscred-orange">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Evolução por Produto</h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos 6 meses</span>
                        </div>

                        <div className="h-80 w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={metrics.monthlyEvolution.products} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        tickFormatter={(value) => value === 0 ? '0' : `R$ ${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                        formatter={(value: any) => formatCurrency(value)}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                    />
                                    <Legend
                                        iconType="circle"
                                        verticalAlign="bottom"
                                        height={40}
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: '9px', paddingTop: '15px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}
                                    />
                                    {metrics.monthlyEvolution.productNames.map((name, index) => (
                                        <Line
                                            key={name}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#22C55E'][index % 8]}
                                            strokeWidth={3}
                                            dot={{ r: 2, strokeWidth: 2, fill: '#fff' }}
                                            activeDot={{ r: 4, strokeWidth: 0, fill: '#F59E0B' }}
                                            animationDuration={1500}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Evolução por Operador */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-mscred-blue/10 rounded-lg text-mscred-blue">
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Performance (Operadores)</h2>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black tracking-widest uppercase">Operadores Ativos</span>
                        </div>

                        <div className="h-80 w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.monthlyEvolution.consultants} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        tickFormatter={(value) => value === 0 ? '0' : `R$ ${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', radius: 4 }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                        formatter={(value: any) => formatCurrency(value)}
                                    />
                                    <Legend
                                        iconType="rect"
                                        verticalAlign="bottom"
                                        height={40}
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: '9px', paddingTop: '15px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}
                                    />
                                    {metrics.monthlyEvolution.consultantNames.map((name, index) => (
                                        <Bar
                                            key={name}
                                            dataKey={name}
                                            fill={['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#22C55E'][index % 8]}
                                            radius={[3, 3, 0, 0]}
                                            animationDuration={1500}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Metas dos Produtos */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700"><Target className="w-5 h-5" /></div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Evolução das Metas</h2>
                </div>

                {goalsProgress.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Sem metas atribuídas</h3>
                        <p className="text-slate-500 mt-2">Você não possui metas configuradas para este mês.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {goalsProgress.map((goal, idx) => {
                            const isAchieved = goal.percentageAchieved >= 100;

                            return (
                                <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                    {/* Success Glow se atingiu a meta */}
                                    {isAchieved && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none fade-in"></div>
                                    )}

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{goal.productName}</h3>
                                            <p className="text-sm font-medium text-slate-500 mt-1">Alvo: {formatCurrency(goal.target)}</p>
                                        </div>
                                        {/* Status Badge */}
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${isAchieved
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                            }`}>
                                            {isAchieved ? <CheckCircle className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                            {isAchieved ? 'Meta Atingida!' : 'Em Progresso'}
                                        </div>
                                    </div>

                                    {/* Financial Split */}
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <p className="text-2xl font-black text-slate-800">{formatCurrency(goal.actualSales)}</p>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Vendido</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${isAchieved ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                {isAchieved ? '0,00' : formatCurrency(goal.remainingToGoal)}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Faltante</p>
                                        </div>
                                    </div>

                                    {/* Bar Chart (Progress) */}
                                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-5 border border-slate-200 shadow-inner">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${isAchieved ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                                                }`}
                                            style={{ width: `${goal.percentageAchieved}%` }}
                                        >
                                            {/* Shimmer Effect */}
                                            <div className="absolute top-0 inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>

                                    {/* Tier Banner / Context */}
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl border ${goal.currentTierPercentage > 0 ? 'bg-orange-50 border-orange-100 text-mscred-orange' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                                <Award className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500">Faixa de Comissão Atual</p>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {goal.currentTierPercentage > 0 ? `${goal.currentTierPercentage}% Aplicado` : 'Nenhuma faixa atingida'}
                                                </p>
                                            </div>
                                        </div>
                                        {goal.percentageAchieved > 0 && <span className="font-bold text-slate-300">{(goal.percentageAchieved).toFixed(1)}%</span>}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Custom Shimmer Animation using standard tailwind arbitrariness since we don't have tailwind config access easily */}
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                    0% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
}
