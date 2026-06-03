import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Ranking from './pages/Ranking';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import NovoJogador from './pages/NovoJogador';
import Login from './pages/Login';
import Historico from './pages/Historico';

function App() {
  return (
    <BrowserRouter>
      <div className="bg-zinc-900 min-h-screen text-zinc-100 font-sans selection:bg-green-500/30">
        {/* O menu sempre vai ficar no topo, independente da tela */}
        <Navbar /> 
        
        {/* O conteúdo centralizado para telas de celular */}
        <main className="max-w-md mx-auto p-4">
          <Routes>
            <Route path="/" element={<Ranking />} />
            {/* As rotas vazias para não quebrar quando clicarmos no menu */}
            <Route path="/registro" element={<Registro />} />
            <Route path="/perfil/:id" element={<Perfil />} />
            <Route path="/novo-jogador" element={<NovoJogador />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;