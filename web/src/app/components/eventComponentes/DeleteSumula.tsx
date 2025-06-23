import React, { useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserContext } from "@/app/contexts/UserContext";
import {
  Typography,
  Card,
  Space,
  Button,
  List,
  Popconfirm,
  Empty,
  Spin,
  Alert,
  message,
  Divider,
  Tag,
  Grid
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import toast from "react-hot-toast";
import request from "@/app/utils/request";
import { settingsWithAuth } from "@/app/utils/settingsWithAuth";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

interface Sumula {
  id: number;
  name: string;
  active: boolean;
  type: string;
}

export default function DeleteSumula() {
  const { user } = useContext(UserContext);
  const [closedSumulas, setClosedSumulas] = useState<Sumula[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageApi, contextHolder] = message.useMessage();
  const eventId = usePathname().split("/")[1];
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getClosedSumulas = async () => {
    setLoading(true);
    try {
      const response = await request.get(
        `/api/sumula/?event_id=${eventId}`, 
        settingsWithAuth(user.access)
      );
      
      if (response.status === 200) {
        const closedSumulasClass = response.data.sumulas_classificatoria
          .filter((sumula: Sumula) => sumula.active === false)
          .map((sumula: Sumula) => ({ ...sumula, type: 'Classificatória' }));
          
        const closedSumulasImortal = response.data.sumulas_imortal
          .filter((sumula: Sumula) => sumula.active === false)
          .map((sumula: Sumula) => ({ ...sumula, type: 'Imortal' }));
          
        const allClosedSumulas = [...closedSumulasClass, ...closedSumulasImortal]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
        setClosedSumulas(allClosedSumulas);
      } else {
        messageApi.error("Erro ao carregar súmulas");
        console.error("Erro ao fazer a requisição:", response);
      }
    } catch (error) {
      messageApi.error("Erro ao carregar súmulas");
      console.error("Erro ao fazer a requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const body = { id };
      const response = await request.delete(
        `/api/sumula/?event_id=${eventId}`, 
        {
          data: body,
          ...settingsWithAuth(user.access)
        }
      );
      
      if (response.status === 200) {
        setClosedSumulas(closedSumulas.filter((sumula) => sumula.id !== id));
        toast.success("Súmula deletada com sucesso.");
        messageApi.success("Súmula deletada com sucesso.");
      } else {
        toast.error("Erro ao deletar a súmula.");
        messageApi.error("Erro ao deletar a súmula.");
        console.error("Erro ao fazer a requisição:", response);
      }
    } catch (error) {
      toast.error("Erro ao deletar a súmula.");
      messageApi.error("Erro ao deletar a súmula.");
      console.error("Erro ao fazer a requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClosedSumulas();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {contextHolder}
      <div className="delete-sumula-container">
        <Card
          title={
            <Space align="center">
              <DeleteOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
              <Title level={4} style={{ margin: 0 }}>Excluir Súmulas</Title>
            </Space>
          }
          extra={
            <Button 
              type="primary"
              icon={<InfoCircleOutlined />}
              onClick={getClosedSumulas}
              loading={loading}
            >
              Atualizar
            </Button>
          }
          bordered={true}
          style={{ 
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Gerenciamento de Súmulas"
              description="Esta página exibe todas as súmulas fechadas do evento. Súmulas fechadas podem ser excluídas permanentemente."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
            
            <Spin spinning={loading}>
              {closedSumulas.length === 0 ? (
                <Empty 
                  description="Nenhuma súmula fechada encontrada" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={closedSumulas}
                  bordered
                  style={{ 
                    background: '#fff', 
                    borderRadius: 4 
                  }}
                  renderItem={(sumula) => (
                    <List.Item
                      key={sumula.id}
                      actions={[
                        <Popconfirm
                          key="delete"
                          title="Excluir Súmula"
                          description={`Tem certeza que deseja excluir a súmula "${sumula.name}"?`}
                          okText="Sim, excluir"
                          cancelText="Cancelar"
                          okButtonProps={{ danger: true }}
                          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                          onConfirm={() => handleDelete(sumula.id)}
                        >
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                          >
                            {!isMobile && "Excluir"}
                          </Button>
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{ 
                            width: 40, 
                            height: 40, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: '50%',
                            background: '#f0f0f0'
                          }}>
                            <FileOutlined style={{ fontSize: 18, color: '#595959' }} />
                          </div>
                        }
                        title={
                          isMobile ? (
                            // Layout para Mobile: título e tag em uma coluna
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <Text 
                                strong 
                                ellipsis={{ tooltip: sumula.name.toUpperCase() }}
                              >
                                {sumula.name.toUpperCase()}
                              </Text>
                              <Tag color={sumula.type === 'Classificatória' ? 'blue' : 'purple'}>
                                {sumula.type}
                              </Tag>
                            </div>
                          ) : (
                            // Layout existente para Desktop
                            <Space>
                              <Text strong>{sumula.name.toUpperCase()}</Text>
                              <Tag color={sumula.type === 'Classificatória' ? 'blue' : 'purple'}>
                                {sumula.type}
                              </Tag>
                            </Space>
                          )
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
              
              {closedSumulas.length > 0 && (
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <Text type="secondary">
                    Total: {closedSumulas.length} {closedSumulas.length === 1 ? 'súmula' : 'súmulas'}
                  </Text>
                </div>
              )}
            </Spin>
          </Space>
        </Card>
      </div>
    </>
  );
}
