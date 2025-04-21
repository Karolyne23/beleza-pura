import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface Cliente {
  id_cliente?: string;
  nome: string;
  telefone: string;
  cpf: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Cliente>({ nome: "", telefone: "", cpf: "" });
  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const itensPorPagina = 5;

  const fetchClientes = async () => {
    const res = await fetch("http://localhost:3000/clientes");
    const data = await res.json();
    
    setClientes(data);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editandoId
      ? `http://localhost:3000/clientes/${editandoId}`
      : "http://localhost:3000/clientes";
    const method = editandoId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ nome: "", telefone: "", cpf: "" });
      setEditandoId(null);
      setModalAberto(false);
      fetchClientes();
    }
  };

  const confirmarExclusao = async () => {
    alert(clienteParaExcluir?.id_cliente);  
    if (clienteParaExcluir?.id_cliente) {
      await fetch(`http://localhost:3000/clientes/${clienteParaExcluir.id_cliente}`, { method: "DELETE" });
      setClienteParaExcluir(null);
      setModalConfirmacao(false);
      fetchClientes();
    }
  };

  const abrirEdicao = (cliente: Cliente) => {
    setForm({ nome: cliente.nome, telefone: cliente.telefone, cpf: cliente.cpf });
    setEditandoId(cliente?.id_cliente || null);
    setModalAberto(true);
  };

  const clientesPaginados = clientes.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );
  const totalPaginas = Math.ceil(clientes.length / itensPorPagina);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#A06D52] uppercase">Clientes</h2>
        <button
          onClick={() => {
            setForm({ nome: "", telefone: "", cpf: "" });
            setEditandoId(null);
            setModalAberto(true);
          }}
          className="bg-[#A06D52] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#8a5842]"
        >
          Novo Cliente
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded-md">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-[#f6e8df] text-[#A06D52]">
            <tr>
              <th className="py-3 px-4 text-left">Nome</th>
              <th className="py-3 px-4 text-left">Telefone</th>
              <th className="py-3 px-4 text-left">CPF</th>
              <th className="py-3 px-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesPaginados.map((cliente, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{cliente.nome}</td>
                <td className="py-2 px-4">{cliente.telefone}</td>
                <td className="py-2 px-4">{cliente.cpf}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    onClick={() => abrirEdicao(cliente)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setClienteParaExcluir(cliente);
                      setModalConfirmacao(true);
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded ${paginaAtual === i + 1 ? "bg-[#A06D52] text-white" : "bg-white border"}`}
            onClick={() => setPaginaAtual(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl"
              onClick={() => setModalAberto(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-[#A06D52] mb-4 text-center">
              {editandoId ? "Editar Cliente" : "Cadastrar Cliente"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="p-3 rounded-md border"
                required
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="p-3 rounded-md border"
                required
              />
              <input
                type="text"
                placeholder="Cpf"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                className="p-3 rounded-md border"
                required
              />
              <button
                type="submit"
                className="bg-[#A06D52] text-white font-semibold p-3 rounded-md hover:bg-[#8a5842]"
              >
                {editandoId ? "Salvar Alterações" : "Cadastrar Cliente"}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalConfirmacao && clienteParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <h3 className="text-lg font-bold text-[#A06D52] mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">Deseja realmente excluir o cliente <strong>{clienteParaExcluir.nome}</strong>?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModalConfirmacao(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
