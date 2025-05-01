import { useEffect, useState } from "react";

interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  valor: number;
  data: string;
  hora: string;
  profissional: string;
  status: "PENDENTE" | "CONCLUÍDO" | "CANCELADO";
}

interface Financeiro {
  id: string;
  descricao: string;
  tipo: string;
  valor: string;
  categoria: string;
  status: "Entrada" | "Saída";
}

export default function Home() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([]);

  const token = localStorage.getItem("authToken"); 

  
  const fetchAgendamentos = async () => {
    try {
      const res = await fetch("http://localhost:3000/agendamentos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAgendamentos(data);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    }
  };

  
  const fetchFinanceiro = async () => {
    try {
      const res = await fetch("http://localhost:3000/financeiro", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setFinanceiro(data);
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAgendamentos();
      fetchFinanceiro();
    }
  }, [token]);

  const agendamentosHoje = agendamentos.length;
  const faturamentoDia = financeiro
    .filter(f => f.status === "Entrada")
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  const faturamentoMes = faturamentoDia * 30; 
  const pendenciasPagamento = financeiro.filter(f => f.status === "Saída").length;

  return (
    <section className="p-6 text-[#5C4033] min-h-screen bg-[#fffaf7]">
      <h2 className="text-2xl font-bold text-[#A06D52] mb-6">Dashboard</h2>

      {/* Visão Geral */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">📊 Visão Geral</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Total de agendamentos hoje:</strong> {agendamentosHoje}</li>
          <li><strong>Clientes atendidos no mês:</strong> {agendamentosHoje * 2}</li> {/* Exemplo, pode ajustar */}
          <li><strong>Serviços mais realizados:</strong> Escova, Manicure, Corte feminino</li>
        </ul>
      </div>

      {/* Próximos Agendamentos */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">📅 Próximos Agendamentos</h3>
        <table className="w-full text-left border border-[#d5b8a3] rounded-md">
          <thead className="bg-[#f3e5dc]">
            <tr>
              <th className="p-2">Horário</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Profissional</th>
              <th className="p-2">Serviço</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.slice(0, 3).map((item) => (
              <tr key={item.id} className="hover:bg-[#f9f1ed]">
                <td className="p-2">{item.hora}</td>
                <td className="p-2">{item.cliente}</td>
                <td className="p-2">{item.profissional}</td>
                <td className="p-2">{item.servico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financeiro */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">💰 Financeiro</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Faturamento do dia:</strong> R$ {faturamentoDia},00</li>
          <li><strong>Faturamento do mês:</strong> R$ {faturamentoMes},00</li>
          <li><strong>Pendências de pagamento:</strong> {pendenciasPagamento}</li>
        </ul>
      </div>

      {/* Equipe */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">🧑‍💼 Equipe Hoje</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>4 profissionais em atendimento</li>
          <li>1 profissional em pausa</li>
          <li>Nenhuma ausência registrada</li>
        </ul>
      </div>

      {/* Dicas */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">📌 Dicas de Gestão</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Ofereça promoções nas quartas-feiras (baixo movimento)</li>
          <li>Envie lembretes automáticos para os clientes</li>
          <li>Atualize sempre os dados dos profissionais e serviços</li>
        </ul>
      </div>
    </section>
  );
}
