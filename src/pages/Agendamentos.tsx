interface Agendamento {
  cliente: string;
  servico: string;
  valor: number;
  data: string;
  hora: string;
  profissional: string;
  status: "PENDENTE" | "CONCLUÍDO" | "CANCELADO";
}

const agendamentos: Agendamento[] = [
  {
    cliente: "Ana Maria",
    servico: "Corte",
    valor: 70,
    data: "24/04",
    hora: "14h",
    profissional: "Célia",
    status: "PENDENTE",
  },
  {
    cliente: "Joyce",
    servico: "Corte",
    valor: 70,
    data: "24/04",
    hora: "14h",
    profissional: "Célia",
    status: "CONCLUÍDO",
  },
  {
    cliente: "Fernanda",
    servico: "Corte",
    valor: 70,
    data: "24/04",
    hora: "14h",
    profissional: "Célia",
    status: "CANCELADO",
  },
];

export default function Agendamentos() {
  return (
    <div className="p-6 min-h-screen bg-[#fffaf7] text-[#5C4033]">
      <h2 className="text-2xl font-bold text-center mb-6">AGENDAMENTOS</h2>

      <div className="space-y-4">
        {agendamentos.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p className="text-right text-sm font-bold tracking-wider"
              style={{
                color:
                  item.status === "PENDENTE"
                    ? "#d99c00"
                    : item.status === "CONCLUÍDO"
                    ? "#2ba942"
                    : "#d35454",
              }}
            >
              {item.status}
            </p>

            <p><strong>Cliente:</strong> {item.cliente}</p>
            <p>
              <strong>Serviço:</strong> {item.servico} R$ {item.valor},00
            </p>
            <p>
              <strong>Dia:</strong> {item.data} às {item.hora}
            </p>
            <p>
              <strong>Profissional:</strong> {item.profissional}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.history.back()}
        className="mt-8 block mx-auto bg-[#A06D52] text-white px-6 py-2 rounded hover:bg-[#8e5e41]"
      >
        Voltar para tela de Cliente
      </button>
    </div>
  );
}
