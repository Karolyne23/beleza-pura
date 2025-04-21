import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [usuario, setUsuario] = useState<{ nome?: string; email?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const dados = localStorage.getItem("usuario");
    if (dados) {
      setUsuario(JSON.parse(dados));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-[#A06D52] text-white fixed top-0 left-0 p-6 hidden md:flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6">Beleza Pura</h2>
        {usuario && (
          <div className="mb-6">
            <p className="text-sm">Olá,</p>
            <p className="font-semibold">{usuario.nome || usuario.email}</p>
          </div>
        )}
        <nav className="flex flex-col gap-4">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <Link to="/clientes" className="hover:underline">Clientes</Link>

          <div>
            <Link to="/profissionais" className="hover:underline">Profissionais</Link>
          </div>

          <div>
            <Link to="/agendamentos" className="hover:underline">Agendamentos</Link>
            <div className="ml-4 mt-1 text-sm">
              <Link to="/agendamentos/clientes" className="hover:underline">Clientes Agendados</Link>
            </div>
          </div>

          <Link to="/financeiro" className="hover:underline">Financeiro</Link>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 text-sm text-white underline hover:text-gray-300"
      >
        Sair
      </button>
    </aside>
  );
}
