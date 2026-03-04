import { useState, useEffect } from 'react';
import { getHolidays, createHoliday, updateHoliday, deleteHoliday, Holiday } from '../lib/api/holidays';
import { Calendar, Plus, Edit2, Trash2 } from 'lucide-react';

export function Holidays() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: 0, name: '', date: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadHolidays();
    }, []);

    const loadHolidays = async () => {
        try {
            setLoading(true);
            const data = await getHolidays();
            setHolidays(data);
        } catch (err: any) {
            setError('Erro ao carregar feriados.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (holiday?: Holiday) => {
        if (holiday) {
            setIsEditing(true);
            setFormData({
                id: holiday.id,
                name: holiday.name,
                // Parse date string (assumes YYYY-MM-DDTHH:mm:ss.sssZ from DB) to YYYY-MM-DD
                date: new Date(holiday.date).toISOString().split('T')[0]
            });
        } else {
            setIsEditing(false);
            setFormData({ id: 0, name: '', date: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            // Append time part to make it a valid ISO-8601 DateTime for Prisma
            const dateStr = new Date(`${formData.date}T00:00:00Z`).toISOString();

            if (isEditing) {
                await updateHoliday(formData.id, { name: formData.name, date: dateStr });
            } else {
                await createHoliday({ name: formData.name, date: dateStr });
            }
            await loadHolidays();
            handleCloseModal();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar feriado.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja remover este feriado?')) return;
        try {
            await deleteHoliday(id);
            await loadHolidays();
        } catch (err) {
            alert('Erro ao excluir feriado.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Carregando Feriados...</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto animation-fade-in text-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-blue-400" />
                        Gerenciamento de Feriados
                    </h1>
                    <p className="text-gray-400 mt-2">Configuração dos dias não úteis para regras de negócio (Administradores).</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Novo Feriado
                </button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm">
                                <th className="p-4 font-semibold uppercase tracking-wider">Nome do Feriado</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Data</th>
                                <th className="p-4 font-semibold uppercase tracking-wider text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {holidays.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-6 text-center text-gray-500">
                                        Nenhum feriado cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                holidays.map((holiday) => (
                                    <tr key={holiday.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 font-medium">{holiday.name}</td>
                                        <td className="p-4 text-gray-300">
                                            {new Date(holiday.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </td>
                                        <td className="p-4 flex gap-3 justify-center">
                                            <button
                                                onClick={() => handleOpenModal(holiday)}
                                                className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(holiday.id)}
                                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animation-fade-in">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <h2 className="text-2xl font-bold mb-6 text-white">
                            {isEditing ? 'Editar Feriado' : 'Novo Feriado'}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Nome do Feriado
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                                    placeholder="Ex: Natal"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Data
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/40"
                                >
                                    {isEditing ? 'Salvar Alterações' : 'Criar Feriado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
