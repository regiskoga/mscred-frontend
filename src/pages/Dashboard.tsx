import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

export function Dashboard() {
    const storedUser = localStorage.getItem('@mscred:user');
    const user = storedUser ? JSON.parse(storedUser) : { name: 'Usuário' };

    // Placeholder data until we connect the KPI API
    const kpis = [
        { name: 'Meus Atendimentos Hoje', value: '12', icon: FileText, color: 'bg-blue-500' },
        { name: 'Aprovados', value: '8', icon: CheckCircle, color: 'bg-green-500' },
        { name: 'Aguardando Análise', value: '3', icon: Clock, color: 'bg-amber-500' },
        { name: 'Total Colaboradores', value: '5', icon: Users, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard General</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Bem-vindo de volta, <span className="font-medium text-mscred-blue">{user.name}</span>.
                    </p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.name} className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md hover:border-slate-200 group">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-xl ${item.color} bg-opacity-10 mr-4 group-hover:bg-opacity-20 transition-all`}>
                                    <Icon className={`w-6 h-6 ${item.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 truncate">{item.name}</p>
                                    <p className="mt-1 text-3xl font-bold text-slate-900">{item.value}</p>
                                </div>
                            </div>
                            <div className={`absolute bottom-0 left-0 h-1 w-full ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Atividades Recentes</h3>
                <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">O feed de atividades será carregado aqui.</p>
                </div>
            </div>
        </div>
    );
}

