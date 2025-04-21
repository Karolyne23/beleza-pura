export default function Home() {
  return (
    <section className="p-6 text-[#5C4033]">
      <h2 className="text-2xl font-bold text-[#A06D52] mb-6">Dashboard</h2>

      {/* Visão Geral */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">📊 Visão Geral</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Total de agendamentos hoje:</strong> 12</li>
          <li><strong>Clientes atendidos no mês:</strong> 84</li>
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
            <tr className="hover:bg-[#f9f1ed]">
              <td className="p-2">09:00</td>
              <td className="p-2">Maria Silva</td>
              <td className="p-2">Ana Paula</td>
              <td className="p-2">Escova</td>
            </tr>
            <tr className="hover:bg-[#f9f1ed]">
              <td className="p-2">10:00</td>
              <td className="p-2">João Costa</td>
              <td className="p-2">Carlos Mendes</td>
              <td className="p-2">Corte masculino</td>
            </tr>
            <tr className="hover:bg-[#f9f1ed]">
              <td className="p-2">11:30</td>
              <td className="p-2">Fernanda Lopes</td>
              <td className="p-2">Juliana Lima</td>
              <td className="p-2">Manicure</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financeiro */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">💰 Financeiro</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Faturamento do dia:</strong> R$ 750,00</li>
          <li><strong>Faturamento do mês:</strong> R$ 9.340,00</li>
          <li><strong>Pendências de pagamento:</strong> 2</li>
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
