import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

interface Cliente {
  nome: string;
  telefone: string;
  cpf: string;
}

export default function ClientesAgendados() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState<Cliente>({
    nome: "",
    telefone: "",
    cpf: "",
  });

  const token = localStorage.getItem("authToken"); // Supondo que o token de autenticação esteja no localStorage

  // Carrega os clientes
  const fetchClientes = async () => {
    try {
      const res = await fetch("http://localhost:3000/clientes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("Erro ao carregar os clientes:", error);
    }
  };

  // Carrega os dados no useEffect
  useEffect(() => {
    if (token) {
      fetchClientes();
    }
  }, [token]);

  // Atualiza os inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Envia o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome && formData.telefone && formData.cpf) {
      try {
        const res = await fetch("http://localhost:3000/clientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setFormData({ nome: "", telefone: "", cpf: "" });
          setMostrarModal(false);
          fetchClientes(); // Atualiza a lista de clientes
        } else {
          alert("Erro ao cadastrar o cliente!");
        }
      } catch (error) {
        console.error("Erro ao enviar os dados:", error);
      }
    } else {
      alert("Preencha todos os campos!");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#fffaf7] text-[#5C4033] relative">
      <h2 className="text-2xl font-bold text-center mb-6">CLIENTES CADASTRADOS</h2>

      <div className="space-y-4 max-w-md mx-auto">
        {clientes.map((cliente, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{cliente.nome}</p>
            <p className="text-sm text-gray-700">{cliente.telefone}</p>
            <p className="text-sm text-gray-500 italic">CPF: {cliente.cpf}</p>
          </div>
        ))}
      </div>

      {/* Botão flutuante */}
      <button
        title="Novo cliente agendado"
        className="absolute bottom-6 right-6 bg-[#A06D52] hover:bg-[#8e5e41] text-white p-4 rounded-full shadow-lg"
        onClick={() => setMostrarModal(true)}
      >
        <FaPlus size={16} />
      </button>

      {/* Modal */}
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
