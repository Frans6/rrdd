import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import request from "@/app/utils/request";
import { settingsWithAuth } from "@/app/utils/settingsWithAuth";
import { usePathname } from "next/navigation";
import capitalize from "@/app/utils/capitalize";
import { isAxiosError } from "axios";
import { 
  Card, 
  Typography, 
  Spin, 
  Empty, 
  Row, 
  Col, 
  Divider, 
  List, 
  Avatar, 
  Badge, 
  Tag, 
  Space 
} from 'antd';
import { 
  TrophyOutlined, 
  CrownOutlined, 
  StarOutlined, 
  UserOutlined, 
  TeamOutlined,
  FlagOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ResultsComponentProps {
  isPlayer: boolean,
}

interface PlayerResult {
  id: number;
  total_score: number;
  full_name: string;
  social_name: string;
}

export default function ResultsComponent({ isPlayer }: ResultsComponentProps) {
  const { user } = useContext(UserContext);
  const [published, setPublished] = useState<boolean>(false);
  const [canSee, setCanSee] = useState<boolean>(false);
  const [results, setResults] = useState<any>();
  const [playerResults, setPlayerResults] = useState<PlayerResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const currentId = usePathname().split('/')[1];

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await request.get(`/api/results/?event_id=${currentId}`, settingsWithAuth(user.access));
      
      if (response.status === 200) {
        setResults(response.data);
      }
      
      if (isPlayer) {
        const playerResponse = await request.get(`/api/results/player/?event_id=${currentId}`, settingsWithAuth(user.access));
        if (playerResponse.status === 200) {
          setPlayerResults(playerResponse.data); // Corrigido para usar playerResponse
        }
      }
      
      setPublished(true);
      setCanSee(true);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data.errors || "Erro desconhecido";
        console.log(errorMessage);
      }
      setCanSee(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
  }, [user]);

  if (!canSee) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <Spin size="large" tip="Carregando resultados..." />
      </div>
    );
  }

  if (!published) {
    return (
      <Card style={{ margin: '24px', borderRadius: '8px' }}>
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text style={{ fontSize: 16 }}>
              Os resultados ainda não foram publicados
            </Text>
          }
        />
      </Card>
    );
  }

  const renderPlayerItem = (player: PlayerResult, icon?: React.ReactNode, tagText?: string, tagColor?: string) => (
    <List.Item>
      <Card 
        hoverable 
        style={{ width: '100%', borderRadius: '8px' }}
        bodyStyle={{ padding: '16px' }}
      >
        <List.Item.Meta
          avatar={
            <Avatar 
              icon={icon || <UserOutlined />} 
              size={48}
              style={{ 
                backgroundColor: tagColor || '#1890ff',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            />
          }
          title={
            <Space>
              <Text strong style={{ fontSize: '16px' }}>
                {capitalize(player.full_name)}
              </Text>
              {tagText && (
                <Tag color={tagColor}>{tagText}</Tag>
              )}
            </Space>
          }
          description={
            <Badge 
              count={player.total_score} 
              style={{ 
                backgroundColor: '#52c41a',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '0 8px'
              }}
              overflowCount={9999}
            />
          }
        />
      </Card>
    </List.Item>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Seção de desempenho do jogador */}
        {isPlayer && playerResults && (
          <Col xs={24}>
            <Card 
              title={
                <Title level={4} style={{ margin: 0 }}>
                  <Space>
                    <UserOutlined />
                    SEU DESEMPENHO
                  </Space>
                </Title>
              }
              bordered={true}
              className="shadow-sm"
              style={{ borderRadius: '8px' }}
              headStyle={{ backgroundColor: '#e6f7ff', borderBottom: '1px solid #91d5ff' }}
            >
              {renderPlayerItem(playerResults, <StarOutlined />, "Sua pontuação", "#722ed1")}
            </Card>
          </Col>
        )}

        {/* Seção do TOP 4 */}
        <Col xs={24} md={12}>
          <Card 
            title={
              <Title level={4} style={{ margin: 0 }}>
                <Space>
                  <TrophyOutlined style={{ color: '#faad14' }} />
                  TOP 4
                </Space>
              </Title>
            }
            bordered={true}
            className="shadow-sm"
            style={{ borderRadius: '8px' }}
            headStyle={{ backgroundColor: '#fffbe6', borderBottom: '1px solid #ffe58f' }}
          >
            {results?.top4 && results.top4.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={results.top4}
                renderItem={(player: PlayerResult, index: number) => renderPlayerItem(
                  player, 
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{index + 1}</Text>,
                  `${index + 1}º lugar`,
                  index === 0 ? '#faad14' : (index === 1 ? '#bfbfbf' : (index === 2 ? '#cd7f32' : '#1890ff'))
                )}
              />
            ) : (
              <Empty description="Ainda não divulgado" />
            )}
          </Card>
        </Col>

        {/* Seção dos Imortais */}
        <Col xs={24} md={12}>
          <Card 
            title={
              <Title level={4} style={{ margin: 0 }}>
                <Space>
                  <CrownOutlined style={{ color: '#eb2f96' }} />
                  IMORTAIS
                </Space>
              </Title>
            }
            bordered={true}
            className="shadow-sm"
            style={{ borderRadius: '8px' }}
            headStyle={{ backgroundColor: '#fff0f6', borderBottom: '1px solid #ffadd2' }}
          >
            {results?.imortals && results.imortals.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={results.imortals}
                renderItem={(player: PlayerResult) => renderPlayerItem(player, <CrownOutlined />, "Imortal", "#eb2f96")}
              />
            ) : (
              <Empty description="Ainda não divulgado" />
            )}
          </Card>
        </Col>

        {/* Seção do Paladino e Embaixador */}
        <Col xs={24}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card 
                title={
                  <Title level={4} style={{ margin: 0 }}>
                    <Space>
                      <TeamOutlined style={{ color: '#52c41a' }} />
                      PALADINO
                    </Space>
                  </Title>
                }
                bordered={true}
                className="shadow-sm"
                style={{ borderRadius: '8px', height: '100%' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #b7eb8f' }}
              >
                {results?.paladin && results.paladin.full_name ? (
                  renderPlayerItem(results.paladin, <TeamOutlined />, "Paladino", "#52c41a")
                ) : (
                  <Empty description="Ainda não divulgado" />
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card 
                title={
                  <Title level={4} style={{ margin: 0 }}>
                    <Space>
                      <FlagOutlined style={{ color: '#1890ff' }} />
                      EMBAIXADOR
                    </Space>
                  </Title>
                }
                bordered={true}
                className="shadow-sm"
                style={{ borderRadius: '8px', height: '100%' }}
                headStyle={{ backgroundColor: '#e6f7ff', borderBottom: '1px solid #91d5ff' }}
              >
                {results?.ambassor && results.ambassor.full_name ? (
                  renderPlayerItem(results.ambassor, <FlagOutlined />, "Embaixador", "#1890ff")
                ) : (
                  <Empty description="Ainda não divulgado" />
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
