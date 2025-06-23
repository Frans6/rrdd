'use client'
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/app/contexts/UserContext";
import { useRouter, usePathname } from "next/navigation";
import HeaderComponent from "@/app/components/HeaderComponent";
import LoadingComponent from "@/app/components/LoadingComponent";
import EventSideMenu from "@/app/components/EventSideMenu";
import ResultsComponent from "@/app/components/ResultsComponent";
import validatePath from "@/app/utils/validadePath";
import getBasePath from "@/app/utils/getBasePath";
import { Layout, Grid, Typography } from 'antd';

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

export default function Results() {
  const { user, loading } = useContext(UserContext);
  const [ canSee, setCanSee ] = useState<boolean>(false);
  const router = useRouter();
  const params = usePathname().split("/");
  const currentId = parseInt(params[1]);
  const currentPath = params[2];
  const [ userType, setUserType ] = useState<UserType>('common');
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  type UserType = 'player' | 'staff' | 'manager' | 'admin' | 'common';

  useEffect(() => {
    if (!user.access && !loading) {
      router.push("/");
    } else if (user.all_events) {
      const current = user.all_events.find(elem => elem.event?.id === currentId);
      if (current && current.role) {
        const isValidPath = validatePath(current.role, currentPath);
        if(isValidPath){
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

  if(!canSee || loading){
    return <LoadingComponent/>;
  }

  // Renderiza o menu horizontal para dispositivos móveis
  const renderHorizontalMenu = () => {
    return (
      <div style={{ 
        width: '100%', 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: '-ms-autohiding-scrollbar'
      }}>
        <EventSideMenu 
          userType={userType} 
          eventId={currentId} 
          mode="horizontal" 
        />
      </div>
    );
  };

  return( 
    <>
      <HeaderComponent/>
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
            paddingBottom: isMobile ? '16px' : '24px'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%'
            }}>
              <ResultsComponent isPlayer={userType === 'player'} />
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}