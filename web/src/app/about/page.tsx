'use client'
import React, { useState } from 'react';
import { Layout, Typography, Card, Menu, Grid } from 'antd';
import type { MenuProps } from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import HeaderSaibaMais from '../components/HeaderSaibaMais';
import SideMenu from '../components/SideMenu';

const { Content, Sider } = Layout;
const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const menuItems = [
  { key: 'evento', icon: <CalendarOutlined />, label: 'O Evento' },
  { key: 'musica', icon: <CustomerServiceOutlined />, label: 'Música' },
  { key: 'realizar', icon: <FileTextOutlined />, label: 'Realize o Evento' },
];

// Tipos para o conteúdo
interface ContentItem {
  title: string;
  content: string;
}

// Define um tipo para o contentMap
interface ContentMap {
  evento: ContentItem[];
  musica: ContentItem;
  realizar: ContentItem;
  [key: string]: ContentItem[] | ContentItem;
}

const contentMap: ContentMap = {
  evento: [
    {
      title: 'O que é a Metodologia Rei/Rainha da Derivada?',
      content: `A  Metodologia Rei/Rainha da Derivada é uma abordagem pedagógica inovadora que transforma o aprendizado em uma competição acadêmica lúdica e engajadora. Desenvolvida originalmente para o ensino de Cálculo Diferencial pelo professor Ricardo Fragelli da UnB, a metodologia foi adaptada com sucesso para diversas disciplinas.

O formato combina elementos de gamificação, música e competição saudável, criando uma experiência memorável de aprendizagem que pode ser aplicada a qualquer conteúdo que envolva resolução de problemas ou domínio de conceitos fundamentais.`,    },
    {
      title: 'Objetivos da Metodologia',
      content: `• Tornar o aprendizado ativo e significativo através da competição saudável
• Promover o domínio de conceitos-chave de qualquer disciplina
• Reduzir a evasão e aumentar o engajamento dos estudantes
• Desenvolver habilidades como raciocínio rápido e trabalho sob pressão
• Transformar conteúdos complexos em desafios estimulantes
• Fomentar o espírito colaborativo mesmo em ambiente competitivo`,
    },
    {
      title: 'Para quem é esta metodologia?',
      content: `A metodologia é perfeita para:
• Professores que desejam inovar em suas aulas
• Instituições que buscam reduzir índices de reprovação
• Disciplinas com altas taxas de evasão
• Conteúdos considerados difíceis pelos alunos
• Qualquer nível educacional, do fundamental à pós-graduação`,
    },
  ],
  musica: {
    title: "Música 'Rei da Derivada'\nAutores: Ricardo Fragelli, Helber Rangel e Ricardo Noronha.",
    content: `Se eu canto, "cê" canta secante, cante tangente.
Se eu canto, "cê" canta secante, cante tangente.
E passa uma reta, e ela passa tão rente,
Mas a derivada é a inclinação da tangente

REFRÃO: Rei da derivada (4X)

Derivei uma estrela, estre-linha ficou
Derivei a cabeça, e a cabeça pirou
Derivei a constante, e a constante zerou
Derivei "e de x", e ela não se alterou.

REFRÃO: Rei da derivada (4X)

Esqueceu ipsilon-linha, não vale chorar
A decisão é só minha, vai ter que aturar
Não pode errar parêntesis, não pode errar sinal.
Tem que acertar tudo, "pra ir" "pra" final

(repete a primeira parte da música)

REFRÃO: Rei da derivada (4X)`,
  },
  realizar: {
    title: 'Como realizar o evento na sua instituição?',
    content: `Para organizar o Rei da Derivada em sua escola, universidade ou centro educacional, você pode utilizar um sistema próprio de gerenciamento da competição. Esse sistema permite configurar etapas, cadastrar participantes, criar perguntas com correção automática e acompanhar os resultados em tempo real.

O ideal é que o evento seja conduzido por professores da área de Matemática ou Engenharia, que possam adaptar o conteúdo às necessidades do público-alvo. A aplicação pode ser feita em auditórios, salas de aula ou ambientes virtuais, desde que haja estrutura para projeção e conexão simultânea dos alunos.

Também é recomendado preparar brindes simbólicos, como medalhas, certificados e troféus, além de criar um ambiente descontraído com música e torcida. A ideia é celebrar o conhecimento, incentivando os estudantes a vencerem os desafios do cálculo com bom humor e espírito de equipe.

Para acessar materiais de apoio ou tirar dúvidas, entre em contato diretamente com o idealizador do projeto.`,
  },
};

export default function AboutPage() {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<string>('evento');
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleMenuSelect = (key: string) => {
    setSelectedKey(key);
  };

  // Função para verificar se o conteúdo é um array
  const isContentArray = (key: string): key is 'evento' => {
    return Array.isArray(contentMap[key]);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <HeaderSaibaMais onBack={() => router.push("/")} />

      {isMobile && (
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={(info) => setSelectedKey(info.key)}
          items={menuItems}
          style={{ borderBottom: '1px solid #f0f0f0', justifyContent: 'center' }}
        />
      )}

      <Layout>
        {!isMobile && (
          <Sider width={256} style={{ background: '#fff' }}>
            <SideMenu 
              items={menuItems} 
              defaultSelected={selectedKey}
              onSelect={handleMenuSelect}
            />
          </Sider>
        )}

        <Layout style={{ padding: '24px', background: '#fff' }}>
          <Content style={{ width: '100%', background: '#fff' }}>
            {isContentArray(selectedKey) ? (
              contentMap[selectedKey].map((item, index) => (
                <Card
                  key={index}
                  bordered={false}
                  hoverable
                  style={{
                    width: '100%',
                    marginBottom: '24px',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                    padding: isMobile ? '16px' : '24px',
                    transition: 'transform 0.3s',
                  }}
                  bodyStyle={{ padding: 0 }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = 'scale(1.0)')}
                >
                  <div style={{ backgroundColor: '#e6f7ff', padding: '16px', textAlign: 'center' }}>
                    <Title level={5} style={{ color: '#1890ff', margin: 0, textAlign: 'center' }}>
                      {item.title}
                    </Title>
                  </div>
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <Paragraph style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
                      {item.content}
                    </Paragraph>
                  </div>
                </Card>
              ))
            ) : (
              <Card
                bordered={false}
                hoverable
                style={{
                  width: '100%',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                  padding: isMobile ? '16px' : '24px',
                  transition: 'transform 0.3s',
                }}
                bodyStyle={{ padding: 0 }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = 'scale(1.0)')}
              >
                <div style={{ backgroundColor: '#e6f7ff', padding: '16px', textAlign: 'center' }}>
                  <Title level={5} style={{ color: '#1890ff', margin: 0, textAlign: 'center' }}>
                    {(contentMap[selectedKey] as ContentItem).title}
                  </Title>
                </div>
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <Paragraph style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
                    {(contentMap[selectedKey] as ContentItem).content}
                  </Paragraph>
                </div>
              </Card>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}