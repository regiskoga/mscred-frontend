import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, TrendingUp, Target, Award, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { dashboardAPI, DashboardMetricsResponse } from '../lib/api/dashboard';

export function Dashboard() {
    const storedUser = localStorage.getItem('@mscred:user');
    const user = storedUser ? JSON.parse(storedUser) : { name: 'Consultor' };

    const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    useEffect(() => {
        loadMetrics();
    }, [selectedDate]);

    async function loadMetrics() {
        try {
            setIsLoading(true);
            const [yearStr, monthStr] = selectedDate.split('-');
            const data = await dashboardAPI.getMetrics(parseInt(monthStr, 10), parseInt(yearStr, 10));
            setMetrics(data);
        } catch (err: any) {
            setError('Não foi possível carregar as métricas neste momento.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
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
                    <button onClick={loadMetrics} className="mt-4 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors text-sm font-semibold">Tentar Novamente</button>
                </div>
            </div>
        );
    }

    const { workingDays, financialTotals, goalsProgress } = metrics;

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
                <div className="relative z-10 text-right">
                    <p className="text-sm text-slate-400 mb-2">Período de Análise</p>
                    <div className="inline-flex items-center gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/10 overflow-hidden">
                        <div className="flex items-center justify-center pl-2 pr-3 py-1 border-r border-white/10">
                            <Calendar className="w-4 h-4 text-mscred-orange mr-2" />
                            <span className="font-medium text-sm whitespace-nowrap">{workingDays.elapsed} de {workingDays.total} dias úteis</span>
                        </div>
                        <input
                            type="month"
                            className="bg-transparent border-none text-white focus:ring-0 text-sm font-semibold outline-none w-[130px] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            title="Escolha o mês de referência"
                        />
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
