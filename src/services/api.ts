import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces
export interface DashboardData {
  todayAppointments: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  monthlyClients: number;
  topServices: Array<{
    name: string;
    count: number;
  }>;
  nextAppointments: Array<{
    id: string;
    clienteId: string;
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
    profissionais: Array<{
      nome: string;
      cargo: string;
      servicos: string[];
    }>;
    servicosUnicos: string[];
    cargosUnicos: string[];
  };
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cpf: string;
}

export enum StatusAgendamento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO'
}

export interface Agendamento {
  id: string;
  data_hora: string;
  id_cliente: string;
  id_profissional: string;
  servico: string;
  status: StatusAgendamento;
  valor_servico?: number;
  cliente?: Cliente;
  profissional?: Profissional;
}

export enum Perfil {
  ADMIN = 'admin',
  PROFISSIONAL = 'profissional',
}

export enum StatusProfissional {
  ATIVO = 'ATIVO',
  PAUSA = 'PAUSA',
  AUSENTE = 'AUSENTE'
}

export interface Profissional {
  id_profissional: string;
  nome: string;
  cargo: string;
  email: string;
  servicos: string[];
  perfil: Perfil;
  horario?: string;
}

export interface Pagamento {
  id: string;
  agendamentoId: string;
  valor: number;
  formaPagamento: string;
  status: 'pendente' | 'pago' | 'cancelado';
  dataPagamento: string;
}

export interface MovimentacaoFinanceira {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  data: string;
  categoria: string;
}

export interface Financeiro {
  id: string;
  descricao: string;
  tipo_pagamento: string;
  preco: number;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  categoria: string;
  data_criacao: string;
}

export interface CriarAgendamentoDto {
  id_cliente: number;
  id_profissional: number;
  servico: string;
  data_hora: string;
  status: string;
  observacao?: string;
}

interface ProfissionalFiltrado {
  nome: string;
  cargo: string;
  servicos: string[];
}

// Serviços
export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      // Buscar dados em paralelo
      const [agendamentos, clientes, financeiro, profissionais] = await Promise.all([
        api.get('/agendamento'),
        api.get('/clientes'),
        api.get('/financeiro'),
        api.get('/usuarios')
      ]);

      // Filtrar agendamentos do dia
      const hoje = new Date().toISOString().split('T')[0];
      const agendamentosHoje = agendamentos.data.filter((a: any) => 
        new Date(a.data_hora).toISOString().split('T')[0] === hoje
      );

      // Calcular faturamento do dia
      const faturamentoDia = financeiro.data
        .filter((f: any) => {
          const dataFinanceiro = new Date(f.data_criacao).toISOString().split('T')[0];
          return dataFinanceiro === hoje && f.status === 'PAGO';
        })
        .reduce((acc: number, curr: any) => acc + (curr.preco || 0), 0);

      // Calcular faturamento do mês
      const mesAtual = new Date().getMonth() + 1;
      const faturamentoMes = financeiro.data
        .filter((f: any) => {
          const data = new Date(f.data_criacao);
          return data.getMonth() + 1 === mesAtual && f.status === 'PAGO';
        })
        .reduce((acc: number, curr: any) => acc + (curr.preco || 0), 0);

      // Contar clientes do mês
      const clientesMes = clientes.data.filter((c: any) => {
        const dataCadastro = new Date(c.dataNascimento);
        return dataCadastro.getMonth() + 1 === mesAtual;
      }).length;

      // Contar serviços mais realizados
      const servicos = agendamentos.data.reduce((acc: any, curr: any) => {
        acc[curr.servico] = (acc[curr.servico] || 0) + 1;
        return acc;
      }, {});

      const topServicos = Object.entries(servicos)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Próximos agendamentos
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

      // Contar pendências de pagamento
      const pendenciasPagamento = financeiro.data
        .filter((f: any) => f.status === 'PENDENTE')
        .length;

      // Calcular métricas da equipe
      const profissionaisFiltrados: ProfissionalFiltrado[] = profissionais.data
        .filter((p: any) => p.perfil === Perfil.PROFISSIONAL)
        .map((p: any) => ({
          nome: p.nome,
          cargo: p.cargo,
          servicos: p.servicos || []
        }));

      // Serviços únicos disponíveis (sem duplicidade)
      const servicosUnicos: string[] = Array.from(new Set(
        profissionaisFiltrados.flatMap((p: ProfissionalFiltrado) => p.servicos)
      ));

      // Cargos únicos
      const cargosUnicos: string[] = Array.from(new Set(
        profissionaisFiltrados.map((p: ProfissionalFiltrado) => p.cargo)
      ));

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
          profissionais: profissionaisFiltrados,
          servicosUnicos,
          cargosUnicos
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  },
};

