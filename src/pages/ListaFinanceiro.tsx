import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

interface Lancamento {
  id: string;
  descricao: string;
  tipo: string;
  valor: string;
  categoria: string;
  status: "Entrada" | "Saída";
}

export default function ListaFinanceiro() {
  const [lista, setLista] = useState<Lancamento[]>([]);
  const [filtro, setFiltro] = useState<"Entrada" | "Saída" | "todos">("todos");
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken"); 

  
  const fetchLancamentos = async () => {
    try {
      const res = await fetch("http://localhost:3000/financeiro", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setLista(data);
    } catch (error) {
      console.error("Erro ao carregar os lançamentos:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLancamentos();
    }
  }, [token]);

  
  const excluirLancamento = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/financeiro/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const novaLista = lista.filter(item => item.id !== id);
        setLista(novaLista);
      } else {
        alert("Erro ao excluir o lançamento!");
      }
    } catch (error) {
      console.error("Erro ao excluir o lançamento:", error);
    }
  };

  
  const filtrados = lista.filter(item =>
    filtro === "todos" ? true : item.status === filtro
  );

  return (
    <div className="p-6 bg-[#fffaf7] min-h-screen">
      <h2 className="text-2xl font-bold text-[#A06D52] mb-6 uppercase">Financeiro (Entradas e Saídas)</h2>

      {/* Botões de filtro */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFiltro("Entrada")} className={`px-4 py-2 rounded ${filtro === "Entrada" ? "bg-[#A06D52] text-white" : "bg-[#e2c6b7]"}`}>Entradas</button>
        <button onClick={() => setFiltro("Saída")} className={`px-4 py-2 rounded ${filtro === "Saída" ? "bg-[#A06D52] text-white" : "bg-[#e2c6b7]"}`}>Saídas</button>
        <button onClick={() => setFiltro("todos")} className={`px-4 py-2 rounded ${filtro === "todos" ? "bg-[#A06D52] text-white" : "bg-[#e2c6b7]"}`}>Todos</button>
      </div>

      {/* Lista */}
      <div className="grid gap-3">
        {filtrados.map((item) => (
          <div key={item.id} className="bg-white shadow p-4 rounded relative">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold">{item.descricao}</p>
                <span className={`inline-block text-xs mt-1 px-2 py-1 rounded-full text-white ${item.status === "Entrada" ? "bg-pink-400" : "bg-red-400"}`}>
                  {item.status}
                </span>
                <p className="text-sm text-gray-600 italic">{item.tipo}</p>
              </div>

              <div className="text-right">
                <button
                  title="Excluir"
                  onClick={() => excluirLancamento(item.id)}
                  className="text-red-600 hover:text-red-800 mb-1"
                >
                  <FaTrash />
                </button>
                <div className="text-green-600 font-bold">R$ {item.valor},00</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão voltar */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/financeiro")}
          className="bg-[#A06D52] hover:bg-[#8e5e41] text-white px-6 py-2 rounded"
        >
          Novo Lançamento
        </button>
      </div>
    </div>
  );
}
