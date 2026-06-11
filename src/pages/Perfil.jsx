import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Area, AreaChart } from 'recharts';

export default function Perfil() {
  const { id } = useParams();
  const [jogador, setJogador] = useState(null);
  const [partidas, setPartidas] = useState([]);
  const [jogadoresMapa, setJogadoresMapa] = useState({});
  const [mmrHistorico, setMmrHistorico] = useState([]);
  const [conquistas, setConquistas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Admin e edicao
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [formBio, setFormBio] = useState('');
  const [formCurso, setFormCurso] = useState('');
  const [formSemestre, setFormSemestre] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [feedbackEditar, setFeedbackEditar] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem('admin_password'));

    async function carregarDados() {
      try {
        // 1. Busca os dados do jogador atual
        const resJogador = await fetch(`${API_BASE_URL}/jogadores/${id}`);
        if (resJogador.ok) {
          const dadosJogador = await resJogador.json();
          setJogador(dadosJogador);
          setFormBio(dadosJogador.bio || '');
          setFormCurso(dadosJogador.curso || '');
          setFormSemestre(dadosJogador.semestre || '');
        }

        // 2. Busca todos os jogadores para podermos mostrar o nome dos oponentes
        const resTodos = await fetch(`${API_BASE_URL}/jogadores`);
        if (resTodos.ok) {
          const todosJogadores = await resTodos.json();
          const mapa = {};
          todosJogadores.forEach(j => mapa[j.id] = j.nome);
          setJogadoresMapa(mapa);
        }

        // 3. Busca o histórico de partidas (sem limite)
        const resPartidas = await fetch(`${API_BASE_URL}/jogadores/${id}/partidas`);
        if (resPartidas.ok) {
          const historico = await resPartidas.json();
          setPartidas(historico);
        }

        // 4. Busca o histórico de MMR para o gráfico
        const resHistorico = await fetch(`${API_BASE_URL}/jogadores/${id}/mmr-historico`);
        if (resHistorico.ok) {
          const dados = await resHistorico.json();
          // Formata as datas para exibição
          const formatado = dados.map((ponto, index) => ({
            ...ponto,
            label: index === 0 ? 'Início' : new Date(ponto.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          }));
          setMmrHistorico(formatado);
        }

        // 5. Busca conquistas
        const resConquistas = await fetch(`${API_BASE_URL}/jogadores/${id}/conquistas`);
        if (resConquistas.ok) {
          const dados = await resConquistas.json();
          setConquistas(dados);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do perfil:", err);
      }
      
      setCarregando(false);
    }
    carregarDados();
  }, [id]);

  // Salvar edição do perfil
  async function handleSalvarPerfil(e) {
    e.preventDefault();
    setSalvando(true);
    setFeedbackEditar({ texto: '', tipo: '' });

    try {
      const senhaAdmin = localStorage.getItem('admin_password') || '';
      const res = await fetch(`${API_BASE_URL}/jogadores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': senhaAdmin
        },
        body: JSON.stringify({
          bio: formBio,
          curso: formCurso,
          semestre: formSemestre
        })
      });

      if (res.ok) {
        const dadosAtualizados = await res.json();
        setJogador(dadosAtualizados);
        setFeedbackEditar({ texto: 'Perfil atualizado!', tipo: 'sucesso' });
        setTimeout(() => setModalEditarAberto(false), 1000);
      } else {
        const erro = await res.json();
        setFeedbackEditar({ texto: erro.error || 'Erro ao salvar.', tipo: 'erro' });
      }
    } catch (err) {
      setFeedbackEditar({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
    }

    setSalvando(false);
  }

  // Tooltip customizado do gráfico
  function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-green-400 font-black text-lg">{payload[0].value} <span className="text-xs text-zinc-500 font-bold">MMR</span></p>
          <p className="text-zinc-500 text-xs">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  }

  if (carregando) return (
    <div className="flex justify-center mt-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (!jogador) return <div className="text-center mt-10 text-zinc-400">Jogador não encontrado.</div>;

  // Cálculo de Winrate
  const totalJogos = jogador.vitorias + jogador.derrotas + jogador.empates;
  const winrate = totalJogos > 0 ? Math.round((jogador.vitorias / totalJogos) * 100) : 0;

  // Contagem de conquistas desbloqueadas
  const conquistasDesbloqueadas = conquistas.filter(c => c.desbloqueada).length;

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
        
        {/* Curso e Semestre */}
        {(jogador.curso || jogador.semestre) && (
          <div className="text-zinc-400 text-sm font-medium">
            {jogador.curso}{jogador.curso && jogador.semestre ? ' — ' : ''}{jogador.semestre ? `${jogador.semestre}º semestre` : ''}
          </div>
        )}

        {/* Bio */}
        {jogador.bio ? (
          <p className="text-zinc-500 text-sm italic mt-2 mb-4 max-w-xs mx-auto">{jogador.bio}</p>
        ) : (
          <div className="text-zinc-600 text-xs mt-1 mb-4">Membro do PETXadrez</div>
        )}
        
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

      {/* Botão Editar Perfil (admin) */}
      {isAdmin && (
        <button
          onClick={() => { setModalEditarAberto(true); setFeedbackEditar({ texto: '', tipo: '' }); }}
          className="w-full mt-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Editar Perfil
        </button>
      )}

      {/* Gráfico de Evolução do MMR */}
      {mmrHistorico.length > 1 && (
        <>
          <h3 className="text-lg font-bold text-zinc-200 mt-10 mb-4">Evolução do Rating</h3>
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mmrHistorico} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mmrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10, fill: '#71717a' }} 
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#71717a' }} 
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 30', 'dataMax + 30']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={500} stroke="#3f3f46" strokeDasharray="4 4" />
                <Area 
                  type="monotone" 
                  dataKey="mmr" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fill="url(#mmrGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#22c55e', stroke: '#18181b', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Conquistas */}
      {conquistas.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-zinc-200 mt-10 mb-1">Conquistas</h3>
          <p className="text-zinc-500 text-xs mb-4">{conquistasDesbloqueadas} de {conquistas.length} desbloqueadas</p>
          <div className="grid grid-cols-2 gap-2">
            {conquistas.map(conquista => (
              <div
                key={conquista.id}
                className={`rounded-xl p-3 border transition-all ${
                  conquista.desbloqueada
                    ? 'bg-zinc-800/80 border-zinc-700/80'
                    : 'bg-zinc-900/50 border-zinc-800/50 opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-xl ${conquista.desbloqueada ? '' : 'grayscale'}`}>{conquista.icone}</span>
                  <div>
                    <div className={`text-xs font-black ${conquista.desbloqueada ? 'text-zinc-100' : 'text-zinc-600'}`}>
                      {conquista.nome}
                    </div>
                    <div className={`text-[10px] ${conquista.desbloqueada ? 'text-zinc-500' : 'text-zinc-700'}`}>
                      {conquista.descricao}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Histórico de Partidas */}
      <h3 className="text-lg font-bold text-zinc-200 mt-10 mb-4">Últimas Partidas</h3>
      
      {partidas.length === 0 ? (
        <div className="text-center text-zinc-500 py-8 bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700">
          Nenhuma partida registrada ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {partidas.slice(0, 10).map(partida => {
            // Lógica para descobrir a perspectiva do jogador nesta partida
            const jogouDeBrancas = partida.jogador_brancas_id === jogador.id;
            const oponenteId = jogouDeBrancas ? partida.jogador_pretas_id : partida.jogador_brancas_id;
            const nomeOponente = jogadoresMapa[oponenteId] || 'Desconhecido';
            
            // Usa a nova estrutura do banco para variação de MMR
            const variacaoPontos = jogouDeBrancas ? partida.variacao_mmr_brancas : partida.variacao_mmr_pretas;
            
            // Descobre se ele ganhou, perdeu ou empatou
            let resultadoTexto = '';
            let corResultado = '';
            let sinalMmr = '';

            if (partida.resultado === 0.5) {
              resultadoTexto = 'Empate';
              corResultado = 'text-zinc-400';
              sinalMmr = variacaoPontos > 0 ? '+' : '';
            } else if ((jogouDeBrancas && partida.resultado === 1) || (!jogouDeBrancas && partida.resultado === 0)) {
              resultadoTexto = 'Vitória';
              corResultado = 'text-green-500';
              sinalMmr = '+';
            } else {
              resultadoTexto = 'Derrota';
              corResultado = 'text-red-500';
              sinalMmr = ''; // O número já virá negativo do backend
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
                  {sinalMmr}{variacaoPontos}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========== MODAL DE EDIÇÃO DE PERFIL ========== */}
      {modalEditarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!salvando ? () => setModalEditarAberto(false) : undefined}
          ></div>

          {/* Modal */}
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-white text-center mb-5">Editar Perfil</h3>

            <form onSubmit={handleSalvarPerfil} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Bio</label>
                <textarea
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Uma frase sobre o jogador..."
                  maxLength={200}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                />
                <div className="text-right text-[10px] text-zinc-600 mt-0.5">{formBio.length}/200</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Curso</label>
                <input
                  type="text"
                  value={formCurso}
                  onChange={(e) => setFormCurso(e.target.value)}
                  placeholder="Ex: Ciência da Computação"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Semestre</label>
                <input
                  type="text"
                  value={formSemestre}
                  onChange={(e) => setFormSemestre(e.target.value)}
                  placeholder="Ex: 5"
                  maxLength={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              {/* Feedback */}
              {feedbackEditar.texto && (
                <div className={`p-3 rounded-lg text-sm font-bold text-center ${feedbackEditar.tipo === 'erro' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                  {feedbackEditar.texto}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setModalEditarAberto(false)}
                  disabled={salvando}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-bold py-3 rounded-xl transition-colors border border-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white font-black py-3 rounded-xl transition-colors flex items-center justify-center"
                >
                  {salvando ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "SALVAR"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}