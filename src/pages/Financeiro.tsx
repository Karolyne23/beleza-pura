import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Financeiro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    descricao: "",
    tipo: "",
    valor: "",
    categoria: "",
    status: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dados = JSON.parse(localStorage.getItem("financeiro") || "[]");
    const novo = { ...form, id: Date.now().toString() };
    localStorage.setItem("financeiro", JSON.stringify([...dados, novo]));

    navigate("/financeiro/lista");
  };

  return (
    <div className="p-6 bg-[#fffaf7] min-h-screen">
      <h2 className="text-2xl font-bold text-[#A06D52] mb-6 uppercase">Financeiro</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} className="w-full border rounded p-2" required />

        <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full border rounded p-2" required>
          <option value="">Tipo Pagamento</option>
          <option value="PIX">PIX</option>
          <option value="Cartão de Crédito">Cartão de Crédito</option>
        </select>

        <select name="valor" value={form.valor} onChange={handleChange} className="w-full border rounded p-2" required>
          <option value="">Valor</option>
          <option value="50">R$ 50,00</option>
          <option value="70">R$ 70,00</option>
          <option value="100">R$ 100,00</option>
          <option value="150">R$ 150,00</option>
        </select>

        <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full border rounded p-2" required>
          <option value="">Categoria</option>
          <option value="Corte">Corte</option>
          <option value="Tintura">Tintura</option>
          <option value="Compra">Compra</option>
          <option value="Tratamento">Tratamento</option>
        </select>

        <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded p-2" required>
          <option value="">Status</option>
          <option value="Entrada">Pago</option>
          <option value="Saída">Não Pago</option>
        </select>

        <button type="submit" className="w-full bg-[#A06D52] text-white py-2 rounded">Salvar</button>
      </form>
    </div>
  );
}
