import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function NovoJogador() {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem({ texto: '', tipo: '' });

    if (!nome.trim()) {
      setMensagem({ texto: 'O nome não pode estar vazio!', tipo: 'erro' });
      return;
    }

    setLoading(true);

    // Geramos o UUID direto no navegador para evitar falhas de inserção
    const novoId = crypto.randomUUID();

    const { error } = await supabase
      .from('jogadores')
      .insert([
        { 
          id: novoId, 
          nome: nome.trim(), 
          mmr_atual: 1200, // Rating inicial padrão do xadrez
          vitorias: 0, 
          derrotas: 0, 
          empates: 0 
        }
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      // O código 23505 no PostgreSQL significa violação de chave única (Unique)
      if (error.code === '23505') {
        setMensagem({ texto: 'Já existe um jogador com esse nome!', tipo: 'erro' });
      } else {
        setMensagem({ texto: 'Erro ao cadastrar. Verifique a conexão.', tipo: 'erro' });
      }
    } else {
      setMensagem({ texto: 'Jogador criado com sucesso! Redirecionando...', tipo: 'sucesso' });
      setNome('');
      // Joga a pessoa de volta pro Ranking após 1.5 segundos
      setTimeout(() => navigate('/'), 1500); 
    }
  }

  return (
    <div className="pb-10 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-center mt-4 text-zinc-100">Novo Jogador</h2>

      <form onSubmit={handleSubmit} className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/50 shadow-xl flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-zinc-300">Nome ou Apelido</label>
          <input 
            type="text" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: João Silva ou 'Destruidor69'"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            maxLength={30}
          />
        </div>

        {mensagem.texto && (
          <div className={`p-4 rounded-lg text-sm font-bold text-center ${mensagem.tipo === 'erro' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
            {mensagem.texto}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-zinc-100 hover:bg-white disabled:bg-zinc-700 text-zinc-900 disabled:text-zinc-500 font-black py-4 rounded-xl mt-2 transition-colors flex justify-center items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-zinc-900"></div>
          ) : (
            "CRIAR JOGADOR"
          )}
        </button>
      </form>
    </div>
  );
}