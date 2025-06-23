'use client'
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "@/app/contexts/UserContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import HeaderComponent from "@/app/components/HeaderComponent";
import LoadingComponent from "@/app/components/LoadingComponent";
import EventSideMenu from "@/app/components/EventSideMenu";
import validatePath from "@/app/utils/validadePath";
import getBasePath from "@/app/utils/getBasePath";
import ParticipantsManagementComponent, { ParticipantsManagementRefType } from "@/app/components/eventComponentes/ParticipantsManagementComponent";
import AddManager from "@/app/components/eventComponentes/AddManager";
import CreateSumula from "@/app/components/eventComponentes/CreateSumula";
import PublishResults from "@/app/components/eventComponentes/PublishResults";
import DeleteSumula from "@/app/components/eventComponentes/DeleteSumula";
import Manage from "@/app/components/eventComponentes/Manage";
import { Layout, Grid, Typography, Button } from 'antd';
import { ImportOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;
const { Title } = Typography;

declare global {
  interface Window {
    showPlayerImportModal?: () => void;
    showStaffImportModal?: () => void;
  }
}

export default function Admin() {
  const { user, loading } = useContext(UserContext);
  const [canSee, setCanSee] = useState<boolean>(false);
  const router = useRouter();
  const params = usePathname().split("/");
  const currentId = parseInt(params[1]);
  const currentPath = params[2];
  const [userType, setUserType] = useState<UserType>('common');
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const searchParams = useSearchParams();
  const participantsRef = useRef<ParticipantsManagementRefType>(null);
  
  // Obter a seção atual do parâmetro de URL ou usar 'overview' como padrão
  const currentSection = searchParams.get('section') || 'overview';
  
  type UserType = 'player' | 'staff' | 'manager' | 'admin' | 'common';

  useEffect(() => {
    if (!user.access && !loading) {
      router.push("/");
    } else if (user.all_events) {
      const current = user.all_events.find(elem => elem.event?.id === currentId);
      if (current && current.role) {
        const isValidPath = validatePath(current.role, currentPath);
        if (isValidPath) {
          setUserType(current.role as UserType);
          setCanSee(true);
        } else {
          router.push(`/${currentId}/${getBasePath(current.role)}`);
        }
      } else {
        router.push("/contests");
      }
    }
  }, [user]);

  if (!canSee || loading) {
    return <LoadingComponent />;
  }

  // Renderiza o menu horizontal para dispositivos móveis
  const renderHorizontalMenu = () => {
    return (
      <div style={{ 
        width: '100%', 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: '-ms-autohiding-scrollbar',
        // Adicionar paddingBottom para consistência
        marginBottom: '10px'
      }}>
        <EventSideMenu 
          userType={userType} 
          eventId={currentId} 
          mode="horizontal" 
        />
      </div>
    );
  };

  // Função para importar jogadores ou staff
  const handleImportClick = () => {
    if (participantsRef.current) {
      // Chamar o método correspondente com base na tab atual
      if (searchParams.get('tab') === 'staff') {
        participantsRef.current.showStaffImportModal();
      } else {
        participantsRef.current.showPlayerImportModal();
      }
    }
  };

  // Função que renderiza o conteúdo baseado na seção atual
  const renderAdminContent = () => {
    switch(currentSection) {
      case 'participants':
        return <ParticipantsManagementComponent ref={participantsRef} isManager={userType === 'manager'} />;
      
      case 'sumula':
        const sumulaType = searchParams.get('type') || 'all';
        if (sumulaType === 'classificatoria') {
          return <CreateSumula isImortal={false} buttonName="Súmula classificatória" />;
        } else if (sumulaType === 'imortal') {
          return <CreateSumula isImortal={true} buttonName="Súmula imortais" />;
        } else {
          // Se não houver tipo específico, mostrar ambos (comportamento original)
          return (
            <>
              <Title level={4} style={{ marginBottom: '24px' }}>Criar Nova Súmula</Title>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <CreateSumula isImortal={false} buttonName="Súmula classificatória" />
                </div>
                <div style={{ flex: 1 }}>
                  <CreateSumula isImortal={true} buttonName="Súmula imortais" />
                </div>
              </div>
            </>
          );
        }
        
      case 'results':
        return userType === 'admin' ? <PublishResults /> : null;
        
      case 'delete':
        return <DeleteSumula />;
        
      case 'overview':
      default:
        return <Manage isAdmin={userType === 'admin'} />;
    }
  };
  
  // Obtém o título da seção atual
  // const getSectionTitle = () => {
  //   switch(currentSection) {
  //     case 'participants':
  //       return 'Gerenciar Participantes';
  //     case 'sumula':
  //       const sumulaType = searchParams.get('type');
  //       if (sumulaType === 'classificatoria') {
  //         return 'Criar Súmula Classificatória';
  //       } else if (sumulaType === 'imortal') {
  //         return 'Criar Súmula de Imortais';
  //       } else {
  //         return 'Gerenciar Súmulas';
  //       }
  //     case 'results':
  //       return 'Publicar Resultados';
  //     case 'delete':
  //       return 'Excluir Súmulas';
  //     case 'overview':
  //     default:
  //       return 'Visão Geral';
  //   }
  // };

  return (
    <>
      <HeaderComponent />
      <Layout>
        {/* Menu lateral principal apenas para desktop */}
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
            <EventSideMenu 
              userType={userType} 
              eventId={currentId} 
            />
          </Sider>
        )}
        
        <Layout>
          {/* Menu horizontal principal apenas para mobile */}
          {isMobile && renderHorizontalMenu()}
          
          <Content style={{ 
            padding: isMobile ? '16px' : '24px', 
            minHeight: 'calc(100vh - 64px)',
            paddingBottom: isMobile ? '16px' : '24px',
          }}>
            {/* Botão de importação posicionado à direita */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              {/* Renderiza o botão apenas para a seção de participantes */}
              {currentSection === 'participants' && (
                <Button 
                  type="primary"
                  icon={<ImportOutlined />}
                  onClick={handleImportClick}
                >
                  {searchParams.get('tab') === 'staff' ? 'Importar Staff' : 'Importar Jogadores'}
                </Button>
              )}
            </div>
            
            {/* Conteúdo da seção atual */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%',
            }}>
              {renderAdminContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}