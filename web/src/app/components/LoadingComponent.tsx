import React from 'react';
import { Typography, Flex } from 'antd';
import Image from 'next/image';
import Logo from "@/app/assets/logo.png";
import './Loading.css';

const { Text } = Typography;

interface LoadingComponentProps {
  fullScreen?: boolean;
  showLogo?: boolean;
  size?: 'small' | 'default' | 'large';
  logoSize?: number;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ 
  fullScreen = true, 
  showLogo = true,
  size = 'large',
  logoSize
}) => {
  // Determina o tamanho da logo com base no parâmetro size
  const getLogoSize = () => {
    if (logoSize) return logoSize;
    
    switch (size) {
      case 'small': return 60;
      case 'default': return 80;
      case 'large': return 100;
      default: return 80;
    }
  };

  // Tamanho final da logo
  const finalLogoSize = getLogoSize();
  
  return (
    <div style={{ 
      height: fullScreen ? '100vh' : '100%', 
      width: '100%',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#fff',
      padding: '20px'
    }}>
      <Flex vertical align="center" gap={16}>
        {showLogo && (
          <div className="logo-container">
            <div className="logo-spinner-smooth">
              <Image 
                src={Logo} 
                alt="Logo Rei e rainha da derivada" 
                width={finalLogoSize} 
                height={finalLogoSize}
                priority
              />
            </div>
          </div>
        )}
      </Flex>
    </div>
  );
};

export default LoadingComponent;