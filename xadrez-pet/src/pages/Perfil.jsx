import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Perfil() {
  const { id } = useParams(); // Pega o ID da URL
  const [jogador, setJogador] = useState(null);
  const [partidas, setPartidas] = useState([]);
  const [jogadoresMapa, setJogadoresMapa] = useState({}); // Para traduzir IDs em nomes
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      // 1. Busca os dados do jogador atual
      const { data: dadosJogador } = await supabase
        .from('jogadores')
        .select('*')
        .eq('id', id)
        .single();
      
      if (dadosJogador) setJogador(dadosJogador);

      // 2. Busca todos os jogadores para podermos mostrar o nome dos oponentes
      const { data: todosJogadores } = await supabase.from('jogadores').select('id, nome');
      const mapa = {};
      if (todosJogadores) {
        todosJogadores.forEach(j => mapa[j.id] = j.nome);
        setJogadoresMapa(mapa);
      }

      // 3. Busca o histórico de partidas (onde ele foi brancas OU pretas)
      const { data: historico } = await supabase
        .from('partidas')
        .select('*')
        .or(`jogador_brancas_id.eq.${id},jogador_pretas_id.eq.${id}`)
        .order('created_at', { ascending: false })
        .limit(10); // Mostra as últimas 10

      if (historico) setPartidas(historico);
      
      setCarregando(false);
    }
    carregarDados();
  }, [id]);

  if (carregando) return (
    <div className="flex justify-center mt-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (!jogador) return <div className="text-center mt-10 text-zinc-400">Jogador não encontrado.</div>;

  // Cálculo de Winrate
  const totalJogos = jogador.vitorias + jogador.derrotas + jogador.empates;
  const winrate = totalJogos > 0 ? Math.round((jogador.vitorias / totalJogos) * 100) : 0;

  return (
    <div className="pb-10 animate-fade-in">
      {/* Botão Voltar */}
      <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors text-sm font-bold">
        <span className="mr-2">←</span> Voltar para o Ranking
      </Link>

      {/* Card Principal do Jogador */}
      <div className="bg-zinc-800/80 border border-zinc-700 p-6 rounded-2xl text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
        <h2 className="text-3xl font-black text-white mb-1">{jogador.nome}</h2>
        <div className="text-zinc-400 text-sm font-medium mb-6">Membro do PETXadrez</div>
        
        <div className="flex justify-center items-end gap-2 mb-6">
          <span className="text-5xl font-black text-green-400 tracking-tighter">{jogador.mmr_atual}</span>
          <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest pb-1">MMR</span>
        </div>

        <div className="grid grid-cols-4 gap-2 border-t border-zinc-700/50 pt-5 mt-2">
          <div>
            <div className="text-xs text-zinc-500 font-bold uppercase">Vit</div>
            <div className="text-lg font-black text-white">{jogador.vitorias}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-bold uppercase">Der</div>
            <div className="text-lg font-black text-white">{jogador.derrotas}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-bold uppercase">Emp</div>
            <div className="text-lg font-black text-white">{jogador.empates}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-bold uppercase">WR</div>
            <div className="text-lg font-black text-green-400">{winrate}%</div>
          </div>
        </div>
      </div>

      {/* Histórico de Partidas */}
      <h3 className="text-lg font-bold text-zinc-200 mt-10 mb-4">Últimas Partidas</h3>
      
      {partidas.length === 0 ? (
        <div className="text-center text-zinc-500 py-8 bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700">
          Nenhuma partida registrada ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {partidas.map(partida => {
            // Lógica para descobrir a perspectiva do jogador nesta partida
            const jogouDeBrancas = partida.jogador_brancas_id === jogador.id;
            const oponenteId = jogouDeBrancas ? partida.jogador_pretas_id : partida.jogador_brancas_id;
            const nomeOponente = jogadoresMapa[oponenteId] || 'Desconhecido';
            
            // Descobre se ele ganhou, perdeu ou empatou
            let resultadoTexto = '';
            let corResultado = '';
            let sinalMmr = '';

            if (partida.resultado === 0.5) {
              resultadoTexto = 'Empate';
              corResultado = 'text-zinc-400';
              sinalMmr = '±';
            } else if ((jogouDeBrancas && partida.resultado === 1) || (!jogouDeBrancas && partida.resultado === 0)) {
              resultadoTexto = 'Vitória';
              corResultado = 'text-green-500';
              sinalMmr = '+';
            } else {
              resultadoTexto = 'Derrota';
              corResultado = 'text-red-500';
              sinalMmr = '-';
            }

            // Formata a data (DD/MM/AAAA)
            const dataPartida = new Date(partida.created_at).toLocaleDateString('pt-BR');

            return (
              <div key={partida.id} className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-black uppercase ${corResultado}`}>{resultadoTexto}</span>
                    <span className="text-zinc-600 text-xs font-medium">• {dataPartida}</span>
                  </div>
                  <div className="text-sm font-medium text-white">
                    <span className="text-zinc-500 text-xs mr-2">{jogouDeBrancas ? '⚪' : '⚫'}</span>
                    vs {nomeOponente}
                  </div>
                </div>
                
                <div className={`text-lg font-black ${corResultado}`}>
                  {sinalMmr}{partida.variacao_mmr}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}