import React, { useContext } from 'react';
import { Layout, Typography, Avatar, Grid } from 'antd';
import { UserContext } from "@/app/contexts/UserContext";

const { Header } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const LOGO_URL = "https://rei-da-derivada.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.f28d5551.png&w=384&q=75";

const HeaderComponent = () => {
    const { user } = useContext(UserContext);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    return (
        <Header 
            style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                padding: isMobile ? '10px 16px' : '20px 36px',
                height: 'auto',
                width: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', flex: '1 1 auto' }}>
                <Avatar 
                    size={isMobile ? 40 : 60}
                    src={user.picture_url}
                    alt="Foto de perfil do usuário"
                    style={{ borderRadius: '10px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '16px' }}>
                        Seja bem-vindo(a)
                    </Text>
                    <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
                        {user.first_name}
                    </Title>
                </div>
            </div>

            <div style={{ flex: '0 0 auto' }}>
                <img
                    src={LOGO_URL}
                    alt="Logo do evento"
                    style={{ height: isMobile ? '40px' : '60px', width: 'auto' }}
                />
            </div>
        </Header>
    );
};

export default HeaderComponent;