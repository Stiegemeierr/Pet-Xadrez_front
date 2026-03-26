import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 p-4 sticky top-0 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <h1 className="text-xl font-black text-green-500 tracking-wider">PET<span className="text-white">Xadrez</span></h1>
        <div className="flex gap-5">
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
        </div>
      </div>
    </nav>
  );
}