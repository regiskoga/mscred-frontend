import { useState, useEffect } from 'react';
import { User as UserIcon, Lock, Phone, MapPin, Camera, Building2, ShieldAlert, BadgeCheck, Loader2 } from 'lucide-react';
import { api } from '../lib/axios';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    phone: string | null;
    address: string | null;
    role: { name: string };
    store: { name: string } | null;
}

export function Profile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    // Form Inputs
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Security Inputs
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const response = await api.get('/profile/me');
            const data = response.data.user;
            setProfile(data);

            // Populate form
            setPhone(data.phone || '');
            setAddress(data.address || '');
            setAvatarUrl(data.avatar_url || '');

        } catch (error) {
            console.error('Failed to load profile:', error);
            setMessage({ text: 'Não foi possível carregar seu perfil. Tente relogar.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        if (value.length > 10) value = `${value.slice(0, 10)}-${value.slice(10)}`;
        setPhone(value);
    };

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (password && password !== confirmPassword) {
            setMessage({ text: 'As senhas não coincidem.', type: 'error' });
            return;
        }

        if (password && password.length < 6) {
            setMessage({ text: 'A nova senha deve ter no mínimo 6 caracteres.', type: 'error' });
            return;
        }

        try {
            setSubmitting(true);

            // Fix URL protocol fallback if the user just pasted domain.com
            let finalAvatarUrl = avatarUrl.trim();
            if (finalAvatarUrl && !finalAvatarUrl.startsWith('http')) {
                finalAvatarUrl = `https://${finalAvatarUrl}`;
            }

            const payload: any = {
                phone: phone.trim() || null,
                address: address.trim() || null,
                avatar_url: finalAvatarUrl || null,
            };

            if (password) {
                payload.password = password; // Backend intercepts and bcrypt hashes this securely
            }

            await api.put('/profile/me', payload);

            setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
            setPassword('');
            setConfirmPassword('');

            // Sync API state
            await fetchProfile();

            // Sync Local Storage for Frontend Topbar reflection
            const storedUser = localStorage.getItem('@mscred:user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                parsedUser.avatar_url = payload.avatar_url;
                localStorage.setItem('@mscred:user', JSON.stringify(parsedUser));
                // Dispath a custom event so the layout component picks it up
                window.dispatchEvent(new Event('mscred:profileUpdated'));
            }

        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || 'Erro ao atualizar dados.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-bmg-orange" />
                <span className="ml-3 text-slate-500 font-medium">Carregando seu crachá virtual...</span>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4 animate-fade-in">
                <ShieldAlert className="w-12 h-12 text-slate-400" />
                <h2 className="text-xl font-bold text-slate-800">Falha ao carregar perfil</h2>
                <p className="text-slate-500">{message.text || 'O banco de dados não encontrou seu usuário ou as migrações estão pendentes.'}</p>
            </div>
        );
    }

    const initials = profile.name.slice(0, 2).toUpperCase();

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
            {/* Header / Avatar Banner */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-bmg-orange to-orange-400"></div>
                <div className="px-6 sm:px-10 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white shadow-md relative z-10"
                                    onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + profile.name + '&background=F0F9FF&color=0284C7'; }}
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-md relative z-10">
                                    <span className="text-2xl font-bold text-slate-500">{initials}</span>
                                </div>
                            )}
                            <div className="absolute top-16 -right-2 bg-white rounded-full p-1.5 shadow border border-slate-100 z-20">
                                <Camera className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>

                        <div className="text-right pb-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-bmg-blue border-blue-100 uppercase tracking-wide">
                                {profile.role.name === 'ADMIN' && <ShieldAlert className="w-3 h-3 mr-1" />}
                                {profile.role.name === 'GESTOR' && <BadgeCheck className="w-3 h-3 mr-1" />}
                                {profile.role.name}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                        <p className="text-slate-500">{profile.email}</p>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                                {profile.store ? profile.store.name : 'Acesso Global Matriz'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Self-Service Forms */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleUpdate} className="divide-y divide-slate-200">

                    {/* General Info */}
                    <div className="p-6 sm:p-10">
                        <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-bmg-orange" />
                            Informações Pessoais
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">URL da Foto (Avatar Público)</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="url"
                                        value={avatarUrl}
                                        onChange={e => setAvatarUrl(e.target.value)}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm"
                                        placeholder="https://imgur.com/suafoto.jpg"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Cole o link completo da sua imagem (Imgur, LinkedIn, etc).</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    Telefone Celular
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    maxLength={15}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    Endereço de Correspondência
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm"
                                    placeholder="Rua, Número, CEP..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="p-6 sm:p-10 bg-slate-50/50">
                        <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-bmg-orange" />
                            Segurança Zero-Trust
                        </h2>
                        <p className="text-sm text-slate-500 mb-5">
                            Suas senhas são cacheadas com fator de trabalho 10. Você pode trocar sua senha atual preenchendo os campos abaixo. Se não quiser alterar a senha, deixe em branco.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nova Senha Corporativa</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm"
                                    placeholder="Deixe em branco para manter a atual"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-bmg-orange focus:border-bmg-orange sm:text-sm"
                                    placeholder="Redigite a senha"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 sm:px-10 bg-slate-50 flex items-center justify-between rounded-b-2xl">
                        <div className="text-sm">
                            {message.text && (
                                <span className={message.type === 'error' ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
                                    {message.text}
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2 bg-bmg-blue text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bmg-blue sm:text-sm disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Aplicando Alterações...' : 'Salvar Alterações'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
