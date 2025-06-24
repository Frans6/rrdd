'use client'
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/app/contexts/UserContext";
import Image from "next/image";
import Logo from "@/app/assets/logo.png";
import { Button, Card, Typography, Flex, Row, Col, Grid, Spin } from "antd";
import LoadingComponent from "@/app/components/LoadingComponent";

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  // Estado para controlar quando a página está pronta para ser exibida
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setUser } = useContext(UserContext);
  const router = useRouter();
  
  // Configurações do OAuth
  const redirectUri = process.env.NEXT_PUBLIC_LOCAL_URL || "http://localhost:3000";
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  console.log("versão: 1.0.0");
  
  // Debug das variáveis de ambiente
  useEffect(() => {
    console.log("Environment variables:", {
      redirectUri,
      clientId: clientId ? "Set" : "Not set",
      apiUrl: apiUrl ? "Set" : "Not set"
    });
  }, []);
  
  const list = ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"];
  const scopes = list.join(" ");
  const params = new URLSearchParams({
    client_id: clientId,
    include_granted_scopes: "false",
    redirect_uri: redirectUri,
    state: "state_parameter_passthrough_value_sosalve",
    response_type: "token",
    scope: scopes,
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // Detectar tamanho da tela para responsividade
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Verificar inicialmente
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Lidar com token de autenticação
  useEffect(() => {
    const hash = window.location.hash;
    console.log("Current hash:", hash);
    
    let token = null;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      token = hashParams.get("access_token");
      console.log("Token found in hash:", token ? "Yes" : "No");
    }
    
    if (token) {
      console.log("Processing Google authentication...");
      // Ativar o estado de processamento de login
      setIsProcessingLogin(true);
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Accept", "application/json");

      fetch(`${apiUrl}/users/register/google/`, {
        method: "POST",
        headers: myHeaders,
        credentials: "include",
        body: JSON.stringify({
          access_token: token,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Error ${res.status}: ${errorText}`);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Response is not JSON:", text);
          throw new Error("Invalid response format");
        }
        
        return res.json();
      }).then((data) => {
        if (data && (data.access || data.email)) {
          setUser(data);
          router.push("/home");
        } else {
          console.error("Invalid user data received:", data);
          setIsProcessingLogin(false);
        }
      }).catch((err) => {
        console.error("Authentication error:", err);
        // Limpar o token da URL em caso de erro
        window.history.replaceState({}, document.title, window.location.pathname);
        // Desativar o estado de processamento em caso de erro
        setIsProcessingLogin(false);
      });
    }
    
    // Definir isLoading como false após um pequeno delay para garantir que tudo esteja carregado
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Mostrar o componente de carregamento enquanto processa o login
  if (isProcessingLogin) {
    return <LoadingComponent />;
  }
  
  // Mostra uma tela de carregamento enquanto os componentes não estão prontos
  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: isMobile ? '20px' : '40px' }}>
      <Flex vertical align="center" gap={isMobile ? 24 : 40}>
        <Flex vertical align="center" gap={10}>
          <Image 
            src={Logo} 
            alt="Logo Rei e rainha da derivada" 
            width={isMobile ? 80 : 100} 
            height={isMobile ? 80 : 100}
          />
          <Title level={2} style={{ fontSize: isMobile ? 22 : 28, textAlign: "center" }}>
            Rei/Rainha da Derivada
          </Title>
        </Flex>

        <Flex vertical align="center" gap={16} style={{ maxWidth: 800, textAlign: 'center' }}>
          <Title level={1} style={{ fontSize: isMobile ? 22 : 28 }}>
            Uma Metodologia Ativa para Aprender com Engajamento
          </Title>
          <Paragraph style={{ fontSize: isMobile ? 14 : 16 }}>
            O Rei/Rainha da Derivada é mais do que um jogo — é uma estratégia de ensino que transforma a aprendizagem em uma experiência ativa, dinâmica e colaborativa. Ideal para ser adaptado a diversos conteúdos, de matemática a ciências humanas.
          </Paragraph>
          <Button
            type="default"
            size="large"
            style={{
              backgroundColor: '#fff',
              borderColor: '#1890ff',
              color: '#1890ff',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#096dd9';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#096dd9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#1890ff';
              e.currentTarget.style.borderColor = '#1890ff';
            }}
            onClick={() => router.push("/about")}
          >
            Saiba Mais
          </Button>
        </Flex>

        <Row gutter={[24, 24]} justify="center" style={{ marginTop: isMobile ? 20 : 40, width: '100%' }}>
          {[
            {
              title: 'Aprendizagem Ativa',
              description: 'Estimula o protagonismo do aluno com desafios que exigem pensamento crítico e colaboração.'
            },
            {
              title: 'Gamificação',
              description: 'A estrutura de "reinado" cria uma competição saudável, motivando alunos de diferentes perfis.'
            },
            {
              title: 'Multidisciplinar',
              description: 'Pode ser adaptado para qualquer área do conhecimento — não só cálculo!'
            },
          ].map((item, index) => (
            <Col key={index} xs={24} sm={12} md={7}>
              <Card
                title={<Text strong style={{ color: '#1890ff', display: 'block', textAlign: 'center' }}>{item.title}</Text>}
                headStyle={{ backgroundColor: "#e6f7ff", minHeight: 40, textAlign: 'center' }}
                bordered={false}
                hoverable
                style={{
                  height: 160,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                bodyStyle={{ padding: 16, textAlign: 'center' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Paragraph style={{ fontSize: 14, marginBottom: 0, textAlign: 'center' }}>{item.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        <Flex vertical align="center" gap={16} style={{ marginTop: isMobile ? 40 : 60, padding: isMobile ? '0 10px' : 0 }}>
          <Paragraph style={{ fontSize: isMobile ? 16 : 18, textAlign: "center", maxWidth: 600 }}>
            Para participar do RRDD, entre com sua conta Google e comece agora sua jornada.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={() => { 
              // Armazenar um flag para verificação futura
              sessionStorage.setItem('attempting_login', 'true');
              router.replace(url);
            }}
          >
            Entrar com Google
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}