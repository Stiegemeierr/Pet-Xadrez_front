import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Ranking() {
  const [jogadores, setJogadores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarJogadores() {
      try {
        const res = await fetch(`${API_BASE_URL}/jogadores`);
        if (res.ok) {
          const data = await res.json();
          setJogadores(data);
        }
      } catch (err) {
        console.error("Erro ao carregar ranking", err);
      }
      setCarregando(false);
    }
    buscarJogadores();
  }, []);

  return (
    <div className="pb-10">
      <h2 className="text-2xl font-bold mb-6 text-center mt-4">Top Jogadores</h2>
      
      {carregando ? (
        <div className="flex justify-center mt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jogadores.map((jogador, index) => (
            <Link 
              to={`/perfil/${jogador.id}`} 
              key={jogador.id} 
              className="bg-zinc-800/50 hover:bg-zinc-800 transition-colors rounded-xl p-4 flex items-center justify-between border border-zinc-700/50"
            >
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black w-8 text-center ${
                  index === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 
                  index === 1 ? 'text-zinc-300' : 
                  index === 2 ? 'text-amber-600' : 
                  'text-zinc-600'
                }`}>
                  {index + 1}
                </span>
                
                <div>
                  <h3 className="font-bold text-lg text-zinc-100">{jogador.nome}</h3>
                  <div className="flex gap-2 text-xs font-medium text-zinc-500 mt-0.5">
                    <span className="text-green-500/80">{jogador.vitorias}V</span>
                    <span>•</span>
                    <span className="text-red-500/80">{jogador.derrotas}D</span>
                    <span>•</span>
                    <span className="text-zinc-400/80">{jogador.empates}E</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-green-400">{jogador.mmr_atual}</span>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-[-4px]">MMR</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}