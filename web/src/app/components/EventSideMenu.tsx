import React, { useEffect, useState } from 'react';
import { Menu } from 'antd';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  CalendarOutlined,
  TeamOutlined,
  DeleteOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

type UserType = 'player' | 'staff' | 'manager' | 'admin' | 'common';

interface EventSideMenuProps {
  userType: UserType;
  eventId: number | string;
  mode?: 'vertical' | 'horizontal' | 'inline';
}

// Definição explícita do tipo para os itens de menu
type MenuItem = {
  key: string;
  icon?: React.ReactNode;
  label: string | React.ReactNode;
  children?: MenuItem[];
  disabled?: boolean;
};

const EventSideMenu: React.FC<EventSideMenuProps> = ({ userType, eventId, mode = 'inline' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = pathname.split('/')[2] || '';
  const isAdminPage = currentPath === 'admin';
  const currentSection = searchParams.get('section') || 'overview';
  
  // Estado local para gerenciar as chaves selecionadas
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  
  // Estado local para controlar quais submenus estão abertos
  const [openKeys, setOpenKeys] = useState<string[]>(isAdminPage ? ['admin'] : []);

  // Efeito que atualiza as chaves selecionadas quando a rota ou parâmetros de consulta mudam
  useEffect(() => {
    // Lógica para determinar quais chaves devem ser selecionadas
    if (isAdminPage) {
      setSelectedKeys([`admin-${currentSection}`]);
      
      // Se ainda não temos o menu admin nos openKeys, adicione-o
      if (!openKeys.includes('admin')) {
        setOpenKeys(prev => [...prev, 'admin']);
      }
    } else {
      setSelectedKeys([currentPath || 'home']);
    }
  }, [currentPath, currentSection, isAdminPage, searchParams]);

  // Handler para quando o usuário abre/fecha um submenu
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // Define os itens de menu com base no userType
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: mode === 'horizontal' ? 'Home' : (
          <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Home</span>
        ),
      },
    ];

    // Adiciona itens específicos baseados no tipo de usuário
    if (['player', 'staff', 'admin', 'manager'].includes(userType)) {
      baseItems.push({
        key: 'results',
        icon: <BarChartOutlined />,
        label: mode === 'horizontal' ? 'Resultados' : (
          <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Resultados</span>
        ),
      });
    }

    if (['player'].includes(userType)) {
      baseItems.push({
        key: 'profile',
        icon: <UserOutlined />,
        label: mode === 'horizontal' ? 'Perfil' : (
          <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Perfil</span>
        ),
      });
    }

    if (['staff', 'admin', 'manager'].includes(userType)) {
      baseItems.push({
        key: 'sumula',
        icon: <FileTextOutlined />,
        label: mode === 'horizontal' ? 'Súmula' : (
          <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Súmula</span>
        ),
      });
    }

    if (['admin', 'manager'].includes(userType)) {
      // Adiciona menu administrativo com submenus
      const adminChildren: MenuItem[] = [
        {
          key: 'admin-overview',
          icon: <SettingOutlined />,
          label: mode === 'horizontal' ? 'Visão Geral' : (
            <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Visão Geral</span>
          ),
        },
        {
          key: 'admin-participants',
          icon: <TeamOutlined />,
          label: mode === 'horizontal' ? 'Gerenciar Participantes' : (
            <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Gerenciar Participantes</span>
          ),
        },
      ];
      
      // Submenu para súmulas
      const sumulaChildren: MenuItem[] = [
        {
          key: 'admin-sumula-classificatoria',
          icon: <FileTextOutlined />,
          label: mode === 'horizontal' ? 'Súmula Classificatória' : (
            <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Súmula Classificatória</span>
          ),
        },
        {
          key: 'admin-sumula-imortal',
          icon: <TrophyOutlined />,
          label: mode === 'horizontal' ? 'Súmula Imortais' : (
            <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Súmula Imortais</span>
          ),
        },
      ];
      
      adminChildren.push({
        key: 'admin-sumula',
        icon: <FileTextOutlined />,
        label: mode === 'horizontal' ? 'Gerenciar Súmulas' : (
          <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Gerenciar Súmulas</span>
        ),
        children: sumulaChildren
      });
      
      // Demais itens do menu admin
      adminChildren.push(
        {
          key: 'admin-results',
          icon: <BarChartOutlined />,
          label: mode === 'horizontal' ? 'Publicar Resultados' : (
            <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Publicar Resultados</span>
          ),
          disabled: userType !== 'admin',
        },
        {
          key: 'admin-delete',
          icon: <DeleteOutlined />,
          label: mode === 'horizontal' ? 'Excluir Súmulas' : (
            <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Excluir Súmulas</span>
          ),
        }
      );
      
      // Adicionar o item de administração ao menu principal
      baseItems.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: mode === 'horizontal' ? 'Administração' : (
          <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Administração</span>
        ),
        children: adminChildren
      });
    }

    if (userType === 'common') {
      baseItems.push({
        key: 'contests',
        icon: <CalendarOutlined />,
        label: mode === 'horizontal' ? 'Competições' : (
          <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Competições</span>
        ),
      });
    }

    return baseItems;
  };

  const handleMenuClick = (key: string) => {
    // Navega para a rota correta
    if (key === 'contests') {
      router.push('/contests');
    } else if (key === 'home') {
      router.push(`/${eventId}/admin`);
    } else if (key === 'admin') {
      router.push(`/${eventId}/admin?section=overview`);
    } else if (key.startsWith('admin-')) {
      // Subitens específicos para criação de súmulas
      if (key === 'admin-sumula-classificatoria') {
        router.push(`/${eventId}/admin?section=sumula&type=classificatoria`);
      } else if (key === 'admin-sumula-imortal') {
        router.push(`/${eventId}/admin?section=sumula&type=imortal`);
      } else {
        // Extrai a seção do admin a partir da chave
        const section = key.replace('admin-', '');
        router.push(`/${eventId}/admin?section=${section}`);
      }
    } else {
      router.push(`/${eventId}/${key}`);
    }
  };

  return (
    <Menu
      onClick={({ key }) => handleMenuClick(key)}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      mode={mode}
      style={{ 
        width: mode === 'inline' ? 256 : '100%',
        height: mode === 'inline' ? '100%' : 'auto',
        borderRight: mode === 'inline' ? '1px solid #f0f0f0' : 'none',
        borderBottom: mode === 'horizontal' ? '1px solid #f0f0f0' : 'none',
        // Novas propriedades para garantir centralização horizontal
        ...(mode === 'horizontal' ? {
          display: 'flex',
          justifyContent: 'flex-start',
          flexWrap: 'nowrap',
          minWidth: '600px', // Largura mínima para garantir que caiba todo o conteúdo
          paddingBottom: '0'
        } : {})
      }}
      items={getMenuItems()}
      className={mode === 'inline' ? 'centered-menu-items' : undefined}
    />
  );
};

export default EventSideMenu;