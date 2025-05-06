import api from './api';

export interface DashboardData {
  todayAppointments: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  monthlyClients: number;
  topServices: Array<{ name: string; count: number }>;
  nextAppointments: Array<{
    id: number;
    clienteId: number;
    servico: string;
    data: string;
    hora: string;
    valor: number;
    status: string;
  }>;
  pendingPayments: number;
  totalClients: number;
  financial: {
    dailyRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
  };
  team: {
    activeProfessionals: number;
    onBreakProfessionals: number;
    absentProfessionals: number;
  };
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const [agendamentos, clientes, financeiro, profissionais] = await Promise.all([
        api.get('/agendamentos'),
        api.get('/clientes'),
        api.get('/financeiro'),
        api.get('/usuarios')
      ]);

      const hoje = new Date().toISOString().split('T')[0];
      const agendamentosHoje = agendamentos.data.filter((a: any) => 
        new Date(a.data_hora).toISOString().split('T')[0] === hoje
      );

      const faturamentoDia = financeiro.data
        .filter((f: any) => new Date(f.data_criacao).toISOString().split('T')[0] === hoje && f.status === 'PAGO')
        .reduce((acc: number, curr: any) => acc + curr.preco, 0);

      const mesAtual = new Date().getMonth() + 1;
      const faturamentoMes = financeiro.data
        .filter((f: any) => {
          const data = new Date(f.data_criacao);
          return data.getMonth() + 1 === mesAtual && f.status === 'PAGO';
        })
        .reduce((acc: number, curr: any) => acc + curr.preco, 0);

      const clientesMes = clientes.data.filter((c: any) => {
        const dataCadastro = new Date(c.dataNascimento);
        return dataCadastro.getMonth() + 1 === mesAtual;
      }).length;

      const servicos = agendamentos.data.reduce((acc: any, curr: any) => {
        acc[curr.servico] = (acc[curr.servico] || 0) + 1;
        return acc;
      }, {});

      const topServicos = Object.entries(servicos)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const proximosAgendamentos = agendamentos.data
        .filter((a: any) => new Date(a.data_hora) >= new Date())
        .sort((a: any, b: any) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
        .slice(0, 5)
        .map((a: any) => ({
          id: a.id,
          clienteId: a.id_cliente,
          servico: a.servico,
          data: new Date(a.data_hora).toLocaleDateString('pt-BR'),
          hora: new Date(a.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          valor: 0,
          status: a.status
        }));

      const pendenciasPagamento = financeiro.data
        .filter((f: any) => f.status === 'PENDENTE')
        .length;

      const profissionaisAtivos = profissionais.data.filter((p: any) => p.perfil === 'PROFISSIONAL').length;

      return {
        todayAppointments: agendamentosHoje.length,
        dailyRevenue: faturamentoDia,
        monthlyRevenue: faturamentoMes,
        monthlyClients: clientesMes,
        topServices: topServicos,
        nextAppointments: proximosAgendamentos,
        pendingPayments: pendenciasPagamento,
        totalClients: clientes.data.length,
        financial: {
          dailyRevenue: faturamentoDia,
          monthlyRevenue: faturamentoMes,
          pendingPayments: pendenciasPagamento
        },
        team: {
          activeProfessionals: profissionaisAtivos,
          onBreakProfessionals: 0,
          absentProfessionals: 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  },
}; 