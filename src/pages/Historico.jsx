import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Historico() {
  const [partidas, setPartidas] = useState([]);
  const [jogadoresMapa, setJogadoresMapa] = useState({});
  const [carregando, setCarregando] = useState(true);

  // Admin detection
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal de confirmação
  const [modalAberto, setModalAberto] = useState(false);
  const [partidaSelecionada, setPartidaSelecionada] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [feedback, setFeedback] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    // Checa se o admin está logado
    const senha = localStorage.getItem('admin_password');
    setIsAdmin(!!senha);

    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      // Busca todos os jogadores para mapear IDs → nomes
      const resJogadores = await fetch(`${API_BASE_URL}/jogadores`);
      if (resJogadores.ok) {
        const jogadores = await resJogadores.json();
        const mapa = {};
        jogadores.forEach(j => mapa[j.id] = j.nome);
        setJogadoresMapa(mapa);
      }

      // Busca todas as partidas
      const resPartidas = await fetch(`${API_BASE_URL}/partidas`);
      if (resPartidas.ok) {
        const dados = await resPartidas.json();
        setPartidas(dados);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
    setCarregando(false);
  }

  // Abre o modal de confirmação
  function abrirModalExclusao(partida) {
    setPartidaSelecionada(partida);
    setModalAberto(true);
    setFeedback({ texto: '', tipo: '' });
  }

  // Fecha o modal
  function fecharModal() {
    setModalAberto(false);
    setPartidaSelecionada(null);
  }

  // Executa a exclusão
  async function confirmarExclusao() {
    if (!partidaSelecionada) return;

    setExcluindo(true);
    setFeedback({ texto: '', tipo: '' });

    try {
      const senhaAdmin = localStorage.getItem('admin_password') || '';

      const res = await fetch(`${API_BASE_URL}/partidas/${partidaSelecionada.id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': senhaAdmin
        }
      });

      if (res.status === 401) {
        setFeedback({ texto: 'Sessão expirada. Faça login novamente.', tipo: 'erro' });
        setExcluindo(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        setFeedback({ texto: 'Erro: ' + (errorData.error || 'Tente novamente.'), tipo: 'erro' });
        setExcluindo(false);
        return;
      }

      // Sucesso — fechar modal e recarregar dados
      fecharModal();
      setFeedback({ texto: 'Partida excluída! O MMR de todos os jogadores foi recalculado.', tipo: 'sucesso' });
      await carregarDados();

    } catch (err) {
      console.error("Erro ao excluir partida:", err);
      setFeedback({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
    }

    setExcluindo(false);
  }

  // Helpers para determinar o resultado
  function getResultadoInfo(partida) {
    const nomeBrancas = jogadoresMapa[partida.jogador_brancas_id] || 'Desconhecido';
    const nomePretas = jogadoresMapa[partida.jogador_pretas_id] || 'Desconhecido';

    let vencedor = '';
    let corBadge = '';
    let textoBadge = '';

    if (partida.resultado === 1) {
      vencedor = nomeBrancas;
      corBadge = 'bg-zinc-200 text-zinc-900';
      textoBadge = '⚪ Brancas';
    } else if (partida.resultado === 0) {
      vencedor = nomePretas;
      corBadge = 'bg-zinc-700 text-zinc-100';
      textoBadge = '⚫ Pretas';
    } else {
      vencedor = null; // Empate
      corBadge = 'bg-zinc-600 text-zinc-200';
      textoBadge = '½ Empate';
    }

    return { nomeBrancas, nomePretas, vencedor, corBadge, textoBadge };
  }

  return (
    <div className="pb-10 animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 text-center mt-4 text-zinc-100">
        Histórico de Partidas
      </h2>
      <p className="text-center text-zinc-500 text-sm mb-6">
        {carregando ? 'Carregando...' : `${partidas.length} partida${partidas.length !== 1 ? 's' : ''} registrada${partidas.length !== 1 ? 's' : ''}`}
      </p>

      {/* Feedback global (sucesso/erro de exclusão) */}
      {feedback.texto && !modalAberto && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center ${feedback.tipo === 'erro' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
          {feedback.texto}
        </div>
      )}

      {carregando ? (
        <div className="flex justify-center mt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : partidas.length === 0 ? (
        <div className="text-center text-zinc-500 py-12 bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700">
          Nenhuma partida registrada ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {partidas.map(partida => {
            const { nomeBrancas, nomePretas, vencedor, corBadge, textoBadge } = getResultadoInfo(partida);
            const dataPartida = new Date(partida.created_at).toLocaleDateString('pt-BR');
            const horaPartida = new Date(partida.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const varBrancas = partida.variacao_mmr_brancas;
            const varPretas = partida.variacao_mmr_pretas;

            return (
              <div
                key={partida.id}
                className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 hover:bg-zinc-800 transition-colors relative group"
              >
                {/* Botão de exclusão (apenas admin) */}
                {isAdmin && (
                  <button
                    onClick={() => abrirModalExclusao(partida)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir partida"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                )}

                {/* Data e Badge de resultado */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-500 text-xs font-medium">{dataPartida} às {horaPartida}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${corBadge} ${isAdmin ? 'mr-7' : ''}`}>
                    {textoBadge}
                  </span>
                </div>

                {/* Confronto */}
                <div className="flex items-center justify-between">
                  {/* Jogador Brancas */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚪</span>
                      <Link
                        to={`/perfil/${partida.jogador_brancas_id}`}
                        className={`font-bold text-sm hover:underline ${partida.resultado === 1 ? 'text-green-400' : partida.resultado === 0 ? 'text-red-400' : 'text-zinc-300'}`}
                      >
                        {nomeBrancas}
                      </Link>
                    </div>
                    <div className={`text-xs font-black mt-0.5 ml-6 ${varBrancas > 0 ? 'text-green-500' : varBrancas < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                      {varBrancas > 0 ? '+' : ''}{varBrancas} pts
                    </div>
                  </div>

                  {/* VS central */}
                  <div className="px-3">
                    <span className="text-zinc-600 font-black text-xs">VS</span>
                  </div>

                  {/* Jogador Pretas */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/perfil/${partida.jogador_pretas_id}`}
                        className={`font-bold text-sm hover:underline ${partida.resultado === 0 ? 'text-green-400' : partida.resultado === 1 ? 'text-red-400' : 'text-zinc-300'}`}
                      >
                        {nomePretas}
                      </Link>
                      <span className="text-sm">⚫</span>
                    </div>
                    <div className={`text-xs font-black mt-0.5 mr-6 ${varPretas > 0 ? 'text-green-500' : varPretas < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                      {varPretas > 0 ? '+' : ''}{varPretas} pts
                    </div>
                  </div>
                </div>

                {/* Linha de resultado */}
                {vencedor && (
                  <div className="text-center mt-2 pt-2 border-t border-zinc-700/30">
                    <span className="text-[11px] text-zinc-500 font-medium">
                      🏆 <span className="text-zinc-300 font-bold">{vencedor}</span> venceu
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========== MODAL DE CONFIRMAÇÃO ========== */}
      {modalAberto && partidaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!excluindo ? fecharModal : undefined}
          ></div>

          {/* Modal */}
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            {/* Ícone de alerta */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/10 border border-red-500/30 w-14 h-14 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-black text-white text-center mb-2">Excluir Partida?</h3>

            <p className="text-zinc-400 text-sm text-center mb-4">
              Essa ação <span className="text-red-400 font-bold">não pode ser desfeita</span>. O MMR de todos os jogadores será recalculado.
            </p>

            {/* Detalhes da partida */}
            <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-xl p-3 mb-5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span>⚪</span>
                  <span className="font-bold text-zinc-200">
                    {jogadoresMapa[partidaSelecionada.jogador_brancas_id] || 'Desconhecido'}
                  </span>
                </div>
                <span className="text-zinc-600 font-black text-xs">VS</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-200">
                    {jogadoresMapa[partidaSelecionada.jogador_pretas_id] || 'Desconhecido'}
                  </span>
                  <span>⚫</span>
                </div>
              </div>
              <div className="text-center mt-1.5">
                <span className="text-zinc-500 text-[11px] font-medium">
                  {new Date(partidaSelecionada.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Feedback de erro no modal */}
            {feedback.texto && feedback.tipo === 'erro' && (
              <div className="mb-4 p-3 rounded-lg text-sm font-bold text-center bg-red-500/20 text-red-400 border border-red-500/30">
                {feedback.texto}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={fecharModal}
                disabled={excluindo}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-bold py-3 rounded-xl transition-colors border border-zinc-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={excluindo}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {excluindo ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
