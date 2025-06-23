import React from 'react';
import { Layout, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const LOGO_URL = "https://rei-da-derivada.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.f28d5551.png&w=384&q=75";

interface HeaderSaibaMaisProps {
  onBack: () => void;
}

const HeaderSaibaMais: React.FC<HeaderSaibaMaisProps> = ({ onBack }) => {
  return (
    <Header 
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '20px 36px',
        height: 'auto',
        width: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ fontSize: '16px', color: '#1890ff' }}
        >
          Voltar
        </Button>
      </div>
      
      <div style={{ 
        position: 'absolute', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1
      }}>
        <Title level={3} style={{ margin: 0 }}>
          Saiba Mais
        </Title>
      </div>

      <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }}>
        <img
          src={LOGO_URL}
          alt="Logo do evento"
          style={{ height: '60px', width: 'auto' }}
        />
      </div>
    </Header>
  );
};

export default HeaderSaibaMais;