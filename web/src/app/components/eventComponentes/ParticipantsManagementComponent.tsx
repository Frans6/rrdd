import React, { useContext, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { UserContext } from "../../contexts/UserContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import request from "@/app/utils/request";
import { formDataSettings } from "@/app/utils/formDataSettings";
import { isAxiosError } from "axios";
import { 
  Upload, 
  Button, 
  Card, 
  Typography, 
  Tabs, 
  Form, 
  Input, 
  Checkbox, 
  message, 
  Space,
  Grid,
  List,
  Spin,
  Modal,
  Tag,
  Pagination
} from 'antd';
import { 
  UploadOutlined, 
  InboxOutlined, 
  UserAddOutlined, 
  UsergroupAddOutlined,
  FileAddOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ImportOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import addNewPlayers from "@/app/utils/api/addNewPlayers";

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

interface ParticipantsManagementProps {
  isManager: boolean;
  renderImportButton?: (type: 'players' | 'staff') => React.ReactNode;
}

// Interface para o jogador
interface Player {
  id: number;
  full_name: string;
  social_name?: string;
  registration_email: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Interface para Staff
interface Staff {
  id: number;
  full_name: string;
  social_name?: string;
  registration_email: string;
  is_manager: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Definir um tipo para as funções que serão expostas
export interface ParticipantsManagementRefType {
  showPlayerImportModal: () => void;
  showStaffImportModal: () => void;
}

// Use forwardRef para expor métodos para o componente pai
const ParticipantsManagementComponent = forwardRef<ParticipantsManagementRefType, ParticipantsManagementProps>((props, ref) => {
  const { isManager, renderImportButton } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  
  // Estado atual da tab
  const activeTab = searchParams.get('tab') || 'players';
  
  // Estados para arquivos
  const [playerFile, setPlayerFile] = useState<File | null>(null);
  const [staffFile, setStaffFile] = useState<File | null>(null);
  const [playerLoading, setPlayerLoading] = useState<boolean>(false);
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [playerFileList, setPlayerFileList] = useState<UploadFile[]>([]);
  const [staffFileList, setStaffFileList] = useState<UploadFile[]>([]);
  
  // Estados para jogadores
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  
  // Estados para staffs
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loadingStaffs, setLoadingStaffs] = useState<boolean>(false);
  
  // Estados para o formulário de jogador
  const [form] = Form.useForm();
  const [addPlayerLoading, setAddPlayerLoading] = useState<boolean>(false);
  
  // Estados para o modal de importação
  const [importModalVisible, setImportModalVisible] = useState<boolean>(false);
  const [importModalType, setImportModalType] = useState<'player' | 'staff'>('player');
  
  // Estados para o formulário de staff individual
  const [addStaffLoading, setAddStaffLoading] = useState<boolean>(false);
  const [staffForm] = Form.useForm();
  
  const { user } = useContext(UserContext);
  const currentId = usePathname().split("/")[1];

  // Função para buscar jogadores do backend
  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const response = await request.get(`/api/players/?event_id=${currentId}`, formDataSettings(user.access));
      if (response.status === 200 && Array.isArray(response.data)) {
        // Filtra apenas para obter resultados válidos (não strings)
        const validPlayers = response.data.filter(item => typeof item !== 'string' && item.id);
        setPlayers(validPlayers);
        console.log("Jogadores carregados:", validPlayers);
      }
    } catch (error) {
      console.error("Erro ao buscar jogadores:", error);
      message.error("Não foi possível carregar a lista de jogadores.");
    } finally {
      setLoadingPlayers(false);
    }
  };

  // Função para buscar staffs do backend
  const fetchStaffs = async () => {
    setLoadingStaffs(true);
    try {
      // Correção: mudar de "staffs" para "staff" na URL
      const response = await request.get(`/api/staff/?event_id=${currentId}`, formDataSettings(user.access));
      if (response.status === 200 && Array.isArray(response.data)) {
        // Filtra apenas para obter resultados válidos
        const validStaffs = response.data.filter(item => typeof item !== 'string' && item.id);
        setStaffs(validStaffs);
        console.log("Staff carregado:", validStaffs);
      }
    } catch (error) {
      console.error("Erro ao buscar staff:", error);
      message.error("Não foi possível carregar a lista de staff.");
    } finally {
      setLoadingStaffs(false);
    }
  };

  // Carregar jogadores e staffs quando o componente for montado
  useEffect(() => {
    if (activeTab === 'players') {
      fetchPlayers();
    } else if (activeTab === 'staff') {
      fetchStaffs();
    }
  }, [activeTab]);

  // Handler para mudança de tab
  const handleTabChange = (key: string) => {
    // Atualiza a URL com a tab selecionada
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', key);
    router.push(`/${currentId}/admin?${params.toString()}`, { scroll: false });
  };

  // Handlers para arquivos - corrigido para capturar o arquivo corretamente
  const handlePlayerFileChange = (info: any) => {
    console.log("Evento de upload player:", info);
    
    // Atualiza a lista de arquivos
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1); // Mantém apenas o último arquivo
    setPlayerFileList(fileList);
    
    // Correção: use o status do arquivo para determinar quando ele está pronto
    // O info.file.status pode ser 'uploading', 'done', 'error', 'removed'
    if (info.file.status === 'done' || info.file.status === undefined) {
      if (info.file.originFileObj) {
        console.log("Arquivo do jogador selecionado:", info.file.originFileObj.name);
        setPlayerFile(info.file.originFileObj);
      }
    } else if (info.file.status === 'removed') {
      setPlayerFile(null);
    }
    
    // Verifica se há pelo menos um arquivo na lista
    if (fileList.length > 0 && fileList[0].originFileObj) {
      setPlayerFile(fileList[0].originFileObj);
      console.log("Arquivo definido do fileList:", fileList[0].originFileObj.name);
    } else if (fileList.length === 0) {
      setPlayerFile(null);
    }
  };

  const handleStaffFileChange = (info: any) => {
    console.log("Evento de upload staff:", info);
    
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setStaffFileList(fileList);
    
    if (info.file.status === 'done' || info.file.status === undefined) {
      if (info.file.originFileObj) {
        console.log("Arquivo do staff selecionado:", info.file.originFileObj.name);
        setStaffFile(info.file.originFileObj);
      }
    } else if (info.file.status === 'removed') {
      setStaffFile(null);
    }
    
    // Verifica se há pelo menos um arquivo na lista
    if (fileList.length > 0 && fileList[0].originFileObj) {
      setStaffFile(fileList[0].originFileObj);
      console.log("Arquivo staff definido do fileList:", fileList[0].originFileObj.name);
    } else if (fileList.length === 0) {
      setStaffFile(null);
    }
  };

  // Envio de arquivo de jogadores
  const handlePlayerSubmit = async () => {
    console.log("Tentando enviar arquivo de jogador:", playerFile);
    
    if (playerFile) {
      setPlayerLoading(true);
      const formData = new FormData();
      formData.append("file", playerFile);
      try {
        const response = await request.post(`/api/upload-player/?event_id=${currentId}`, formData, formDataSettings(user.access));
        if (response.status === 201) {
          if (typeof response.data === 'object' && response.data !== null && 'message' in response.data && 'errors' in response.data) {
            message.success(response.data.message);
            message.warning(response.data.errors);
          } else {
            message.success(response.data);
          }
          setPlayerFile(null);
          setPlayerFileList([]);
          
          // Atualizar a lista de jogadores após o sucesso
          await fetchPlayers();
        }
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          const { data } = error.response || {};
          const errorMessage = data?.errors || "Erro desconhecido.";
          message.error(errorMessage);
          console.error("Erro detalhado:", error.response);
        } else {
          message.error("Ocorreu um erro ao enviar o arquivo.");
        }
        console.log(error);
      } finally {
        setPlayerLoading(false);
      }
    } else {
      message.error("Selecione um arquivo para enviar!");
    }
  };

  // Envio de arquivo de staff
  const handleStaffSubmit = async () => {
    console.log("Tentando enviar arquivo de staff:", staffFile);
    
    if (staffFile) {
      setStaffLoading(true);
      const formData = new FormData();
      formData.append("file", staffFile);
      try {
        const response = await request.post(`/api/upload-staff/?event_id=${currentId}`, formData, formDataSettings(user.access));
        if (response.status === 201) {
          message.success(response.data);
          setStaffFile(null);
          setStaffFileList([]);
          
          // Atualizar a lista de staffs após o sucesso
          await fetchStaffs();
        }
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          const { data } = error.response || {};
          const errorMessage = data?.errors || "Erro desconhecido.";
          message.error(errorMessage);
          console.error("Erro detalhado:", error.response);
        } else {
          message.error("Ocorreu um erro ao enviar o arquivo.");
        }
        console.log(error);
      } finally {
        setStaffLoading(false);
      }
    } else {
      message.error("Selecione um arquivo para enviar!");
    }
  };

  // Adição de jogador individual
  const handleAddPlayerSubmit = async (values: any) => {
    setAddPlayerLoading(true);
    try {
      await addNewPlayers(
        values.fullName, 
        values.socialName || '', 
        values.email, 
        currentId, 
        values.isImortal || false, 
        user.access
      );
      message.success('Jogador adicionado com sucesso!');
      form.resetFields();
      
      // Atualizar a lista após adicionar um jogador
      await fetchPlayers();
    } catch (error) {
      if (isAxiosError(error)) {
        const { data } = error.response || {};
        const errorMessage = data?.errors || "Erro desconhecido.";
        message.error(errorMessage);
      } else {
        message.error("Erro ao adicionar jogador.");
      }
      console.error('Erro ao adicionar jogador:', error);
    } finally {
      setAddPlayerLoading(false);
    }
  };

  // Adição de staff individual
