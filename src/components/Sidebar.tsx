import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

export default function Sidebar() {
  const [usuario, setUsuario] = useState<{ nome?: string; email?: string } | null>(null);
  const [abrirAgendamentos, setAbrirAgendamentos] = useState(false);
  const [abrirFinanceiro, setAbrirFinanceiro] = useState(false);
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
          <Link to="/profissionais" className="hover:underline">Profissionais</Link>

          {/* AGENDAMENTOS */}
          <div>
            <button
              onClick={() => setAbrirAgendamentos(!abrirAgendamentos)}
              className="hover:underline flex items-center gap-2"
            >
              Agendamentos
              <FaChevronDown
                className={`transform transition-transform duration-200 ${abrirAgendamentos ? "rotate-180" : ""}`}
              />
            </button>

            {abrirAgendamentos && (
              <div className="ml-4 mt-1 text-sm flex flex-col gap-1">
                <Link to="/agendamentos/clientes" className="hover:underline">Clientes Agendados</Link>
              </div>
            )}
          </div>

          {/* FINANCEIRO */}
          <div>
            <button
              onClick={() => setAbrirFinanceiro(!abrirFinanceiro)}
              className="hover:underline flex items-center gap-2"
            >
              Financeiro
              <FaChevronDown
                className={`transform transition-transform duration-200 ${abrirFinanceiro ? "rotate-180" : ""}`}
              />
            </button>

            {abrirFinanceiro && (
              <div className="ml-4 mt-1 text-sm flex flex-col gap-1">
                <Link to="/financeiro" className="hover:underline">Novo Lançamento</Link>
                <Link to="/financeiro/lista" className="hover:underline">Entradas e Saídas</Link>
              </div>
            )}
          </div>
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
