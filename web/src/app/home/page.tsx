'use client'
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/app/contexts/UserContext";
import { EventContext } from "@/app/contexts/EventContext";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderComponent from "@/app/components/HeaderComponent";
import LoadingComponent from "@/app/components/LoadingComponent";
import EventsComponent from "@/app/components/EventsComponent";
import ActiveEventsComponent from "@/app/components/ActiveEventsComponent";
import PastEventsComponent from "@/app/components/PastEventsComponent";
import { Typography, Layout, Grid, Menu } from 'antd';
import { eventConfigurations, viewToConfigMap } from "@/app/utils/eventConfigurations";
import { initialPageMenu } from "@/app/utils/menuItems";
import SideMenu from "@/app/components/SideMenu";

const { Title, Paragraph } = Typography;
const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

export default function JoinEvents() {
  const { user, loading } = useContext(UserContext);
  const { currentEvent, setCurrentEvent } = useContext(EventContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  
  // Obtém a view do parâmetro da URL ou usa 'welcome' como padrão
  const [currentView, setCurrentView] = useState<string>(
    searchParams.get('view') || 'welcome'
  );

  // Atualiza a view quando os parâmetros da URL mudam
  useEffect(() => {
    const view = searchParams.get('view');
    if (view) {
      setCurrentView(view);
    } else {
      setCurrentView('welcome');
    }
  }, [searchParams]);

  useEffect(() => {
    if(!user.access && !loading){
      router.push("/");
    }
  }, [user, loading, router]);

  if(!user.access || loading){
    return <LoadingComponent/>;
  }

  // Renderiza diferentes componentes com base na view atual
  const renderContent = () => {
    // Caso especial para eventos ativos
    if (currentView === 'active-events') {
      return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <ActiveEventsComponent />
        </div>
      );
    }
    
    // Caso especial para eventos passados
    if (currentView === 'past-events') {
      return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <PastEventsComponent />
        </div>
      );
    }
    
    // Mapeia a view atual para a configuração do evento
    const configKey = viewToConfigMap[currentView as keyof typeof viewToConfigMap];
    
    if (configKey && configKey !== 'active-events' && configKey !== 'past-events') {
      const eventConfig = eventConfigurations[configKey as keyof typeof eventConfigurations];
      // Verifica se eventConfig tem a propriedade function
      if ('function' in eventConfig) {
        return (
          <div style={{ width: isMobile ? 'auto' : '100%' }}>
            <EventsComponent {...eventConfig} />
          </div>
        );
      }
    }
    
    // Caso padrão (welcome)
    return (
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>Bem-vindo ao Rei da Derivada!</Title>
        <Paragraph style={{ fontSize: '16px' }}>
          Esta é uma plataforma educacional dedicada ao estudo de cálculo diferencial. 
          Aqui você encontrará diversos exercícios e desafios para aprimorar seus conhecimentos em derivadas.
        </Paragraph>
        <Paragraph style={{ fontSize: '16px' }}>
          Utilize o menu {isMobile ? 'superior' : 'lateral'} para navegar entre as opções disponíveis.
        </Paragraph>
      </div>
    );
  };

  // Menu responsivo horizontal para dispositivos móveis
  const renderHorizontalMenu = () => {
    const createMenuItems = () => {
      return initialPageMenu.map(item => {
        if (item.children) {
          return (
            <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
              {item.children.map(child => (
                <Menu.Item key={child.key} icon={child.icon}>
                  {child.label}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          );
        } else {
          return (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          );
        }
      });
    };

    return (
      <div style={{ 
        width: '100%', 
        overflowX: 'auto', 
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: '-ms-autohiding-scrollbar',
      }}>
        <Menu 
          mode="horizontal" 
          defaultSelectedKeys={["welcome"]} 
          selectedKeys={[currentView]}
          onClick={(e) => router.push(`/home?view=${e.key}`)}
          style={{ 
            borderBottom: '1px solid #f0f0f0',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'flex-start',
            flexWrap: 'nowrap',
            minWidth: isMobile ? initialPageMenu.length * 120 : 'auto',
          }}
        >
          {createMenuItems()}
        </Menu>
      </div>
    );
  };

  return (
    <>
      <HeaderComponent/>
      <Layout>
        {/* Menu lateral apenas para desktop */}
        {!isMobile && (
          <Sider
            width={256}
            style={{
              background: '#fff',
              overflow: 'auto',
              height: 'auto',
              borderRight: '1px solid #f0f0f0'
            }}
          >
            <SideMenu
              items={initialPageMenu}
              defaultSelected={currentView}
              onSelect={(key) => router.push(`/home?view=${key}`)}
            />
          </Sider>
        )}
        
        <Layout>
          {/* Menu horizontal apenas para mobile */}
          {isMobile && renderHorizontalMenu()}
          
          <Content style={{ padding: isMobile ? '16px' : '24px', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'flex-start',
              padding: isMobile ? '10px' : '20px'
            }}>
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}