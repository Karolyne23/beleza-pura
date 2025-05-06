import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown, FaHome, FaUsers, FaUserMd, FaCalendarAlt, FaMoneyBillWave, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const [abrirAgendamentos, setAbrirAgendamentos] = useState(false);
  const [abrirFinanceiro, setAbrirFinanceiro] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#A06D52] text-white fixed top-0 left-0 p-6 hidden md:flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6">Beleza Pura</h2>

        {user && (
          <div className="mb-6">
            <p className="text-sm">Olá,</p>
            <p className="font-semibold">{user.nome || user.email}</p>
          </div>
        )}

        <nav className="flex flex-col gap-4">
          <Link to="/" className="hover:bg-[#8e5e41] p-2 rounded flex items-center gap-2">
            <FaHome /> Dashboard
          </Link>
          
          <Link to="/clientes" className="hover:bg-[#8e5e41] p-2 rounded flex items-center gap-2">
            <FaUsers /> Clientes
          </Link>
          
          <Link to="/profissionais" className="hover:bg-[#8e5e41] p-2 rounded flex items-center gap-2">
            <FaUserMd /> Profissionais
          </Link>
          <Link
            to="/agendamentos" className="hover:bg-[#8e5e41] p-2 rounded flex items-center gap-2">
            <FaCalendarAlt /> Agendamentos
          </Link>
          <Link
            to="/financeiro" className="hover:bg-[#8e5e41] p-2 rounded flex items-center gap-2">
            <FaMoneyBillWave /> Financeiro
          </Link>

          
          
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 text-sm text-white hover:bg-[#8e5e41] p-2 rounded flex items-center gap-2"
      >
        <FaSignOutAlt /> Sair
      </button>
    </aside>
  );
}
