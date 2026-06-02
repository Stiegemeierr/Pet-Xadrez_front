import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 p-4 sticky top-0 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <h1 className="text-xl font-black text-green-500 tracking-wider">PET<span className="text-white">Xadrez</span></h1>
        
        {/* Adicionamos uma barra de rolagem horizontal invisível para não quebrar no celular */}
        <div className="flex gap-4 overflow-x-auto whitespace-nowrap no-scrollbar text-sm">
          <Link 
            to="/" 
            className={`font-medium transition-colors ${location.pathname === '/' ? 'text-green-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Ranking
          </Link>
          <Link 
            to="/registro" 
            className={`font-medium transition-colors ${location.pathname === '/registro' ? 'text-green-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Registrar Jogo
          </Link>
          <Link 
            to="/novo-jogador" 
            className={`font-medium transition-colors ${location.pathname === '/novo-jogador' ? 'text-green-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            + Jogador
          </Link>
          <Link 
            to="/login" 
            className={`font-medium transition-colors ml-2 ${location.pathname === '/login' ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Modo Admin"
          >
            🔒
          </Link>
        </div>
      </div>
    </nav>
  );
}