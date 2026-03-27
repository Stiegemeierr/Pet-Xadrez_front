import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Registro() {
  const [jogadores, setJogadores] = useState([]);
  const [brancasId, setBrancasId] = useState('');
  const [pretasId, setPretasId] = useState('');
  const [resultado, setResultado] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Busca a lista de jogadores para preencher os dropdowns
  useEffect(() => {
    async function buscarJogadores() {
      const { data } = await supabase.from('jogadores').select('id, nome').order('nome');
      if (data) setJogadores(data);
    }
    buscarJogadores();
  }, []);

  // Função disparada ao clicar em "Salvar Partida"
  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem({ texto: '', tipo: '' });

    // Validação básica do frontend
    if (!brancasId || !pretasId || resultado === '') {
      setMensagem({ texto: 'Preencha todos os campos!', tipo: 'erro' });
      return;
    }
    if (brancasId === pretasId) {
      setMensagem({ texto: 'Um jogador não pode jogar contra si mesmo!', tipo: 'erro' });
      return;
    }

    setLoading(true);

    // Chama a nossa Database Function no PostgreSQL
    const { error } = await supabase.rpc('registrar_partida', {
      p_brancas_id: brancasId,
      p_pretas_id: pretasId,
      p_resultado: parseFloat(resultado) // Garante que o banco receba um número (1, 0 ou 0.5)
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setMensagem({ texto: 'Erro ao registrar partida. Tente novamente.', tipo: 'erro' });
    } else {
      setMensagem({ texto: 'Partida registrada com sucesso! O MMR foi atualizado.', tipo: 'sucesso' });
      // Limpa o formulário após o sucesso
      setBrancasId('');
      setPretasId('');
      setResultado('');
    }
  }

  return (
    <div className="pb-10 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-center mt-4 text-zinc-100">Registrar Partida</h2>

      <form onSubmit={handleSubmit} className="bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50 shadow-xl flex flex-col gap-6">
        
        {/* Bloco das Peças Brancas */}
        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700/50 border-t-4 border-t-zinc-200">
          <label className="block text-sm font-bold text-zinc-300 mb-2">⚪ Jogador de Brancas</label>
          <select 
            value={brancasId} 
            onChange={(e) => setBrancasId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-400 transition-colors"
          >
            <option value="">Selecione um jogador...</option>
            {jogadores.map(j => (
              <option key={j.id} value={j.id}>{j.nome}</option>
            ))}
          </select>
        </div>

        {/* Bloco das Peças Pretas */}
        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700/50 border-t-4 border-t-zinc-800">
          <label className="block text-sm font-bold text-zinc-300 mb-2">⚫ Jogador de Pretas</label>
          <select 
            value={pretasId} 
            onChange={(e) => setPretasId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="">Selecione um jogador...</option>
            {jogadores.map(j => (
              <option key={j.id} value={j.id}>{j.nome}</option>
            ))}
          </select>
        </div>

        {/* Bloco do Resultado */}
        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-3 text-center">Resultado</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setResultado('1')}
              className={`p-3 rounded-xl text-sm font-bold transition-all border ${resultado === '1' ? 'bg-zinc-200 text-zinc-900 border-zinc-200' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
            >
              Vitória Brancas
            </button>
            <button
              type="button"
              onClick={() => setResultado('0.5')}
              className={`p-3 rounded-xl text-sm font-bold transition-all border ${resultado === '0.5' ? 'bg-zinc-500 text-white border-zinc-500' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
            >
              Empate
            </button>
            <button
              type="button"
              onClick={() => setResultado('0')}
              className={`p-3 rounded-xl text-sm font-bold transition-all border ${resultado === '0' ? 'bg-zinc-950 text-white border-zinc-600 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800'}`}
            >
              Vitória Pretas
            </button>
          </div>
        </div>

        {/* Feedback visual de erro ou sucesso */}
        {mensagem.texto && (
          <div className={`p-4 rounded-lg text-sm font-bold text-center ${mensagem.tipo === 'erro' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
            {mensagem.texto}
          </div>
        )}

        {/* Botão de Envio */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white font-black py-4 rounded-xl mt-2 transition-colors flex justify-center items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            "SALVAR PARTIDA"
          )}
        </button>
      </form>
    </div>
  );
}