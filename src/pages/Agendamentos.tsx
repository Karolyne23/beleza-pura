import { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cpf: string;
}

export default function ClientesAgendados() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Cliente, "id">>({
    nome: "",
    telefone: "",
    cpf: "",
  });

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("clientesAgendados") || "[]");
    setClientes(dados);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome && formData.telefone && formData.cpf) {
      const novoCliente: Cliente = { id: Date.now().toString(), ...formData };
      const novosClientes = [...clientes, novoCliente];
      setClientes(novosClientes);
      localStorage.setItem("clientesAgendados", JSON.stringify(novosClientes));
      setFormData({ nome: "", telefone: "", cpf: "" });
      setMostrarModal(false);
    } else {
      alert("Preencha todos os campos!");
    }
  };

  const excluirCliente = (id: string) => {
    const novosClientes = clientes.filter(cliente => cliente.id !== id);
    setClientes(novosClientes);
    localStorage.setItem("clientesAgendados", JSON.stringify(novosClientes));
  };

  return (
    <div className="p-6 min-h-screen bg-[#fffaf7] text-[#5C4033] relative">
      <h2 className="text-2xl font-bold text-center mb-6">CLIENTES CADASTRADOS</h2>

      <div className="space-y-4 max-w-md mx-auto">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="bg-white p-4 rounded shadow relative">
            {/* Botão de excluir */}
            <button
              title="Excluir Cliente"
              onClick={() => excluirCliente(cliente.id)}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
            >
              <FaTrash />
            </button>

            {/* Informações do cliente */}
            <p className="font-semibold">{cliente.nome}</p>
            <p className="text-sm text-gray-700">{cliente.telefone}</p>
            <p className="text-sm text-gray-500 italic">CPF: {cliente.cpf}</p>
          </div>
        ))}
      </div>

      {/* Botão flutuante para novo cliente */}
      <button
        title="Novo cliente agendado"
        className="absolute bottom-6 right-6 bg-[#A06D52] hover:bg-[#8e5e41] text-white p-4 rounded-full shadow-lg"
        onClick={() => setMostrarModal(true)}
      >
        <FaPlus size={16} />
      </button>

      {/* Modal de cadastro */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Cadastrar Novo Cliente</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full mb-3 p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="telefone"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full mb-3 p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="cpf"
                placeholder="CPF"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full mb-3 p-2 border border-gray-300 rounded"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#A06D52] text-white px-4 py-2 rounded hover:bg-[#8e5e41]"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
