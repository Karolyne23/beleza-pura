import { useEffect, useState } from "react";
import { FaTrash, FaTimes, FaClock, FaPlus, FaTimes as FaTimesCircle, FaSearch, FaEdit } from "react-icons/fa";
import { profissionalService, Profissional, Perfil } from "../services/api";

// Lista de cargos do salão
const CARGOS = [
  "Cabeleireiro(a)",
  "Barbeiro(a)",
  "Manicure",
  "Pedicure",
  "Esteticista",
  "Colorista",
  "Maquiador(a)",
  "Recepcionista",
  "Auxiliar de Cabeleireiro(a)",
  "Auxiliar de Barbeiro(a)"
];

// Lista de serviços do salão
const SERVICOS = [
  "Corte Feminino",
  "Corte Masculino",
  "Coloração",
  "Hidratação",
  "Escova",
  "Pintura",
  "Mechas",
  "Botox Capilar",
  "Manicure",
  "Pedicure",
  "Maquiagem",
  "Depilação",
  "Limpeza de Pele",
  "Design de Sobrancelhas",
  "Manutenção de Cílios",
  "Tratamento Capilar",
  "Penteado",
  "Alisamento",
  "Relaxamento",
  "Retoque de Raiz"
];

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
  const [horario, setHorario] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const DIAS_SEMANA = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ];

  const [formData, setFormData] = useState<Omit<Profissional, 'id_profissional'> & { senha: string }>({
    nome: "",
    email: "",
    cargo: "",
    horario: "",
    servicos: [],
    perfil: Perfil.PROFISSIONAL,
    senha: ""
  });

  // Carrega os profissionais
  const fetchProfissionais = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profissionalService.list();
      setProfissionais(data);
    } catch (error) {
      console.error("Erro ao carregar os profissionais:", error);
      setError("Erro ao carregar os profissionais");
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados
  useEffect(() => {
    fetchProfissionais();
  }, []);

  // Atualiza os inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle serviço selecionado
  const toggleServico = (servico: string) => {
    setServicosSelecionados(prev => 
      prev.includes(servico)
        ? prev.filter(s => s !== servico)
        : [...prev, servico]
    );
    setFormData(prev => ({
      ...prev,
      servicos: servicosSelecionados.includes(servico)
        ? servicosSelecionados.filter(s => s !== servico)
        : [...servicosSelecionados, servico]
    }));
  };

  // Remove serviço selecionado
  const removeServico = (servico: string) => {
    setServicosSelecionados(prev => prev.filter(s => s !== servico));
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.filter(s => s !== servico)
    }));
  };

  // Filter services based on search term
  const filteredServices = SERVICOS.filter(servico =>
    servico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Envia o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando operação...');
    console.log('Dados do formulário:', formData);
    
    try {
      setLoading(true);
      console.log('Verificando token...');
      const token = localStorage.getItem('authToken');
      console.log('Token encontrado:', !!token);
      
      if (!token) { 
        console.error('Token não encontrado');
        throw new Error('Token não encontrado');
      }

      console.log('Decodificando token...');
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      console.log('Dados do token:', tokenData);

      if (editingId) {
        // Atualizar profissional existente
        console.log('Atualizando profissional...');
        await profissionalService.update(editingId, {
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo,
          horario: formData.horario,
          servicos: formData.servicos,
          perfil: Perfil.PROFISSIONAL
        });
      } else {
        // Criar novo profissional
        console.log('Enviando requisição para criar profissional...');
        await profissionalService.create({
          ...formData,
          perfil: Perfil.PROFISSIONAL
        });
      }

      setMostrarFormulario(false);
      setFormData({
        nome: "",
        email: "",
        cargo: "",
        horario: "",
        servicos: [],
        perfil: Perfil.PROFISSIONAL,
        senha: ""
      });
      setServicosSelecionados([]);
      setHorario("");
      setEditingId(null);
      fetchProfissionais();
      console.log('Operação concluída com sucesso!');
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar profissional');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (profissional: Profissional) => {
    setFormData({
      nome: profissional.nome,
      email: profissional.email,
      cargo: profissional.cargo,
      horario: profissional.horario || "",
      servicos: profissional.servicos || [],
      perfil: profissional.perfil,
      senha: "" // Não preenchemos a senha ao editar
    });
    setServicosSelecionados(profissional.servicos || []);
    setHorario(profissional.horario || "");
    setEditingId(profissional.id_profissional);
    setMostrarFormulario(true);
  };

  // Excluir profissional
  const handleDelete = async (id: string) => {
    if (!id || id === 'undefined') {
      console.error('ID não definido para exclusão');
      setError('ID do profissional não encontrado');
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir este profissional?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Excluindo profissional com ID:', id);
      await profissionalService.delete(id);
      console.log('Profissional excluído com sucesso');
      fetchProfissionais();
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
      setError("Erro ao excluir profissional");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-[#5C4033] bg-[#fffaf7] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">PROFISSIONAIS</h2>
        <button
          onClick={() => {
            setFormData({
              nome: "",
              email: "",
              cargo: "",
              horario: "",
              servicos: [],
              perfil: Perfil.PROFISSIONAL,
              senha: ""
            });
            setServicosSelecionados([]);
            setHorario("");
            setEditingId(null);
            setMostrarFormulario(true);
          }}
          className="bg-[#A06D52] text-white px-4 py-2 rounded hover:bg-[#8e5e41] transition"
        >
          Novo Profissional
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Modal */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Editar Profissional' : 'Cadastrar Profissional'}
              </h3>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setEditingId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Coluna da Esquerda */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full p-2 border border-[#decfc7] rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 border border-[#decfc7] rounded"
                      required
                    />
                  </div>

                  {/* Campo de senha só aparece quando estiver criando um novo profissional */}
                  {!editingId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                      <input
                        type="password"
                        name="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        className="w-full p-2 border border-[#decfc7] rounded"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <select
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="w-full p-2 border border-[#decfc7] rounded"
                      required
                    >
                      <option value="">Selecione um cargo</option>
                      {CARGOS.map(cargo => (
                        <option key={cargo} value={cargo}>{cargo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={horario}
                        onChange={(e) => {
                          setHorario(e.target.value);
                          setFormData(prev => ({ ...prev, horario: e.target.value }));
                        }}
                        className="w-full p-2 border border-[#decfc7] rounded"
                        required
                      />
                      <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Coluna da Direita */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serviços</label>
                    <div className="space-y-3">
                      {/* Barra de pesquisa */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Buscar serviços..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-2 pl-8 border border-[#decfc7] rounded"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>

                      {/* Serviços selecionados */}
                      <div className="flex flex-wrap gap-2 p-2 border border-[#decfc7] rounded min-h-[60px]">
                        {servicosSelecionados.map(servico => (
                          <div
                            key={servico}
                            className="flex items-center gap-1 bg-[#f3e0d9] text-[#5C4033] px-2 py-1 rounded-full text-sm"
                          >
                            <span>{servico}</span>
                            <button
                              type="button"
                              onClick={() => removeServico(servico)}
                              className="text-[#5C4033] hover:text-red-600"
                            >
                              <FaTimesCircle size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Lista de serviços */}
                      <div className="border border-[#decfc7] rounded max-h-[200px] overflow-y-auto">
                        {filteredServices.map(servico => (
                          <button
                            key={servico}
                            type="button"
                            onClick={() => toggleServico(servico)}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                              servicosSelecionados.includes(servico)
                                ? 'bg-[#A06D52] text-white hover:bg-[#8e5e41]'
                                : 'text-gray-700'
                            }`}
                          >
                            {servico}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#A06D52] text-white rounded hover:bg-[#8e5e41] disabled:opacity-50"
                >
                  {loading ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : profissionais.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum profissional cadastrado ainda.</p>
      ) : (
        <div className="grid gap-4">
          {profissionais.map((prof) => (
            <div
              key={prof.id_profissional}
              className="flex items-center justify-between bg-white shadow p-3 rounded"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#f3e0d9] rounded-full" />
                <div>
                  <p className="font-semibold capitalize">{prof.nome}</p>
                  <p className="text-sm text-[#7b5c4d] lowercase">{prof.cargo}</p>
                  <p className="text-xs text-gray-500">{prof.email}</p>
                  <p className="text-xs text-gray-500">
                    Serviços: {prof.servicos.join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(prof)}
                  className="text-[#A06D52] hover:text-[#8e5e41] transition"
                  title="Editar profissional"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(prof.id_profissional)}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Excluir profissional"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
