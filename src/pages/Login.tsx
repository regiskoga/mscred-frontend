import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { api } from '../lib/axios';

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Chamada real para o Backend
            const response = await api.post('/auth/login', { email, password });

            const { token, user } = response.data;

            // Salvando o JWT do Backend no localStorage de forma segura
            localStorage.setItem('@mscred:token', token);
            localStorage.setItem('@mscred:user', JSON.stringify(user));

            navigate('/dashboard'); // Ou a página inicial do seu app

        } catch (err: any) {
            setError(err.message || 'Erro de conexão.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-mscred-blue/80 backdrop-blur-sm"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center mt-6">
                <img src="/logo.png" alt="MSCRED" className="h-20 sm:h-24 w-auto object-contain drop-shadow-2xl" />
                <p className="mt-4 text-center text-sm text-mscred-light/90 font-medium">
                    Portal de Gestão de Atendimentos Consignados
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Endereço de E-mail
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-mscred-orange focus:border-mscred-orange block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 outline-none border transition-colors bg-slate-50 focus:bg-white"
                                    placeholder="operador@loja.bmg.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Senha
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-mscred-orange focus:border-mscred-orange block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 outline-none border transition-colors bg-slate-50 focus:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-mscred-orange hover:bg-[#e65c00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mscred-orange transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                                ) : (
                                    'Entrar no Sistema'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
}