export const userService = {
  login: async (email: string, senha: string) => {
    const response = await api.post('/usuarios/login', { email, senha });
    return response.data;
  },
  create: async (user: Omit<User, 'id'>) => {
    const response = await api.post('/usuarios', user);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },
  update: async (id: string, user: Partial<User>) => {
    const response = await api.patch(`/usuarios/${id}`, user);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/usuarios/${id}`);
  }
};

export const clienteService = {
  create: async (cliente: Omit<Cliente, 'id'>) => {
    const response = await api.post('/clientes', cliente);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
  update: async (id: string, cliente: Partial<Cliente>) => {
    const response = await api.patch(`/clientes/${id}`, cliente);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/clientes/${id}`);
  }
};

export const agendamentoService = {
  create: async (data: CriarAgendamentoDto): Promise<Agendamento> => {
    const response = await api.post('/agendamento', data);
    return response.data;
  },
  list: async (): Promise<Agendamento[]> => {
    const response = await api.get('/agendamento');
    return response.data;
  },
  getById: async (id: string): Promise<Agendamento> => {
    const response = await api.get(`/agendamento/${id}`);
    return response.data;
  },
  update: async (id: string, data: CriarAgendamentoDto): Promise<Agendamento> => {
    const response = await api.put(`/agendamento/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/agendamento/${id}`);
  }
};

export const pagamentoService = {
  create: async (pagamento: Omit<Pagamento, 'id'>) => {
    const response = await api.post('/pagamentos', pagamento);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/pagamentos');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/pagamentos/${id}`);
    return response.data;
  },
  update: async (id: string, pagamento: Partial<Pagamento>) => {
    const response = await api.patch(`/pagamentos/${id}`, pagamento);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/pagamentos/${id}`);
  }
};

export const financeiroService = {
  create: (financeiro: Omit<Financeiro, 'id' | 'data_criacao'>) => 
    api.post('/financeiro', financeiro),
  list: () => 
    api.get('/financeiro'),
  getRelatorio: () => 
    api.get('/financeiro/relatorio'),
  update: (id: string, financeiro: Omit<Financeiro, 'id' | 'data_criacao'>) => 
    api.patch(`/financeiro/${id}`, financeiro),
  delete: (id: string) => 
    api.delete(`/financeiro?${id}`)
};

export const conciliacaoService = {
  conciliar: async () => {
    const response = await api.get('/conciliacao/conciliar');
    return response.data;
  }
};

export const profissionalService = {
  create: async (profissional: Omit<Profissional, 'id_profissional'> & { senha: string }) => {
    console.log('profissionalService.create - Iniciando...');
    console.log('Dados do profissional:', profissional);
    try {
      const { senha, ...profissionalData } = profissional;
      console.log('Dados após remover senha:', profissionalData);
      
      const token = localStorage.getItem('authToken');
      console.log('Token encontrado:', !!token);
      
      if (!token) {
        console.error('Token não encontrado');
        throw new Error('Token não encontrado');
      }
      
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      console.log('Dados do token:', tokenData);
      
      console.log('Enviando requisição para API...');
      const response = await api.post('/usuarios', {
        ...profissionalData,
        senha,
        perfil: Perfil.PROFISSIONAL
      });
      console.log('Resposta da API:', response);
      return response.data;
    } catch (error) {
      console.error('Erro em profissionalService.create:', error);
      throw error;
    }
  },
  list: async () => {
    console.log('profissionalService.list - Iniciando...');
    try {
      const response = await api.get('/usuarios');
      console.log('Resposta bruta da API:', response);
      const filteredData = response.data.filter((user: any) => user.perfil === Perfil.PROFISSIONAL || user.perfil === "profissional");
      console.log('Dados filtrados:', filteredData);
      return filteredData;
    } catch (error) {
      console.error('Erro em profissionalService.list:', error);
      throw error;
    }
  },
  getById: async (id: string) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },
  update: async (id: string, profissional: Partial<Profissional>) => {
    console.log('profissionalService.update - Iniciando...');
    console.log('ID:', id);
    console.log('Dados do profissional:', profissional);
    try {
      const response = await api.patch(`/usuarios/${id}`, {
        ...profissional,
        perfil: Perfil.PROFISSIONAL
      });
      console.log('Resposta da API:', response);
      return response.data;
    } catch (error) {
      console.error('Erro em profissionalService.update:', error);
      throw error;
    }
  },
  delete: async (id: string) => {
    console.log('profissionalService.delete - Iniciando...');
    console.log('ID:', id);
    try {
      await api.delete(`/usuarios/${id}`);
      console.log('Profissional deletado com sucesso');
    } catch (error) {
      console.error('Erro em profissionalService.delete:', error);
      throw error;
    }
  }
};

export default api; 