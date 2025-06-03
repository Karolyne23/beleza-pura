import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaChartLine, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { dashboardService, DashboardData } from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Agendamentos Hoje</p>
              <p className="text-2xl font-bold">{data.todayAppointments}</p>
            </div>
            <FaCalendarAlt className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clientes do Mês</p>
              <p className="text-2xl font-bold">{data.monthlyClients}</p>
            </div>
            <FaUsers className="text-orange-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Próximos Agendamentos */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Próximos Agendamentos</h2>
        </div>
        <div className="p-6">
          {data.nextAppointments.length > 0 ? (
            <div className="space-y-4">
              {data.nextAppointments.map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FaClock className="text-blue-500" />
                    <div>
                      <p className="font-medium">{agendamento.servico}</p>
                      <p className="text-sm text-gray-500">
                        {agendamento.data} às {agendamento.hora}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    agendamento.status === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                    agendamento.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {agendamento.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Nenhum agendamento próximo</p>
          )}
        </div>
      </div>

      {/* Serviços Mais Realizados */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Serviços Mais Realizados</h2>
        </div>
        <div className="p-6">
          {data.topServices.length > 0 ? (
            <div className="space-y-4">
              {data.topServices.map((servico, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{servico.name}</span>
                  <span className="text-gray-500">{servico.count} realizados</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Nenhum serviço registrado</p>
          )}
        </div>
      </div>

      {/* Equipe */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Equipe</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Profissionais Ativos</p>
              <p className="text-2xl font-bold">{data.team.activeProfessionals}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Em Pausa</p>
              <p className="text-2xl font-bold">{data.team.onBreakProfessionals}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Ausentes</p>
              <p className="text-2xl font-bold">{data.team.absentProfessionals}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;