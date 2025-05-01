import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

interface Profissional {
  nome: string;
  email: string;
  senha: string;
  cargo: string;
  horario: string;
  servicos: string;
  perfil: string;
  telefone: string;
}

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formData, setFormData] = useState<Profissional>({
    nome: "",
    email: "",
    senha: "",
    cargo: "",
    horario: "",
    servicos: "",
    perfil: "",
    telefone: "",
  });

  const token = localStorage.getItem("authToken"); 

  
  const fetchProfissionais = async () => {
    try {
      const res = await fetch("http://localhost:3000/profissionais", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProfissionais(data);
    } catch (error) {
      console.error("Erro ao carregar os profissionais:", error);
    }
  };

  
  useEffect(() => {
    if (token) {
      fetchProfissionais();
    }
  }, [token]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const camposObrigatorios = ["nome", "email", "senha", "cargo"];
    const algumVazio = camposObrigatorios.some(campo => !(formData as any)[campo]);

    if (algumVazio) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const method = formData.email ? "PATCH" : "POST"; 
      const url = formData.email ? `http://localhost:3000/profissionais/${formData.email}` : "http://localhost:3000/profissionais";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          nome: "",
          email: "",
          senha: "",
          cargo: "",
          horario: "",
          servicos: "",
          perfil: "",
          telefone: "",
        });
        setMostrarFormulario(false);
        fetchProfissionais();
      } else {
        alert("Erro ao salvar os dados!");
      }
    } catch (error) {
      console.error("Erro ao enviar os dados:", error);
    }
  };

  
  const handleDelete = async (email: string) => {
    try {
      const res = await fetch(`http://localhost:3000/profissionais/${email}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchProfissionais();
      } else {
        alert("Erro ao excluir profissional!");
      }
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
    }
  };

  return (
    <div className="p-6 text-[#5C4033] bg-[#fffaf7] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">PROFISSIONAIS</h2>
        <button
          onClick={() => setMostrarFormulario(prev => !prev)}
          className="bg-[#A06D52] text-white px-4 py-2 rounded hover:bg-[#8e5e41] transition"
        >
          {mostrarFormulario ? "Cancelar" : "Novo Profissional"}
        </button>
      </div>

      {/* Formulário */}
      {mostrarFormulario && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#fff7f4] p-4 rounded shadow mb-6 max-w-md"
        >
          <h3 className="text-lg font-semibold mb-4">Cadastrar Profissional</h3>

          {[
            { name: "nome", label: "Nome Completo" },
            { name: "email", label: "Email" },
            { name: "senha", label: "Senha" },
            { name: "cargo", label: "Cargo" },
            { name: "horario", label: "Horário" },
            { name: "servicos", label: "Serviços" },
            { name: "perfil", label: "Perfil" },
            { name: "telefone", label: "Telefone" },
          ].map(({ name, label }) => (
            <input
              key={name}
              type="text"
              name={name}
              placeholder={label}
              value={(formData as any)[name]}
              onChange={handleChange}
              className="w-full mb-3 p-2 border border-[#decfc7] rounded"
            />
          ))}

          <button
            type="submit"
            className="w-full bg-[#A06D52] text-white py-2 rounded hover:bg-[#8e5e41]"
          >
            Cadastrar
          </button>
        </form>
      )}

      {/* Lista */}
      {profissionais.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum profissional cadastrado ainda.</p>
      ) : (
        <div className="grid gap-4">
          {profissionais.map((prof, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white shadow p-3 rounded"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#f3e0d9] rounded-full" />
                <div>
                  <p className="font-semibold capitalize">{prof.nome}</p>
                  <p className="text-sm text-[#7b5c4d] lowercase">{prof.cargo}</p>
                  <p className="text-xs text-gray-500">{prof.telefone}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(prof.email)}
                className="text-red-600 hover:text-red-800 transition"
                title="Excluir profissional"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
