import { useEffect, useState } from 'react';
import { dashboardService, DashboardData, agendamentoService, Agendamento, profissionalService, Profissional } from '../services/api';
import { formatCurrency } from '../utils/format';
import { FaUsers, FaClipboardList, FaUserTie, FaCalendarDay, FaUserFriends, FaCalendarAlt, FaMoneyBillWave, FaChartLine, FaExclamationCircle, FaLightbulb, FaEdit } from 'react-icons/fa';

export function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Agendamento[]>([]);
  const [nextAppointments, setNextAppointments] = useState<Agendamento[]>([]);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, agendamentos] = await Promise.all([
          dashboardService.getDashboardData(),
          agendamentoService.list()
        ]);
        
        const hoje = new Date().toISOString().split('T')[0];
        const todayData = agendamentos.filter(a => 
          new Date(a.data_hora).toISOString().split('T')[0] === hoje
        );
        const nextData = agendamentos
          .filter(a => new Date(a.data_hora) >= new Date())
          .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

        setData(dashboardData);
        setTodayAppointments(todayData);
        setNextAppointments(nextData);
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditProfissional = async (profissional: Profissional) => {
    setEditingProfissional(profissional);
    setShowEditModal(true);
  };

  const handleUpdateProfissional = async (updatedData: Partial<Profissional>) => {
    if (!editingProfissional?.id_profissional) return;

    try {
      await profissionalService.update(editingProfissional.id_profissional, updatedData);
      // Refresh dashboard data
      const newData = await dashboardService.getDashboardData();
      setData(newData);
      setShowEditModal(false);
      setEditingProfissional(null);
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      setError('Erro ao atualizar profissional');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Visão Geral */}
      <section className="mb-8" aria-label="Visão Geral">
        <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Agendamentos Hoje</p>
                  <p className="text-2xl font-bold text-blue-700">{todayAppointments.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaCalendarDay className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total de Clientes</p>
                  <p className="text-2xl font-bold text-green-700">{data?.totalClients || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FaUserFriends className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Próximos Agendamentos</p>
                  <p className="text-2xl font-bold text-purple-700">{nextAppointments.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaCalendarAlt className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Agendamentos */}
      <section className="mb-8" aria-label="Próximos Agendamentos">
        <h2 className="text-2xl font-bold mb-4">Próximos Agendamentos</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nextAppointments.map((appointment) => (
                  <tr key={appointment.id_agendamento} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(appointment.data_hora).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.cliente?.nome || 'Cliente não encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.profissional?.nome || 'Profissional não encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.servico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Agendamentos de Hoje */}
      <section className="mb-8" aria-label="Agendamentos de Hoje">
        <h2 className="text-2xl font-bold mb-4">Agendamentos de Hoje</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map((appointment) => (
                  <tr key={appointment.id_agendamento} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(appointment.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.cliente?.nome || 'Cliente não encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.profissional?.nome || 'Profissional não encontrado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.servico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Equipe Hoje */}
      <section className="mb-8" aria-label="Equipe Hoje">
        <h2 className="text-2xl font-bold mb-4">Equipe Hoje</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Profissionais Cadastrados</p>
                  <p className="text-2xl font-bold text-blue-700">{data?.team.profissionais.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {data?.team.profissionais.map((prof, index) => (
                  <div key={index} className="flex items-center justify-between text-sm text-blue-700 bg-blue-100 rounded px-3 py-1">
                    <span>{prof.nome}</span>
                    <button
                      onClick={() => handleEditProfissional(prof as Profissional)}
                      className="p-1 hover:bg-blue-200 rounded-full transition-colors"
                      title="Editar profissional"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-green-600 font-medium">Serviços Disponíveis</p>
                  <p className="text-2xl font-bold text-green-700">{data?.team.servicosUnicos.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FaClipboardList className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {data?.team.servicosUnicos.map((servico, index) => (
                  <div key={index} className="text-sm text-green-700 bg-green-100 rounded px-3 py-1">
                    {servico}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Cargos</p>
                  <p className="text-2xl font-bold text-purple-700">{data?.team.cargosUnicos.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaUserTie className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {data?.team.cargosUnicos.map((cargo, index) => (
                  <div key={index} className="text-sm text-purple-700 bg-purple-100 rounded px-3 py-1">
                    {cargo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dicas de Gestão */}
      <section className="mb-8" aria-label="Dicas de Gestão">
        <h2 className="text-2xl font-bold mb-4">Dicas de Gestão</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-700">📌 Dicas de Gestão</h2>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaLightbulb className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="mr-2 text-blue-600">•</span>
              <span className="text-blue-700">Ofereça promoções nas quartas-feiras (baixo movimento)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-600">•</span>
              <span className="text-blue-700">Envie lembretes automáticos para os clientes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-600">•</span>
              <span className="text-blue-700">Atualize sempre os dados dos profissionais e serviços</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Modal de Edição */}
      {showEditModal && editingProfissional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Editar Profissional</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateProfissional({
                nome: formData.get('nome') as string,
                cargo: formData.get('cargo') as string,
                servicos: formData.get('servicos')?.toString().split(',') || [],
                horario: formData.get('horario') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    defaultValue={editingProfissional.nome}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cargo</label>
                  <input
                    type="text"
                    name="cargo"
                    defaultValue={editingProfissional.cargo}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serviços (separados por vírgula)</label>
                  <input
                    type="text"
                    name="servicos"
                    defaultValue={editingProfissional.servicos?.join(', ')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horário</label>
                  <input
                    type="time"
                    name="horario"
                    defaultValue={editingProfissional.horario}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProfissional(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
