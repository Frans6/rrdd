import React, { useState, useContext, useEffect } from 'react';
import { Card, Typography, List, Button, Badge, Space, Grid, Divider } from 'antd';
import { PlayCircleOutlined, ReloadOutlined, LoginOutlined } from '@ant-design/icons';
import { UserContext } from '../contexts/UserContext';
import { EventContext } from '../contexts/EventContext';
import { useRouter } from 'next/navigation';
import request from "@/app/utils/request";

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const ActiveEventsComponent = () => {
  const { user, setLoading: setGlobalLoading } = useContext(UserContext);
  const { currentEvent, setCurrentEvent } = useContext(EventContext);
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(false);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Definindo os caminhos permitidos com base no papel do usuário
  const adminpaths = ["admin", "sumula", "results"];
  const staffpaths = ["sumula", "results"];
  const playerpaths = ["profile", "results"];

  useEffect(() => {
    if (user.all_events) {
      // Filtrar apenas eventos ativos do usuário
      const active = user.all_events
        .filter(event => event.event && event.event.active === true)
        .map(event => ({
          id: event.event?.id,
          name: event.event?.name,
          status: "Ativo",
          role: event.role === 'player' ? 'Participante' : 
                event.role === 'staff' ? 'Staff' : 
                event.role === 'owner' ? 'Organizador' : 'Desconhecido',
          originalRole: event.role, // Mantém o papel original sem tradução
          originalEvent: event // Mantém a referência ao evento original
        }));
      
      setActiveEvents(active);
    }
  }, [user.all_events]);

  // Nova implementação do manipulador de cliques usando a lógica do JoinBoxComponent
  const handleViewEvent = (eventData: any) => {
    setGlobalLoading(true); // Usa o setLoading do contexto global
    const originalEvent = activeEvents.find(e => e.id === eventData.id)?.originalEvent;
    
    if (originalEvent) {
      // Determinar os caminhos permitidos com base no papel do usuário
      const paths = originalEvent.role === "admin" || originalEvent.role === "manager"
        ? adminpaths
        : originalEvent.role === "staff"
          ? staffpaths
          : playerpaths;

      // Atualizar o contexto do evento com os detalhes e caminhos
      setCurrentEvent({
        role: originalEvent.role,
        event: originalEvent.event,
        paths: paths
      });
      
      setShouldNavigate(true);
    }
    
    setGlobalLoading(false); // Usa o setLoading do contexto global
  };

  // Efeito para navegação após a atualização do contexto
  useEffect(() => {
    if (shouldNavigate && currentEvent && currentEvent.paths && currentEvent.paths.length > 0) {
      // Usar o mesmo padrão de navegação do JoinBoxComponent
      router.push(`/${currentEvent.event?.id}/${currentEvent.paths[0]}`);
      setShouldNavigate(false);
    }
  }, [shouldNavigate, currentEvent, router]);

  // Função de atualização modificada para buscar novamente os eventos do usuário
  const handleRefresh = async () => {
    if (!user?.access) {
      // Exiba um aviso ou retorne cedo
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await request.get("/api/event/", {
        headers: {
          Authorization: `Bearer ${user.access}`
        }
      });
      const events = response.data || [];
      const active = events
        .filter((event: any) => event.event && event.event.active === true)
        .map((event: any) => ({
          id: event.event?.id,
          name: event.event?.name,
          status: "Ativo",
          role: event.role === 'player' ? 'Participante' : 
                event.role === 'staff' ? 'Staff' : 
                event.role === 'owner' || event.role === 'admin' || event.role === 'manager' ? 'Organizador' : 'Desconhecido',
          originalRole: event.role,
          originalEvent: event
        }));
      setActiveEvents(active);
    } catch (err) {
      // Trate o erro conforme necessário
    }
    setLoading(false);
  };

  // Chama handleRefresh ao montar o componente para buscar eventos ativos automaticamente
  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#1890ff', fontSize: 18, fontWeight: 700 }}>Eventos Ativos</Text>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={loading} // Usa o loading local para o botão
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
      {activeEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Paragraph style={{ fontSize: 14, color: '#999' }}>
            Nenhum evento ativo encontrado
          </Paragraph>
        </div>
      ) : (
        <>
          <Paragraph style={{ fontSize: 14, marginBottom: 16 }}>
            Você tem {activeEvents.length} evento{activeEvents.length > 1 ? 's' : ''} ativo{activeEvents.length > 1 ? 's' : ''} no momento.
          </Paragraph>
          
          <List
            dataSource={activeEvents}
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
                      key="enter"
                      type="primary"
                      icon={<LoginOutlined />}
                      onClick={() => handleViewEvent(event)}
                      size="small"
                      style={{ 
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff',
                        borderRadius: '6px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#40a9ff';
                        e.currentTarget.style.borderColor = '#40a9ff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 144, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1890ff';
                        e.currentTarget.style.borderColor = '#1890ff';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {isMobile ? '' : 'Entrar'}
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
                          status="processing" 
                          color={getStatusColor(event.role)}
                        />
                      )
                    }
                    title={
                      isMobile ? (
                        <Text strong style={{ fontSize: 14 }}>
                          {event.name}
                        </Text>
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
                        </div>
                      )
                    }
                    description={null}
                  />
                </List.Item>
                {index < activeEvents.length - 1 && (
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

export default ActiveEventsComponent;