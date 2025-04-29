import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";
import Clientes from "./pages/Clientes";
import Profissionais from "./pages/Profissionais";
import Agendamentos from "./pages/Agendamentos";
import Financeiro from "./pages/Financeiro";
import ListaFinanceiro from "./pages/ListaFinanceiro";
import Login from "./pages/Login";
import ClientesAgendados from "./pages/ClientesAgendados";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="bg-[#FDF5F2] min-h-screen">
      {!isLoginPage && <Sidebar />}
      {!isLoginPage && <Header />}
      <main className={!isLoginPage ? "pt-20 md:ml-64 p-6" : "p-0"}>{children}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/profissionais" element={<Profissionais />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/agendamentos/clientes" element={<ClientesAgendados />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/financeiro/lista" element={<ListaFinanceiro />} />      
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
