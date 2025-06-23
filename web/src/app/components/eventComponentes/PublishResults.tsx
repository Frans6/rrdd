import React, { useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserContext } from "@/app/contexts/UserContext";
import {
  Typography,
  Card,
  Space,
  Button,
  Switch,
  Select,
  Checkbox,
  Form,
  Divider,
  Row,
  Col,
  Alert,
  Empty,
  Spin,
  message
} from "antd";
import {
  TrophyOutlined,
//   ShieldOutlined,
  SafetyOutlined,
  FlagOutlined,
  UserOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import toast from "react-hot-toast";
import request from "@/app/utils/request";
import { settingsWithAuth } from "@/app/utils/settingsWithAuth";
import getAllPlayers from "@/app/utils/api/getAllPlayers";
import { isAxiosError } from "axios";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Player {
  full_name: string;
  id: number;
}

export default function PublishResults() {
  // Estados
  const { user } = useContext(UserContext);
  const [top1, setTop1] = useState<Player | null>(null);
  const [top2, setTop2] = useState<Player | null>(null);
  const [top3, setTop3] = useState<Player | null>(null);
  const [top4, setTop4] = useState<Player | null>(null);
  const [ambassor, setAmbassador] = useState<Player | null>(null);
  const [paladin, setPaladin] = useState<Player | null>(null);
  const [postTop4, setPostTop4] = useState<boolean>(false);
  const [postImortais, setPostImortais] = useState<boolean>(false);
  const [postPaladin, setPostPaladin] = useState<boolean>(false);
  const [postAmbassor, setPostAmbassor] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const eventId = usePathname().split("/")[1];
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // Função para resetar o formulário
  const resetForm = () => {
    setPostTop4(false);
    setPostImortais(false);
    setPostPaladin(false);
    setPostAmbassor(false);
    setPaladin(null);
    setAmbassador(null);
    setTop1(null);
    setTop2(null);
    setTop3(null);
    setTop4(null);
    setConfirm(false);
    form.resetFields();
  };

  // Função para publicar os resultados
  const handlePublish = async () => {
    // Validação antes do envio
    if (postTop4 && (!top1 || !top2 || !top3 || !top4)) {
      toast.error("Selecione todos os jogadores do TOP 4");
      messageApi.error("Selecione todos os jogadores do TOP 4");
      return;
    }
    
    if (postPaladin && !paladin) {
      toast.error("Selecione o Paladino");
      messageApi.error("Selecione o Paladino");
      return;
    }
    
    if (postAmbassor && !ambassor) {
      toast.error("Selecione o Embaixador");
      messageApi.error("Selecione o Embaixador");
      return;
    }

    setLoading(true);
    try {
      // Publicar resultados gerais (TOP 4, Paladino, Embaixador)
      if (postAmbassor || postPaladin || postTop4) {
        const body: any = {};
        
        if (postTop4 && top1 && top2 && top3 && top4) {
          const top4List = [
            { player_id: top1.id }, 
            { player_id: top2.id }, 
            { player_id: top3.id }, 
            { player_id: top4.id }
          ];
          body.top4 = top4List;
        }
        
        if (postPaladin && paladin) {
          body.paladin = { player_id: paladin.id };
        }
        
        if (postAmbassor && ambassor) {
          body.ambassor = { player_id: ambassor.id };
        }
        
        const response = await request.put(
          `/api/results/?event_id=${eventId}`, 
          body, 
          settingsWithAuth(user.access)
        );
        
        if (response.status === 200) {
          toast.success("Resultados publicados com sucesso.");
          messageApi.success("Resultados publicados com sucesso.");
        }
      }
      
      // Publicar imortais
      if (postImortais) {
        const response = await request.put(
          `/api/publish/results/imortals/?event_id=${eventId}`, 
          {}, 
          settingsWithAuth(user.access)
        );
        
        if (response.status === 200) {
          toast.success("Imortais publicados com sucesso.");
          messageApi.success("Imortais publicados com sucesso.");
        }
      }
      
      // Resetar formulário após sucesso
      resetForm();
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data.errors || "Erro ao publicar resultados";
        toast.error(errorMessage);
        messageApi.error(errorMessage);
      } else {
        toast.error("Ocorreu um erro ao publicar os resultados.");
        messageApi.error("Ocorreu um erro ao publicar os resultados.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar jogadores do evento
  const getPlayers = async () => {
    try {
      setLoading(true);
      const players = await getAllPlayers(eventId, user.access);
      setAllPlayers(players);
    } catch (error) {
      toast.error("Erro ao carregar jogadores.");
      messageApi.error("Erro ao carregar jogadores.");
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    getPlayers();
  }, []);

  return (
    <>
      {contextHolder}
      <div className="publish-results-container">
        <Card
          title={
            <Space align="center">
              <TrophyOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              <Title level={4} style={{ margin: 0 }}>Publicar Resultados</Title>
            </Space>
          }
          bordered={true}
          style={{ 
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
        >
          <Spin spinning={loading} tip="Carregando...">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message="Publicação de Resultados"
                description="Selecione os resultados que deseja publicar. Uma vez publicados, os resultados ficarão visíveis para todos os participantes do evento."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 16 }}
              />
              
              {allPlayers.length === 0 && !loading ? (
                <Empty 
                  description="Nenhum jogador disponível para este evento" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  name="publish_results"
                  style={{ width: '100%' }}
                >
                  <Row gutter={[24, 24]}>
                    {/* Coluna da esquerda - TOP 4 */}
                    <Col xs={24} md={12}>
                      <Card 
                        size="small" 
                        title={
                          <Space>
                            <TrophyOutlined style={{ color: '#faad14' }} />
                            <Text strong>TOP 4</Text>
                          </Space>
                        }
                        bordered={true}
                        extra={
                          <Switch 
                            checked={postTop4}
                            onChange={(checked) => setPostTop4(checked)}
                            checkedChildren="Ativo"
                            unCheckedChildren="Inativo"
                          />
                        }
                        style={{ height: '100%' }}
                        headStyle={{ backgroundColor: '#fff7e6', borderBottom: '1px solid #ffe7ba' }}
                      >
                        <Space direction="vertical" style={{ width: '100%', opacity: postTop4 ? 1 : 0.5 }}>
                          <Form.Item label="Primeiro Lugar" required={postTop4}>
                            <Select
                              showSearch
                              placeholder="Selecione o primeiro colocado"
                              disabled={!postTop4}
                              value={top1?.id}
                              onChange={(value) => setTop1(allPlayers.find(p => p.id === value) || null)}
                              filterOption={(input, option) =>
                                String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {allPlayers.map(player => (
                                <Option key={player.id} value={player.id}>
                                  {player.full_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          
                          <Form.Item label="Segundo Lugar" required={postTop4}>
                            <Select
                              showSearch
                              placeholder="Selecione o segundo colocado"
                              disabled={!postTop4}
                              value={top2?.id}
                              onChange={(value) => setTop2(allPlayers.find(p => p.id === value) || null)}
                              filterOption={(input, option) =>
                                String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {allPlayers.map(player => (
                                <Option key={player.id} value={player.id}>
                                  {player.full_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          
                          <Form.Item label="Terceiro Lugar" required={postTop4}>
                            <Select
                              showSearch
                              placeholder="Selecione o terceiro colocado"
                              disabled={!postTop4}
                              value={top3?.id}
                              onChange={(value) => setTop3(allPlayers.find(p => p.id === value) || null)}
                              filterOption={(input, option) =>
                                String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {allPlayers.map(player => (
                                <Option key={player.id} value={player.id}>
                                  {player.full_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          
                          <Form.Item label="Quarto Lugar" required={postTop4}>
                            <Select
                              showSearch
                              placeholder="Selecione o quarto colocado"
                              disabled={!postTop4}
                              value={top4?.id}
                              onChange={(value) => setTop4(allPlayers.find(p => p.id === value) || null)}
                              filterOption={(input, option) =>
                                String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {allPlayers.map(player => (
                                <Option key={player.id} value={player.id}>
                                  {player.full_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Space>
                      </Card>
                    </Col>
                    
                    {/* Coluna da direita - Paladino, Embaixador, Imortais */}
                    <Col xs={24} md={12}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {/* Seção Paladino */}
                        <Card 
                          size="small" 
                          title={
                            <Space>
                              <SafetyOutlined style={{ color: '#52c41a' }} />
                              <Text strong>Paladino</Text>
                            </Space>
                          }
                          bordered={true}
                          extra={
                            <Switch 
                              checked={postPaladin}
                              onChange={(checked) => setPostPaladin(checked)}
                              checkedChildren="Ativo"
                              unCheckedChildren="Inativo"
                            />
                          }
                          headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
                        >
                          <Form.Item style={{ margin: 0, opacity: postPaladin ? 1 : 0.5 }} required={postPaladin}>
                            <Select
                              showSearch
                              placeholder="Selecione o Paladino"
                              disabled={!postPaladin}
                              value={paladin?.id}
                              onChange={(value) => setPaladin(allPlayers.find(p => p.id === value) || null)}
                              filterOption={(input, option) =>
                                String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {allPlayers.map(player => (
                                <Option key={player.id} value={player.id}>
                                  {player.full_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Card>

                        {/* Seção Embaixador */}
                        <Card 
                          size="small" 
                          title={
                            <Space>
                              <FlagOutlined style={{ color: '#eb2f96' }} />
                              <Text strong>Embaixador</Text>
                            </Space>
                          }
                          bordered={true}
                          extra={
                            <Switch 
                              checked={postAmbassor}
                              onChange={(checked) => setPostAmbassor(checked)}
                              checkedChildren="Ativo"
                              unCheckedChildren="Inativo"
                            />
                          }
                          headStyle={{ backgroundColor: '#fff0f6', borderBottom: '1px solid #ffadd2' }}
                        >
                          <Form.Item style={{ margin: 0, opacity: postAmbassor ? 1 : 0.5 }} required={postAmbassor}>
                            <Select
                              showSearch
                              placeholder="Selecione o Embaixador"
                              disabled={!postAmbassor}
                              value={ambassor?.id}
                              onChange={(value) => setAmbassador(allPlayers.find(p => p.id === value) || null)}
                              filterOption={(input, option) =>
                                String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {allPlayers.map(player => (
                                <Option key={player.id} value={player.id}>
                                  {player.full_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Card>

                        {/* Seção Imortais */}
                        <Card 
                          size="small" 
                          title={
                            <Space>
                              <UserOutlined style={{ color: '#722ed1' }} />
                              <Text strong>Imortais</Text>
                            </Space>
                          }
                          bordered={true}
                          extra={
                            <Switch 
                              checked={postImortais}
                              onChange={(checked) => setPostImortais(checked)}
                              checkedChildren="Ativo"
                              unCheckedChildren="Inativo"
                            />
                          }
                          headStyle={{ backgroundColor: '#f9f0ff', borderBottom: '1px solid #efdbff' }}
                        >
                          <div style={{ padding: '8px 0' }}>
                            {postImortais ? (
                              <Alert
                                message="Publicação automática"
                                description="Serão selecionados os 3 jogadores com as maiores pontuações"
                                type="info"
                                showIcon
                              />
                            ) : (
                              <Paragraph type="secondary" style={{ margin: 0 }}>
                                Ative para publicar automaticamente os 3 jogadores com maior pontuação como Imortais.
                              </Paragraph>
                            )}
                          </div>
                        </Card>
                      </Space>
                    </Col>
                  </Row>
                  
                  <Divider />

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    <Checkbox 
                      checked={confirm} 
                      onChange={(e) => setConfirm(e.target.checked)}
                      disabled={!postTop4 && !postPaladin && !postAmbassor && !postImortais}
                    >
                      <Text strong>Confirmo que os dados estão corretos</Text>
                    </Checkbox>

                    <Button
                      type="primary"
                      size="large"
                      icon={<SaveOutlined />}
                      loading={loading}
                      disabled={!confirm || (!postTop4 && !postPaladin && !postAmbassor && !postImortais)}
                      onClick={handlePublish}
                    >
                      Publicar Resultados
                    </Button>
                  </div>
                </Form>
              )}
            </Space>
          </Spin>
        </Card>
      </div>
    </>
  );
}