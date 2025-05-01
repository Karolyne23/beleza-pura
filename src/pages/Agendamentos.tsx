import { useState } from "react";

export default function Agendamentos() {
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3000/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          data,
          hora,
          servicoId,
          usuarioId: "id-do-usuario-aqui", 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao agendar");
      }

      setMensagem("Agendamento realizado com sucesso!");
      setData("");
      setHora("");
      setServicoId("");
    } catch (err: any) {
      setErro(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF5F2]">
      <form onSubmit={handleAgendar} className="bg-white shadow-md p-8 rounded-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#A06D52]">Agendamento</h2>

        {erro && <p className="text-red-500 mb-4 text-sm">{erro}</p>}
        {mensagem && <p className="text-green-600 mb-4 text-sm">{mensagem}</p>}

        <label className="block mb-2 text-sm">Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2 text-sm">Hora</label>
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2 text-sm">ID do Serviço</label>
        <input
          type="text"
          value={servicoId}
          onChange={(e) => setServicoId(e.target.value)}
          required
          className="w-full p-2 mb-6 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-[#A06D52] text-white p-2 rounded hover:bg-[#8a5842] transition"
        >
          Agendar
        </button>
      </form>
    </div>
  );
}