const handleAddStaffSubmit = async (values: any) => {
  setAddStaffLoading(true);
  try {
    const response = await request.post(
      `/api/staff/add?event_id=${currentId}`,
      {
        full_name: values.staffFullName,
        registration_email: values.staffEmail,
        is_manager: values.isManager || false
      },
      {
        headers: {
          Authorization: `Bearer ${user.access}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.status === 201 || response.status === 200) {
      message.success('Staff adicionado com sucesso!');
      staffForm.resetFields();
      await fetchStaffs();
    } else {
      message.error('Erro ao adicionar staff.');
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const { data } = error.response || {};
      const errorMessage = data?.errors || 'Erro desconhecido.';
      message.error(errorMessage);
    } else {
      message.error('Erro ao adicionar staff.');
    }
    console.error('Erro ao adicionar staff:', error);
  } finally {
    setAddStaffLoading(false);
  }
};

  // Função para excluir jogadores
  const handleDeletePlayer = (playerId: number) => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir este jogador?',
      content: 'Esta ação não pode ser desfeita.',
      okText: 'Sim',
      okType: 'danger',
      cancelText: 'Não',
      onOk: async () => {
        try {
          console.log(`Tentando excluir jogador com ID: ${playerId}, event_id: ${currentId}`);
          
          // Garanta que o ID é um número
          const playerIdNumber = Number(playerId);
          const eventIdNumber = Number(currentId);
          
          if (isNaN(playerIdNumber) || isNaN(eventIdNumber)) {
            throw new Error('IDs inválidos');
          }
          
          // Envie o event_id como parâmetro de consulta e o id do jogador no corpo
          const response = await request.delete(`/api/players/?event_id=${eventIdNumber}`, { 
            data: { 
              id: playerIdNumber
            },
            headers: {
              'Authorization': `Bearer ${user.access}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Resposta da API:', response);

          if (response.status === 200) {
            message.success('Jogador excluído com sucesso!');
            await fetchPlayers();
          }
        } catch (error) {
          console.error('Erro completo:', error);
          
          if (isAxiosError(error)) {
            const { data, status } = error.response || {};
            console.error(`Erro de API (${status}):`, data);
            const errorMessage = typeof data?.errors === 'string' ? data.errors : "Erro desconhecido ao excluir jogador.";
            message.error(errorMessage);
          } else {
            message.error("Erro ao comunicar com o servidor.");
          }
        }
      },
    });
  };

  // Adicione uma função para excluir todos os jogadores
  const handleDeleteAllPlayers = () => {
    if (players.length === 0) {
      message.info("Não há jogadores para excluir.");
      return;
    }
    
    Modal.confirm({
      title: 'Tem certeza que deseja excluir TODOS os jogadores?',
      content: `Esta ação irá remover ${players.length} jogadores e não pode ser desfeita.`,
      okText: 'Sim, excluir todos',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        let successCount = 0;
        let failCount = 0;
        setLoadingPlayers(true);
        
        try {
          // Criando uma cópia da lista para evitar problemas com iteração durante exclusão
          const playersCopy = [...players];
          
          for (const player of playersCopy) {
            try {
              const response = await request.delete(`/api/players/?event_id=${currentId}`, {
                data: { id: player.id },
                headers: {
                  'Authorization': `Bearer ${user.access}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.status === 200) {
                successCount++;
              }
            } catch (error) {
              console.error(`Erro ao excluir jogador ID ${player.id}:`, error);
              failCount++;
            }
          }
          
          // Atualizar a lista após as exclusões
          await fetchPlayers();
          
          if (failCount === 0) {
            message.success(`${successCount} jogadores foram excluídos com sucesso!`);
          } else {
            message.warning(`${successCount} jogadores excluídos, mas ${failCount} não puderam ser excluídos.`);
          }
        } catch (error) {
          console.error('Erro durante a exclusão em massa:', error);
          message.error('Ocorreu um erro durante a exclusão em massa de jogadores.');
        } finally {
          setLoadingPlayers(false);
        }
      },
    });
  };

  // Função para excluir um staff específico
  const handleDeleteStaff = (staffId: number) => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir este membro da staff?',
      content: 'Esta ação não pode ser desfeita.',
      okText: 'Sim',
      okType: 'danger',
      cancelText: 'Não',
      onOk: async () => {
        try {
          console.log(`Tentando excluir staff com ID: ${staffId}, event_id: ${currentId}`);
          
          // Garanta que o ID é um número
          const staffIdNumber = Number(staffId);
          const eventIdNumber = Number(currentId);
          
          if (isNaN(staffIdNumber) || isNaN(eventIdNumber)) {
            throw new Error('IDs inválidos');
          }
          
          // Envie o event_id como parâmetro de consulta e o id do staff no corpo
          const response = await request.delete(`/api/staff/?event_id=${eventIdNumber}`, { 
            data: { 
              id: staffIdNumber
            },
            headers: {
              'Authorization': `Bearer ${user.access}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Resposta da API:', response);

          if (response.status === 200) {
            message.success('Membro da staff excluído com sucesso!');
            await fetchStaffs();
          }
        } catch (error) {
          console.error('Erro completo:', error);
          
          if (isAxiosError(error)) {
            const { data, status } = error.response || {};
            console.error(`Erro de API (${status}):`, data);
            const errorMessage = typeof data?.errors === 'string' ? data.errors : "Erro desconhecido ao excluir membro da staff.";
            message.error(errorMessage);
          } else {
            message.error("Erro ao comunicar com o servidor.");
          }
        }
      },
    });
  };

  // Função para excluir todos os staffs
  const handleDeleteAllStaffs = () => {
    if (staffs.length === 0) {
      message.info("Não há membros da staff para excluir.");
      return;
    }
    
    Modal.confirm({
      title: 'Tem certeza que deseja excluir TODOS os membros da staff?',
      content: `Esta ação irá remover ${staffs.length} membros da staff e não pode ser desfeita.`,
      okText: 'Sim, excluir todos',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        let successCount = 0;
        let failCount = 0;
        setLoadingStaffs(true);
        
        try {
          // Criando uma cópia da lista para evitar problemas com iteração durante exclusão
          const staffsCopy = [...staffs];
          
          for (const staff of staffsCopy) {
            try {
              const response = await request.delete(`/api/staff/?event_id=${currentId}`, {
                data: { id: staff.id },
                headers: {
                  'Authorization': `Bearer ${user.access}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.status === 200) {
                successCount++;
              }
            } catch (error) {
              console.error(`Erro ao excluir staff ID ${staff.id}:`, error);
              failCount++;
            }
          }
          
          // Atualizar a lista após as exclusões
          await fetchStaffs();
          
          if (failCount === 0) {
            message.success(`${successCount} membros da staff foram excluídos com sucesso!`);
          } else {
            message.warning(`${successCount} membros da staff excluídos, mas ${failCount} não puderam ser excluídos.`);
          }
        } catch (error) {
          console.error('Erro durante a exclusão em massa de staff:', error);
          message.error('Ocorreu um erro durante a exclusão em massa de membros da staff.');
        } finally {
          setLoadingStaffs(false);
        }
      },
    });
  };

  // Propriedades customizadas para o componente Upload
  const playerUploadProps: UploadProps = {
    name: 'playerFile',
    multiple: false,
    fileList: playerFileList,
    beforeUpload: (file) => {
      console.log("beforeUpload chamado com arquivo:", file.name);
      return false; // Impede upload automático
    },
    maxCount: 1,
    accept: '.csv, .xlsx, .xls',
    onChange: handlePlayerFileChange,
    onRemove: () => {
      console.log("onRemove chamado");
      setPlayerFile(null);
      setPlayerFileList([]);
      return true;
    },
    // Melhorado customRequest para depuração
    customRequest: ({ file, onSuccess }) => {
      console.log("customRequest chamado com arquivo:", file);
      setTimeout(() => {
        onSuccess?.("ok");
      }, 0);
    }
  };

  const staffUploadProps: UploadProps = {
    name: 'staffFile',
    multiple: false,
    fileList: staffFileList,
    beforeUpload: () => false, // Impede upload automático
    maxCount: 1,
    accept: '.csv, .xlsx, .xls',
    onChange: handleStaffFileChange,
    onRemove: () => {
      setStaffFile(null);
      setStaffFileList([]);
      return true;
    },
    // Adicionado custom request para evitar problemas
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess?.("ok");
      }, 0);
    }
  };

  // Funções para controle do modal de importação
  const showPlayerImportModal = () => {
    setImportModalType('player');
    setImportModalVisible(true);
    setPlayerFile(null);
    setPlayerFileList([]);
  };

  const showStaffImportModal = () => {
    setImportModalType('staff');
    setImportModalVisible(true);
    setStaffFile(null);
    setStaffFileList([]);
  };
  
  const handleImportModalCancel = () => {
    setImportModalVisible(false);
    // Limpar os arquivos quando fechar o modal
    if (importModalType === 'player') {
      setPlayerFile(null);
      setPlayerFileList([]);
    } else {
      setStaffFile(null);
      setStaffFileList([]);
    }
  };

  // Novos estados para paginação e busca
  // Para jogadores
  const [playerSearchText, setPlayerSearchText] = useState<string>('');
  const [playerCurrentPage, setPlayerCurrentPage] = useState<number>(1);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const playerPageSize = 10;
  
  // Para staff
  const [staffSearchText, setStaffSearchText] = useState<string>('');
  const [staffCurrentPage, setStaffCurrentPage] = useState<number>(1);
  const [filteredStaffs, setFilteredStaffs] = useState<Staff[]>([]);
  const staffPageSize = 10;

  // Adicione as funções para filtragem dos jogadores
  useEffect(() => {
    if (!playerSearchText) {
      setFilteredPlayers(players);
    } else {
      const searchTermLower = playerSearchText.toLowerCase();
      
      const filtered = players.filter(player => {
        // Verificar nome completo (garantindo que não é undefined)
        const fullNameMatch = player.full_name ? 
          player.full_name.toLowerCase().includes(searchTermLower) : 
          false;
        
        // Verificar nome social (verificando primeiro se existe)
        const socialNameMatch = player.social_name ? 
          player.social_name.toLowerCase().includes(searchTermLower) : 
          false;
        
        // Verificar email (verificando primeiro se existe)
        const emailMatch = player.registration_email ? 
          player.registration_email.toLowerCase().includes(searchTermLower) : 
          false;
        
        return fullNameMatch || socialNameMatch || emailMatch;
      });
      
      setFilteredPlayers(filtered);
    }
    setPlayerCurrentPage(1); // Volte para a primeira página ao filtrar
  }, [playerSearchText, players]);
  
  // Adicione as funções para filtragem dos staffs
  useEffect(() => {
    if (!staffSearchText) {
      setFilteredStaffs(staffs);
    } else {
      const searchTermLower = staffSearchText.toLowerCase();
      
      const filtered = staffs.filter(staff => {
        // Verificar nome completo (garantindo que não é undefined)
        const fullNameMatch = staff.full_name ? 
          staff.full_name.toLowerCase().includes(searchTermLower) : 
          false;
        
        // Verificar nome social (verificando primeiro se existe)
        const socialNameMatch = staff.social_name ? 
          staff.social_name.toLowerCase().includes(searchTermLower) : 
          false;
        
        // Verificar email (verificando primeiro se existe)
        const emailMatch = staff.registration_email ? 
          staff.registration_email.toLowerCase().includes(searchTermLower) : 
          false;
        
        return fullNameMatch || socialNameMatch || emailMatch;
      });
      
      setFilteredStaffs(filtered);
    }
    setStaffCurrentPage(1); // Volte para a primeira página ao filtrar
  }, [staffSearchText, staffs]);
  
  // Funções para manipular a mudança de página
  const handlePlayerPageChange = (page: number) => {
    setPlayerCurrentPage(page);
  };
  
  const handleStaffPageChange = (page: number) => {
    setStaffCurrentPage(page);
  };
  
  // Funções para controle de busca
  const handlePlayerSearch = (value: string) => {
    setPlayerSearchText(value);
  };
  
  const handleStaffSearch = (value: string) => {
    setStaffSearchText(value);
  };
  
  // Calcular os itens a serem exibidos na página atual
  const getCurrentPagePlayers = () => {
    const startIndex = (playerCurrentPage - 1) * playerPageSize;
    return filteredPlayers.slice(startIndex, startIndex + playerPageSize);
  };
  
  const getCurrentPageStaffs = () => {
    const startIndex = (staffCurrentPage - 1) * staffPageSize;
    return filteredStaffs.slice(startIndex, startIndex + staffPageSize);
  };

  // Exponha as funções para uso externo
  useImperativeHandle(ref, () => ({
    showPlayerImportModal,
    showStaffImportModal
  }));

  return (
    <div style={{ width: '100%' }}>
      {/* Tabs de navegação */}
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        tabPosition={isMobile ? 'top' : 'left'}
        style={{ minHeight: 300 }}
        type="card"
      >
        <TabPane 
          tab={
            <span>
              <UserAddOutlined /> Jogadores
            </span>
          } 
          key="players"
        >
          <div style={{ padding: isMobile ? '8px 0' : '0 16px' }}>
            <Card 
              bordered={false}
              size="small"
              style={{ marginBottom: '20px' }}
            >
              {/* Lista de jogadores importados */}
              {players.length > 0 ? (
                <>
                  <List
                    size="small"
                    header={
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Text strong>
                            Jogadores ({filteredPlayers.length} {filteredPlayers.length !== players.length && `de ${players.length}`})
                          </Text>
                          <Space>
                            <Button 
                              icon={<DeleteOutlined />} 
                              type="text" 
                              danger
                              onClick={handleDeleteAllPlayers}
                              disabled={loadingPlayers || players.length === 0}
                              title="Excluir todos os jogadores"
                            />
                            <Button 
                              icon={<ReloadOutlined />} 
                              type="text" 
                              onClick={fetchPlayers} 
                              loading={loadingPlayers}
                              title="Atualizar lista"
                            />
                          </Space>
                        </div>
                        <Input.Search
                          placeholder="Buscar por nome ou email"
                          allowClear
                          enterButton={<SearchOutlined />}
                          onSearch={handlePlayerSearch}
                          onChange={(e) => setPlayerSearchText(e.target.value)}
                          style={{ width: '100%', marginBottom: 8 }}
                        />
                      </>
                    }
                    loading={loadingPlayers}
                    dataSource={getCurrentPagePlayers()}
                    renderItem={(player) => (
                      <List.Item
                        actions={[
                          <Button 
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            type="text"
                            onClick={() => handleDeletePlayer(player.id)}
                          />
                        ]}
                      >
                        <div style={{ maxWidth: isMobile ? 'calc(100% - 60px)' : '90%' }}>
                          <Text ellipsis={{ tooltip: player.full_name }}>
                            {player.full_name}
                            {player.social_name && 
                              <Text type="secondary" ellipsis={{ tooltip: player.social_name }}>
                                {` (${player.social_name})`}
                              </Text>
                            }
                          </Text>
                          <br />
                          <Text 
                            type="secondary" 
                            ellipsis={{ tooltip: player.registration_email }} 
                            style={{ fontSize: '0.9em' }}
                          >
                            {player.registration_email}
                          </Text>
                        </div>
                      </List.Item>
                    )}
                    footer={
                      filteredPlayers.length > playerPageSize && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                          <Pagination 
                            current={playerCurrentPage}
                            total={filteredPlayers.length}
                            pageSize={playerPageSize}
                            onChange={handlePlayerPageChange}
                            size="small"
                            showSizeChanger={false}
                          />
                        </div>
                      )
                    }
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  {loadingPlayers ? (
                    <Spin size="small" />
                  ) : (
                    <Text type="secondary">Nenhum jogador cadastrado. Clique em "Importar Jogadores" para adicionar ou adicione manualmente.</Text>
                  )}
                </div>
              )}
            </Card>
            
            <Card 
              title="Adicionar Jogador Individual"
              bordered={false}
              size="small"
            >
              <Form 
                form={form} 
                onFinish={handleAddPlayerSubmit} 
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item
                  name="fullName"
                  label="Nome completo"
                  rules={[{ required: true, message: 'Por favor, informe o nome completo!' }]}
                >
                  <Input placeholder="Nome completo" />
                </Form.Item>
                
                <Form.Item
                  name="socialName"
                  label="Nome social"
                >
                  <Input placeholder="Nome social (opcional)" />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="Email de inscrição"
                  rules={[
                    { required: true, message: 'Por favor, informe o email!' },
                    { type: 'email', message: 'Por favor, informe um email válido!' }
                  ]}
                >
                  <Input placeholder="exemplo@email.com" />
                </Form.Item>
                
                <Form.Item
                  name="isImortal"
                  valuePropName="checked"
                >
                  <Checkbox>O novo jogador é imortal?</Checkbox>
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={addPlayerLoading}
                    icon={<UserAddOutlined />}
                    style={{ width: '100%' }}
                  >
                    Adicionar Jogador
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </TabPane>
        
        {!isManager && (
          <TabPane 
            tab={
              <span>
                <UsergroupAddOutlined /> Staff
              </span>
            } 
            key="staff"
          >
            <div style={{ padding: isMobile ? '8px 0' : '0 16px' }}>
              <Card 
                bordered={false}
                size="small"
                style={{ marginBottom: '20px' }}
              >
                {/* Lista de staff importados - similar à lista de jogadores mas não tem título */}
                {staffs.length > 0 ? (
                  <>
                    <List
                      size="small"
                      header={
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text strong>
                              Staff ({filteredStaffs.length} {filteredStaffs.length !== staffs.length && `de ${staffs.length}`})
                            </Text>
                            <Space>
                              <Button 
                                icon={<DeleteOutlined />} 
                                type="text" 
                                danger
                                onClick={handleDeleteAllStaffs}
                                disabled={loadingStaffs || staffs.length === 0}
                                title="Excluir todos os membros da staff"
                              />
                              <Button 
                                icon={<ReloadOutlined />} 
                                type="text" 
                                onClick={fetchStaffs} 
                                loading={loadingStaffs}
                                title="Atualizar lista"
                              />
                            </Space>
                          </div>
                          <Input.Search
                            placeholder="Buscar por nome ou email"
                            allowClear
                            enterButton={<SearchOutlined />}
                            onSearch={handleStaffSearch}
                            onChange={(e) => setStaffSearchText(e.target.value)}
                            style={{ width: '100%', marginBottom: 8 }}
                          />
                        </>
                      }
                      loading={loadingStaffs}
                      dataSource={getCurrentPageStaffs()}
                      renderItem={(staff) => (
                        <List.Item
                          actions={[
                            <Button 
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              type="text"
                              onClick={() => handleDeleteStaff(staff.id)}
                            />
                          ]}
                        >
                          <div style={{ maxWidth: isMobile ? 'calc(100% - 60px)' : '90%' }}>
                            <Text ellipsis={{ tooltip: staff.full_name }}>
                              {staff.full_name}
                              {staff.is_manager && 
                                <Tag color="gold" style={{ 
                                  marginLeft: 8, 
                                  maxWidth: isMobile ? '60px' : 'auto',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  Gerente
                                </Tag>
                              }
                            </Text>
                            <br />
                            <Text 
                              type="secondary" 
                              ellipsis={{ tooltip: staff.registration_email }} 
                              style={{ fontSize: '0.9em' }}
                            >
                              {staff.registration_email}
                            </Text>
                          </div>
                        </List.Item>
                      )}
                      footer={
                        filteredStaffs.length > staffPageSize && (
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                            <Pagination 
                              current={staffCurrentPage}
                              total={filteredStaffs.length}
                              pageSize={staffPageSize}
                              onChange={handleStaffPageChange}
                              size="small"
                              showSizeChanger={false}
                            />
                          </div>
                        )
                      }
                    />
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    {loadingStaffs ? (
                      <Spin size="small" />
                    ) : (
                      <Text type="secondary">Nenhum membro de staff cadastrado. Clique em "Importar Staff" para adicionar.</Text>
                    )}
                  </div>
                )}
              </Card>

              {/* Formulário para adicionar staff individualmente */}
              <Card 
                title="Adicionar Staff Individual"
                bordered={false}
                size="small"
              >
                <Form 
                  form={staffForm} 
                  onFinish={handleAddStaffSubmit} 
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="staffFullName"
                    label="Nome completo"
                    rules={[{ required: true, message: 'Por favor, informe o nome completo!' }]}
                  >
                    <Input placeholder="Nome completo" />
                  </Form.Item>
                  <Form.Item
                    name="staffSocialName"
                    label="Nome social"
                  >
                    <Input placeholder="Nome social (opcional)" />
                  </Form.Item>
                  <Form.Item
                    name="staffEmail"
                    label="Email de inscrição"
                    rules={[
                      { required: true, message: 'Por favor, informe o email!' },
                      { type: 'email', message: 'Por favor, informe um email válido!' }
                    ]}
                  >
                    <Input placeholder="exemplo@email.com" />
                  </Form.Item>
                  <Form.Item
                    name="isManager"
                    valuePropName="checked"
                  >
                    <Checkbox>O novo staff é gerente?</Checkbox>
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={addStaffLoading}
                      icon={<UserAddOutlined />}
                      style={{ width: '100%' }}
                    >
                      Adicionar Staff
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>
          </TabPane>
        )}
      </Tabs>
      
      {/* Modal para importação - mantido como está */}
      <Modal
        title={importModalType === 'player' ? "Importar Jogadores (CSV/Excel)" : "Importar Staff (CSV/Excel)"}
        open={importModalVisible}
        onCancel={handleImportModalCancel}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Dragger 
            {...(importModalType === 'player' ? playerUploadProps : staffUploadProps)}
            style={{ minHeight: '180px' }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: '32px' }} />
            </p>
            <p className="ant-upload-text">
              Clique ou arraste um arquivo para esta área
            </p>
            <p className="ant-upload-hint">
              Suporte para arquivos CSV e Excel
            </p>
          </Dragger>
          
          <Button 
            type="primary"
            icon={<UploadOutlined />}
            loading={importModalType === 'player' ? playerLoading : staffLoading}
            onClick={importModalType === 'player' ? handlePlayerSubmit : handleStaffSubmit}
            style={{ width: '100%', marginTop: 16 }}
          >
            {importModalType === 'player' 
              ? (playerFile ? `Importar ${playerFile.name}` : 'Importar Jogadores') 
              : (staffFile ? `Importar ${staffFile.name}` : 'Importar Staff')
            }
          </Button>
        </Space>
      </Modal>
    </div>
  );
});

// Para nomes de componentes no DevTools
ParticipantsManagementComponent.displayName = 'ParticipantsManagementComponent';

export default ParticipantsManagementComponent;