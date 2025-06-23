import React from 'react';
import { Menu } from 'antd';
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';

interface SideMenuProps {
  items: any[];
  defaultSelected: string;
  onSelect?: (key: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ items, defaultSelected, onSelect }) => {
  const router = useRouter();

  const onClick: MenuProps['onClick'] = (e) => {
    if (onSelect) {
      onSelect(e.key);
    } else {
      router.push(`/${e.key}`);
    }
  };

  const centeredItems = items.map(item => ({
    ...item,
    label: <span style={{ display: 'block', textAlign: 'center' }}>{item.label}</span>
  }));

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[defaultSelected]}
      mode="inline"
      style={{ 
        width: 256,
        height: '100%',
        borderRight: '1px solid #f0f0f0'
      }}
      items={centeredItems}
      className="centered-menu-items"
    />
  );
};

export default SideMenu;