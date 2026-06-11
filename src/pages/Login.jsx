import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');

    if (!senha) {
      setErro('Digite a senha.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha })
      });

      setLoading(false);

      if (res.ok) {
        // Salva a senha no navegador
        localStorage.setItem('admin_password', senha);
        // Redireciona para o registro de partidas
        navigate('/registro');
      } else {
        setErro('Senha incorreta!');
      }
    } catch (err) {
      setLoading(false);
      setErro('Erro de conexão com o servidor.');
    }
  }

  return (
    <div className="pb-10 animate-fade-in flex flex-col items-center justify-center pt-10">
      <div className="bg-zinc-800/80 border border-zinc-700 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
        
        <div className="text-center mb-8">
          <div className="bg-zinc-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-700/50 shadow-inner">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-black text-white">Modo Admin</h2>
          <p className="text-zinc-400 text-sm mt-2">Apenas organizadores podem registrar partidas ou novos jogadores.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a Senha Mestra"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-center text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-mono tracking-widest"
            />
          </div>

          {erro && (
            <div className="bg-red-500/20 text-red-400 text-sm font-bold p-3 rounded-lg text-center border border-red-500/30">
              {erro}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white font-black py-4 rounded-xl mt-2 transition-colors flex justify-center items-center shadow-lg shadow-green-900/20"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "DESBLOQUEAR"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
