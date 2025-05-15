import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { financeiroService } from '../services/api';
import type { Financeiro } from '../services/api';

const Financeiro: React.FC = () => {
  const [financeiros, setFinanceiros] = useState<Financeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    descricao: '',
    tipo_pagamento: '',
    preco: '',
    status: 'PENDENTE' as 'PENDENTE' | 'PAGO' | 'CANCELADO',
    categoria: ''
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await financeiroService.list();
      setFinanceiros(response.data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados financeiros');
      setFinanceiros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

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
      if (editingId) {
        await financeiroService.update(editingId, {
          ...formData,
          preco: Number(formData.preco)
        });
      } else {
        await financeiroService.create({
          ...formData,
          preco: Number(formData.preco)
        });
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        descricao: '',
        tipo_pagamento: '',
        preco: '',
        status: 'PENDENTE',
        categoria: ''
      });
      carregarDados();
    } catch (err) {
      setError('Erro ao salvar movimentação');
    }
  };

  const handleEdit = (financeiro: Financeiro) => {
    setFormData({
      descricao: financeiro.descricao,
      tipo_pagamento: financeiro.tipo_pagamento,
      preco: financeiro.preco.toString(),
      status: financeiro.status,
      categoria: financeiro.categoria
    });
    setEditingId(financeiro.id_financeiro);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
      try {
        await financeiroService.delete(id);
        carregarDados();
      } catch (err) {
        setError('Erro ao excluir movimentação');
      }
    }
  };

  const getStatusColor = (status: 'PENDENTE' | 'PAGO' | 'CANCELADO') => {
    const colors = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      PAGO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              descricao: '',
              tipo_pagamento: '',
              preco: '',
              status: 'PENDENTE',
              categoria: ''
            });
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <FaPlus /> Nova Movimentação
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {financeiros.map((financeiro) => (
              <tr key={financeiro.id_financeiro}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(financeiro.data_criacao).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{financeiro.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{financeiro.categoria}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{financeiro.tipo_pagamento}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {Number(financeiro.preco).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(financeiro.status)}`}>
                    {financeiro.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(financeiro)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(financeiro.id_financeiro)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {financeiros.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">Nenhuma movimentação encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? 'Editar Movimentação' : 'Nova Movimentação'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pagamento
                </label>
                <input
                  type="text"
                  name="tipo_pagamento"
                  value={formData.tipo_pagamento}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="CANCELADO">Cancelado</option>
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
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;
