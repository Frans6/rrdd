'use client'
import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { initialPageMenu } from '../utils/menuItems';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed = false, onCollapse }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  
  // Altura do header
  const headerHeight = 100; // Ajuste conforme necessário
  
  // Obtém o parâmetro view atual
  const currentView = searchParams.get('view') || 'welcome';
  
  // Função para lidar com cliques nos itens do menu
  const handleMenuClick = (e: any) => {
    const key = e.key;
    
    // Se estivermos na página home, usamos parâmetros de URL
    if (pathname === '/home') {
      router.push(`/home?view=${key}`);
    } else {
      // Caso contrário, navegamos para a página correspondente
      router.push(`/${key}`);
    }
  };

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (onCollapse) {
      onCollapse(collapsed);
    }
  };

  // Função recursiva para processar os itens do menu
  const processMenuItems = (items: any[]): any[] => {
    return items.map(item => {
      if (item.children) {
        return {
          ...item,
          children: processMenuItems(item.children)
        };
      }
      return item;
    });
  };

  // Processa os itens do menu
  const menuItems = processMenuItems(initialPageMenu);

  // Determina as chaves abertas para submenus
  const getOpenKeys = () => {
    const keys = [];
    if (
      currentView === 'new-event' || 
      currentView === 'join-event' || 
      currentView === 'active-events' || 
      currentView === 'past-events'
    ) {
      keys.push('my-events');
    }
    return keys;
  };

  return (
    <Sider
      collapsible
      collapsed={isCollapsed}
      onCollapse={handleCollapse}
      theme="light"
      width={250}
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: `calc(100vh - ${headerHeight}px)`,
        position: 'fixed',
        left: 0,
        top: `${headerHeight}px`, // Posiciona o sidebar abaixo do header
        bottom: 0,
        zIndex: 500,
        overflow: 'auto'
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[currentView]}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: '1px solid #f0f0f0',
          height: '100%',
          paddingTop: '8px'
        }}
      />
    </Sider>
  );
};

export default AppSidebar;