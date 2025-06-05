import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaUser, FaUserMd, FaDollarSign } from 'react-icons/fa';
import { agendamentoService, clienteService, profissionalService, Agendamento, Cliente, Profissional, StatusAgendamento } from '../services/api';

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);
  const [tipoPagamento, setTipoPagamento] = useState('');
  const [valorPagoInput, setValorPagoInput] = useState<number>(0);
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_profissional: '',
    servico: '',
    data_hora: '',
    status: StatusAgendamento.PENDENTE,
    valor_servico: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [agendamentosData, clientesData, profissionaisData] = await Promise.all([
        agendamentoService.list(),
        clienteService.list(),
        profissionalService.list()
      ]);
      console.log('Profissionais carregados:', profissionaisData);
      setAgendamentos(agendamentosData);
      setClientes(clientesData);
      setProfissionais(profissionaisData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalPagamento = (agendamento: Agendamento) => {
  setAgendamentoSelecionado(agendamento);
  setModalAberto(true);
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        data_hora: new Date(formData.data_hora).toISOString(),
        id_cliente: formData.id_cliente,
        id_profissional: formData.id_profissional
      };
      
      if (editingId) {
        await agendamentoService.update(editingId, dataToSend);
      } else {
        await agendamentoService.create(dataToSend);
      }
      setShowModal(false);
      setEditingId(null);
      setError(null);
      carregarDados();
    } catch (err: any) {
      const backendMessage = err.response?.data?.message;
      alert(backendMessage || 'Erro ao salvar agendamento');
      console.error(err);
    }
  };

  const handleEdit = (agendamento: Agendamento) => {
    setFormData({
      id_cliente: agendamento.id_cliente,
      id_profissional: agendamento.id_profissional,
      servico: agendamento.servico,
      data_hora: agendamento.data_hora,
      status: agendamento.status,
      valor_servico: agendamento.valor_servico?.toString() || ''
    });
    setEditingId(agendamento.id_agendamento);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await agendamentoService.delete(id);
        carregarDados();
      } catch (err) {
        setError('Erro ao excluir agendamento');
        console.error(err);
      }
    }
  };

  const handleConfirmarPagamento = async () => {
    if(!agendamentoSelecionado) return;

    const { id_agendamento: id, valor_servico } = agendamentoSelecionado;

    if (!id) {
    alert("Agendamento inválido. ID não encontrado.");
    return;
  }
    if (!tipoPagamento) {
      alert('Selecione um tipo de pagamento');
      return;
    }

  try{
  const pagamentoPayload = {
    valor: valor_servico, 
    valor_pago: valorPagoInput || valor_servico,
    id_agendamento: id,
    tipo_pagamento: tipoPagamento,
    data_pagamento: new Date(), 
  };

  const response = await fetch('http://localhost:3000/pagamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pagamentoPayload),
  });

  if(!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro ao registrar pagamento");
  }

  alert('Pagamento registrado com sucesso');
  setModalAberto(false);
  setTipoPagamento('');
  setValorPagoInput(0);
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    alert(error instanceof Error ? error.message : 'Erro ao registrar pagamento. Tente novamente.');
  }
};

  const getStatusColor = (status: StatusAgendamento) => {
    const colors = {
      [StatusAgendamento.PENDENTE]: 'bg-yellow-100 text-yellow-800',
      [StatusAgendamento.CANCELADO]: 'bg-red-100 text-red-800',
      [StatusAgendamento.CONCLUIDO]: 'bg-blue-100 text-blue-800'
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A06D52]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#fffaf7] text-[#5C4033]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Agendamentos</h2>
          <button
            onClick={() => {
              setFormData({
                id_cliente: '',
                id_profissional: '',
                servico: '',
                data_hora: '',
                status: StatusAgendamento.PENDENTE,
                valor_servico: ''
              });
              setEditingId(null);
              setShowModal(true);
              setError(null);
            }}
            className="px-4 py-2 bg-[#A06D52] text-white rounded hover:bg-[#8e5e41]"
          >
            Novo Agendamento
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agendamentos.map((agendamento) => (
                  <tr key={agendamento.id_agendamento} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(agendamento.data_hora).toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo'})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agendamento.cliente?.nome || 'Cliente não encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agendamento.profissional?.nome || 'Profissional não encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agendamento.servico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {agendamento.status !== StatusAgendamento.CANCELADO && (
                        <button
                          onClick={() => abrirModalPagamento(agendamento)}
                          className="text-green-600 hover:text-green-800 mr-2"
                          title="Registrar Pagamento"
                        >
                          <FaDollarSign />
                        </button>   
                      )}
                      <button
                        onClick={() => handleEdit(agendamento)}
                        className="text-[#A06D52] hover:text-[#8e5e41] mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(agendamento.id_agendamento)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  name="id_cliente"
                  value={formData.id_cliente}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A06D52] focus:border-transparent"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional
                </label>
                <select
                  name="id_profissional"
                  value={formData.id_profissional}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A06D52] focus:border-transparent"
                  required
                >
                  <option value="">Selecione um profissional</option>
                  {profissionais.map(profissional => (
                    <option key={profissional.id_profissional} value={profissional.id_profissional}>
                      {profissional.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviço
                </label>
                <input
                  type="text"
                  name="servico"
                  value={formData.servico}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A06D52] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Serviço
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="valor_servico"
                  value={formData.valor_servico}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A06D52] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  name="data_hora"
                  value={formData.data_hora}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A06D52] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A06D52] focus:border-transparent"
                  required
                >
                  {Object.values(StatusAgendamento).map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A06D52] text-white rounded hover:bg-[#8e5e41]"
                >
                Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalAberto && agendamentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Registrar Pagamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <p className="text-gray-900">{agendamentoSelecionado.cliente?.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional
                </label>
                <p className="text-gray-900">{agendamentoSelecionado.profissional?.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor pago</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#A06D52]"
                  value={valorPagoInput}
                  onChange={(e) => setValorPagoInput(parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pagamento
                </label>
                <select
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A06D52] focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">PIX</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarPagamento}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
