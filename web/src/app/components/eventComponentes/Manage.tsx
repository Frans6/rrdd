import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "@/app/contexts/UserContext";
import request from "@/app/utils/request";
import { settingsWithAuth } from "@/app/utils/settingsWithAuth";
import { usePathname } from "next/navigation";
import { 
  Card, 
  Button, 
  Modal, 
  Checkbox, 
  message, 
  Typography, 
  Space, 
  Row, 
  Col, 
  List,
  Input,
  Pagination,
  Spin,
  Tag,
  Flex,
  Divider,
  Empty
} from 'antd';
import {
  DownloadOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { isAxiosError } from "axios";
import LoadingComponent from "@/app/components/LoadingComponent";

const { Title, Paragraph, Text } = Typography;

interface ManageProps {
  isAdmin: boolean;
}

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

export default function Manage(props: ManageProps) {
  const { user } = useContext(UserContext);
  const [confirmStart, setConfirmStart] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const eventId = usePathname().split("/")[1];
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Estados para exibir jogadores classificados
  const [classifiedPlayers, setClassifiedPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  const [playerSearchText, setPlayerSearchText] = useState<string>('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [playerCurrentPage, setPlayerCurrentPage] = useState<number>(1);
  const playerPageSize = 10;
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Modais
  const [isStartModalOpen, setIsStartModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Adicionar uma variável de estado para controlar requisições em andamento
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  
  // Detectar tamanho da tela para responsividade - mesmo padrão do page.tsx
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Verificar inicialmente
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Busca jogadores classificados ao montar o componente
  useEffect(() => {
    if (!isRequestInProgress) {
      fetchClassifiedPlayers();
    }
    
    // Definir initialLoading como false após um pequeno delay para garantir que tudo esteja carregado
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Filtragem de jogadores baseada no texto de busca
  useEffect(() => {
    if (!playerSearchText) {
      setFilteredPlayers(classifiedPlayers);
    } else {
      const searchTermLower = playerSearchText.toLowerCase();
      
      const filtered = classifiedPlayers.filter(player => {
        const fullNameMatch = player.full_name ? 
          player.full_name.toLowerCase().includes(searchTermLower) : 
          false;
        
        const socialNameMatch = player.social_name ? 
          player.social_name.toLowerCase().includes(searchTermLower) : 
          false;
        
        const emailMatch = player.registration_email ? 
          player.registration_email.toLowerCase().includes(searchTermLower) : 
          false;
        
        return fullNameMatch || socialNameMatch || emailMatch;
      });
      
      setFilteredPlayers(filtered);
    }
    setPlayerCurrentPage(1);
  }, [playerSearchText, classifiedPlayers]);

  // Função para buscar jogadores classificados
  const fetchClassifiedPlayers = async () => {
    if (isRequestInProgress) return;
    
    setIsRequestInProgress(true);
    setLoadingPlayers(true);
    try {
      const response = await request.get(`/api/players/classified/?event_id=${eventId}`, 
        settingsWithAuth(user.access)
      );
      
      if (response.status === 200) {
        // Verificar se a resposta é um array ou inicializar com array vazio
        const players = Array.isArray(response.data) ? response.data : [];
        setClassifiedPlayers(players);
        setFilteredPlayers(players);
      }
    } catch (error) {
      console.error("Erro ao buscar jogadores classificados:", error);
      // Evitar mensagens de erro repetidas - exibir apenas uma vez
      if (!loadingPlayers) {
        message.error({
          content: "Não foi possível carregar a lista de jogadores classificados.", 
          key: "fetchClassifiedError"
        });
      }
    } finally {
      setLoadingPlayers(false);
      setIsRequestInProgress(false);
    }
  };

  // Cálculo para paginação
  const getCurrentPagePlayers = () => {
    const startIndex = (playerCurrentPage - 1) * playerPageSize;
    return filteredPlayers.slice(startIndex, startIndex + playerPageSize);
  };

  // Função para iniciar o evento
  const handleStartEvent = async () => {
    try {
      await message.loading({ content: "Criando súmulas...", key: "startEvent" });
      
      const response = await request.post(
        `/api/sumula/generate/?event_id=${eventId}`, 
        {},
        settingsWithAuth(user.access)
      );
      
      if (response.status === 200 || response.status === 201) {
        message.success({ content: "Súmulas criadas com sucesso.", key: "startEvent" });
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.errors || "Erro ao criar súmulas.";
        message.error({ content: errorMessage, key: "startEvent" });
      } else {
        message.error({ content: "Erro ao criar súmulas.", key: "startEvent" });
      }
      console.error("Erro ao fazer a requisição:", error);
    } finally {
      setIsStartModalOpen(false);
      setConfirmStart(false);
    }
  };

  // Função para baixar jogadores classificados
  const handleDownload = async () => {
    try {
      message.loading({ content: "Gerando arquivo...", key: "download" });
      
      const response = await request.get(`/api/players/export/?event_id=${eventId}`, {
        ...settingsWithAuth(user.access),
        responseType: "blob"
      });
      
      const blob = new Blob([response.data], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "jogadores_classificados.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      message.success({ content: "Arquivo baixado com sucesso!", key: "download" });
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.errors || "Erro ao baixar o arquivo.";
        message.error({ content: errorMessage, key: "download" });
      } else {
        message.error({ content: "Erro ao baixar o arquivo.", key: "download" });
      }
      console.error("Erro ao fazer a requisição:", error);
    }
  };

  // Função para deletar resultados
  const handleDeleteResult = async () => {
    try {
      message.loading({ content: "Deletando resultados...", key: "deleteResults" });
      
      const response = await request.delete(
        `/api/results/?event_id=${eventId}`, 
        settingsWithAuth(user.access)
      );
      
      if (response.status === 200) {
        message.success({ content: "Resultados deletados com sucesso.", key: "deleteResults" });
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.errors || "Erro ao deletar resultados.";
        message.error({ content: errorMessage, key: "deleteResults" });
      } else {
        message.error({ content: "Erro ao deletar resultados.", key: "deleteResults" });
      }
      console.error("Erro ao fazer a requisição:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setConfirmDelete(false);
    }
  };

  // Manipuladores para paginação e busca
  const handlePlayerPageChange = (page: number) => {
    setPlayerCurrentPage(page);
  };
  
  const handlePlayerSearch = (value: string) => {
    setPlayerSearchText(value);
  };

  // Mostrar o componente de carregamento enquanto carrrega as informações iniciais
  if (initialLoading) {
    return <LoadingComponent fullScreen={false} />;
  }

  return (
    <>
      {/* Cards de ações */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ height: '100%' }}
            cover={
              <div style={{
                background: "#1677ff", 
                height: "60px",
                padding: isMobile ? "10px" : "16px"
              }}>
                <Flex align="center" justify="start" style={{ width: '100%' }}>
                  <UserOutlined style={{ fontSize: isMobile ? '1.5rem' : '2rem', color: 'white', marginRight: isMobile ? '8px' : '10px' }} />
                  <Text style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '14px' : '16px', 
                    fontWeight: 'bold',
                    flex: 1,
                    textAlign: isMobile ? 'left' : 'center'
                  }}>
                    Jogadores classificados
                  </Text>
                </Flex>
              </div>
            }
            actions={[
              <Button 
                key="download" 
                type="primary"
                icon={<DownloadOutlined />} 
                onClick={handleDownload}
                size={isMobile ? "middle" : "middle"}
                style={{ width: isMobile ? '30%' : 'auto' }}
              >
                {isMobile ? "Baixar" : "Baixar Excel"}
              </Button>
            ]}
          >
            <Card.Meta 
              description="Baixe a lista de jogadores classificados em Excel" 
              style={{ fontSize: isMobile ? '12px' : '14px' }}
            />
          </Card>
        </Col>

        {props.isAdmin && (
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{
                  background: "#1677ff", 
                  height: "60px",
                  padding: isMobile ? "10px" : "16px"
                }}>
                  <Flex align="center" justify="start" style={{ width: '100%' }}>
                    <PlayCircleOutlined style={{ fontSize: isMobile ? '1.5rem' : '2rem', color: 'white', marginRight: isMobile ? '8px' : '10px' }} />
                    <Text style={{ 
                      color: 'white', 
                      fontSize: isMobile ? '14px' : '16px', 
                      fontWeight: 'bold',
                      flex: 1,
                      textAlign: isMobile ? 'left' : 'center'
                    }}>
                      Começar evento
                    </Text>
                  </Flex>
                </div>
              }
              actions={[
                <Button 
                  key="start" 
                  type="primary"
                  icon={<PlayCircleOutlined />} 
                  onClick={() => setIsStartModalOpen(true)}
                  size={isMobile ? "middle" : "middle"}
                  style={{ width: isMobile ? '30%' : 'auto' }}
                >
                  {isMobile ? "Iniciar" : "Iniciar Evento"}
                </Button>
              ]}
            >
              <Card.Meta 
                description="Gera as súmulas iniciais para o evento"
                style={{ fontSize: isMobile ? '12px' : '14px' }} 
              />
            </Card>
          </Col>
        )}

        {props.isAdmin && (
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{
                  background: "#ff4d4f", 
                  height: "60px",
                  padding: isMobile ? "10px" : "16px"
                }}>
                  <Flex align="center" justify="start" style={{ width: '100%' }}>
                    <DeleteOutlined style={{ fontSize: isMobile ? '1.5rem' : '2rem', color: 'white', marginRight: isMobile ? '8px' : '10px' }} />
                    <Text style={{ 
                      color: 'white', 
                      fontSize: isMobile ? '14px' : '16px', 
                      fontWeight: 'bold',
                      flex: 1,
                      textAlign: isMobile ? 'left' : 'center'
                    }}>
                      Revogar resultados
                    </Text>
                  </Flex>
                </div>
              }
              actions={[
                <Button 
                  key="delete" 
                  type="primary" 
                  danger
                  icon={<DeleteOutlined />} 
                  onClick={() => setIsDeleteModalOpen(true)}
                  size={isMobile ? "middle" : "middle"}
                  style={{ width: isMobile ? '30%' : 'auto' }}
                >
                  {isMobile ? "Revogar" : "Revogar Resultados"}
                </Button>
              ]}
            >
              <Card.Meta 
                description="Exclui os resultados publicados de Paladino, Top4 e Embaixador"
                style={{ fontSize: isMobile ? '12px' : '14px' }} 
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* Lista de jogadores classificados */}
      <Card 
        title={
          <Flex align="center" justify="space-between" style={{ width: '100%' }}>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>Jogadores Classificados</Title>
            {isMobile && (
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchClassifiedPlayers}
                loading={loadingPlayers}
                size="small"
              />
            )}
          </Flex>
        }
        style={{ marginTop: isMobile ? 16 : 24 }}
        extra={
          !isMobile && (
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchClassifiedPlayers}
              loading={loadingPlayers}
            >
              Atualizar
            </Button>
          )
        }
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        {classifiedPlayers.length > 0 ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <Input.Search
                placeholder="Buscar por nome ou email"
                allowClear
                enterButton={isMobile ? <SearchOutlined /> : "Buscar"}
                onSearch={handlePlayerSearch}
                onChange={(e) => setPlayerSearchText(e.target.value)}
                style={{ width: isMobile ? '100%' : '80%' }}
                size={isMobile ? "middle" : "middle"}
              />
            </div>

            <List
              size={isMobile ? "small" : "default"}
              loading={loadingPlayers}
              dataSource={getCurrentPagePlayers()}
              renderItem={(player) => (
                <List.Item style={{ padding: isMobile ? '8px 0' : '12px 0' }}>
                  <div style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: isMobile ? '14px' : '16px' }}>
                      {player.full_name}
                    </Text>
                    {player.social_name && (
                      <Text type="secondary" style={{ fontSize: isMobile ? '13px' : '14px' }}> ({player.social_name})</Text>
                    )}
                    <br />
                    <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
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
                      size={isMobile ? "small" : "default"}
                      showSizeChanger={false}
                    />
                  </div>
                )
              }
            />
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '10px 0' : '20px 0',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {loadingPlayers ? (
              <Spin size="large" />
            ) : (
              <Empty 
                description={<Text type="secondary">Nenhum jogador classificado encontrado.</Text>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}
      </Card>

      {/* Modal de iniciar evento */}
      <Modal
        title="Gerar Súmulas Iniciais"
        open={isStartModalOpen}
        onCancel={() => {
          setIsStartModalOpen(false);
          setConfirmStart(false);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsStartModalOpen(false);
            setConfirmStart(false);
          }}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!confirmStart}
            onClick={handleStartEvent}
          >
            Criar Súmulas
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Essa funcionalidade cria todas as súmulas iniciais para o evento. 
            Utilize-a apenas para iniciar o evento.
          </Text>
          
          <Checkbox 
            checked={confirmStart} 
            onChange={(e) => setConfirmStart(e.target.checked)}
            style={{ marginTop: 16 }}
          >
            Tenho certeza que desejo gerar as súmulas iniciais.
          </Checkbox>
        </Space>
      </Modal>

      {/* Modal de deletar resultados */}
      <Modal
        title="Deletar Resultados"
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setConfirmDelete(false);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsDeleteModalOpen(false);
            setConfirmDelete(false);
          }}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            danger
            type="primary"
            disabled={!confirmDelete}
            onClick={handleDeleteResult}
          >
            Deletar Resultados
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Esta ação irá deletar os resultados de Paladino, Top4 e Embaixador.
            Note que esta ação também revoga a publicação dos resultados.
          </Text>
          
          <Checkbox 
            checked={confirmDelete} 
            onChange={(e) => setConfirmDelete(e.target.checked)}
            style={{ marginTop: 16 }}
          >
            Tenho certeza que desejo deletar os resultados.
          </Checkbox>
        </Space>
      </Modal>
    </>
  );
}
