import React, { useState, useContext, useEffect } from 'react';
import { Card, Typography, List, Button, Badge, Space, Grid, Divider } from 'antd';
import { CheckCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { UserContext } from '../contexts/UserContext';
import { EventContext } from '../contexts/EventContext';
import { useRouter } from 'next/navigation';

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const PastEventsComponent = () => {
  const { user, setLoading: setGlobalLoading } = useContext(UserContext);
  const { currentEvent, setCurrentEvent } = useContext(EventContext);
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(false);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Definindo os caminhos permitidos com base no papel do usuário
  const adminpaths = ["admin", "sumula", "results"];
  const staffpaths = ["sumula", "results"];
  const playerpaths = ["profile", "results"];

  useEffect(() => {
    if (user.all_events) {
      // Filtrar apenas eventos finalizados do usuário
      const ended = user.all_events
        .filter(event => event.event && event.event.active === false)
        .map(event => ({
          id: event.event?.id,
          name: event.event?.name,
          status: "Finalizado",
          role: event.role === 'player' ? 'Participante' : 
                event.role === 'staff' ? 'Staff' : 
                event.role === 'owner' ? 'Organizador' : 'Desconhecido',
          originalRole: event.role, // Mantém o papel original sem tradução
          originalEvent: event, // Mantém a referência ao evento original
          // Normalmente esses dados viriam da API, estou definindo alguns valores genéricos para exemplo
          endDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          result: event.role === 'player' ? 
                  ['1º Lugar', '2º Lugar', '3º Lugar', 'Participante'][Math.floor(Math.random() * 4)] : 
                  ''
        }));
      
      setPastEvents(ended);
    }
  }, [user.all_events]);

  // Implementação do manipulador de cliques para ver resultados
  const handleViewEvent = (eventData: any) => {
    setGlobalLoading(true);
    const originalEvent = pastEvents.find(e => e.id === eventData.id)?.originalEvent;
    
    if (originalEvent) {
      // Determinar os caminhos permitidos com base no papel do usuário
      const paths = originalEvent.role === "admin" || originalEvent.role === "manager"
        ? adminpaths
        : originalEvent.role === "staff"
          ? staffpaths
          : playerpaths;

      // Para eventos passados, vamos direcionar o usuário diretamente para a página de resultados
      const targetPath = paths.includes("results") ? "results" : paths[0];

      // Atualizar o contexto do evento com os detalhes e caminhos
      setCurrentEvent({
        role: originalEvent.role,
        event: originalEvent.event,
        paths: paths
      });
      
      setShouldNavigate(true);
      // Navegamos diretamente para os resultados
      router.push(`/${originalEvent.event.id}/${targetPath}`);
    }
    
    setGlobalLoading(false);
  };

  // Função de atualização para recarregar a página
  const handleRefresh = () => {
    setLoading(true);
    // Adicione um pequeno delay antes de recarregar para mostrar o loading
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const getStatusColor = (role: string) => {
    switch(role) {
      case 'Staff':
        return 'blue';
      case 'Organizador':
        return 'purple';
      default:
        return 'green';
    }
  };

  const getResultColor = (result: string) => {
    if (result?.includes('1º')) return '#ffd700';
    if (result?.includes('2º')) return '#c0c0c0';
    if (result?.includes('3º')) return '#cd7f32';
    return '#52c41a';
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#1890ff', fontSize: 18, fontWeight: 700 }}>Eventos Passados</Text>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={handleRefresh}
            style={{ color: '#1890ff' }}
            size="small"
          >
            {!isMobile && 'Atualizar'}
          </Button>
        </div>
      }
      headStyle={{ backgroundColor: "#e6f7ff", minHeight: 40, borderRadius: 0 }}
      bordered={false}
      style={{ 
        width: '100%', 
        maxWidth: 'none', 
        marginBottom: 0,
        borderRadius: 0,
      }}
      bodyStyle={{ padding: isMobile ? 16 : 24 }}
    >
      {pastEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Paragraph style={{ fontSize: 14, color: '#999' }}>
            Nenhum evento passado encontrado
          </Paragraph>
        </div>
      ) : (
        <>
          <Paragraph style={{ fontSize: 14, marginBottom: 16 }}>
            Você participou de {pastEvents.length} evento{pastEvents.length > 1 ? 's' : ''} finalizado{pastEvents.length > 1 ? 's' : ''}.
          </Paragraph>
          
          <List
            dataSource={pastEvents}
            renderItem={(event, index) => (
              <>
                <List.Item
                  style={{
                    padding: isMobile ? '16px 12px' : '20px 16px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#e6f7ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  actions={[
                    <Button
                      key="view"
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewEvent(event)}
                      size="small"
                      style={{ 
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                        borderRadius: '6px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#73d13d';
                        e.currentTarget.style.borderColor = '#73d13d';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(82, 196, 26, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#52c41a';
                        e.currentTarget.style.borderColor = '#52c41a';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {isMobile ? '' : 'Ver Resultado'}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      isMobile ? (
                        <Badge 
                          count={event.role.charAt(0)}
                          style={{ 
                            backgroundColor: getStatusColor(event.role),
                            fontSize: '10px',
                            minWidth: '20px',
                            height: '20px',
                            lineHeight: '18px',
                            borderRadius: '50%'
                          }} 
                        />
                      ) : (
                        <Badge 
                          status="success" 
                          color={getStatusColor(event.role)}
                        />
                      )
                    }
                    title={
                      isMobile ? (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '6px',
                          alignItems: 'center',
                          textAlign: 'center'
                        }}>
                          <Text strong style={{ fontSize: 14 }}>
                            {event.name}
                          </Text>
                          {event.result && (
                            <Badge 
                              count={event.result}
                              style={{ 
                                backgroundColor: getResultColor(event.result),
                                color: '#000',
                                fontSize: '9px',
                                fontWeight: 'bold'
                              }} 
                            />
                          )}
                        </div>
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Text strong style={{ fontSize: 16 }}>
                            {event.name}
                          </Text>
                          <Badge 
                            count={event.role}
                            style={{ 
                              backgroundColor: getStatusColor(event.role),
                              fontSize: '10px'
                            }} 
                          />
                          {event.result && (
                            <Badge 
                              count={event.result}
                              style={{ 
                                backgroundColor: getResultColor(event.result),
                                color: '#000',
                                fontSize: '10px'
                              }} 
                            />
                          )}
                        </div>
                      )
                    }
                    description={
                      <Space size={4}>
                        <CheckCircleOutlined style={{ fontSize: 12, color: '#52c41a' }} />
                        <Text style={{ fontSize: 12, color: '#52c41a' }}>
                          Finalizado em {new Date(event.endDate).toLocaleDateString('pt-BR')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
                {index < pastEvents.length - 1 && (
                  <Divider style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />
                )}
              </>
            )}
          />
        </>
      )}
    </Card>
  );
};

export default PastEventsComponent;