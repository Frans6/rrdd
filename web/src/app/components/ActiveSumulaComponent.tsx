import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "@/app/contexts/UserContext";
import { usePathname } from "next/navigation";
import request from "@/app/utils/request";
import { settingsWithAuth } from "../utils/settingsWithAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, List, Button, Typography, Empty, Spin, Tag, Badge, Space } from 'antd';
import { 
  RightOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  TrophyOutlined, 
  HistoryOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ActiveSumulaComponent = () => {
    const [sumulas, setSumulas] = useState<any[]>([]);
    const [canSee, setCanSee] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useContext(UserContext);
    const eventId = usePathname().split("/")[1];
    const router = useRouter();

    const fetchSumulas = async () => {
        try {
            setLoading(true);
            const response = await request.get(`/api/sumula/ativas/?event_id=${eventId}`, settingsWithAuth(user.access));
        
            if (response.status === 200) {
                const classificatoria = response.data.sumulas_classificatoria.map((sumula: any) => ({
                    ...sumula,
                    is_imortal: false
                }));
                const imortal = response.data.sumulas_imortal.map((sumula: any) => ({
                    ...sumula,
                    is_imortal: true
                }));
                setSumulas([...classificatoria, ...imortal]);
            }
        } catch (error) {
            console.error("Erro ao buscar súmulas:", error);
            toast.error("Não foi possível carregar as súmulas");
        } finally {
            setLoading(false);
            setCanSee(true);
        }
    }

    useEffect(() => {
        fetchSumulas();
    }, []);

    async function handleClick(id: number) {
        const current = sumulas[id];
        window.localStorage.removeItem("current_sumula");
        try {
            const body = {
                sumula_id: current.id,
                is_imortal: current.is_imortal
            };
            const response = await request.put(
                `/api/sumula/add-referee/?event_id=${eventId}`,
                body,
                settingsWithAuth(user.access)
            );
    
            if (response.status === 200) {
                window.localStorage.setItem("current_sumula", JSON.stringify(current));
                router.push(`/${eventId}/sumula/${current.id}`);
            }
        } catch (error: unknown) {
            console.error("Erro ao fazer a requisição:", error);
            toast.error("Permissão negada");
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
                <Spin size="large" tip="Carregando súmulas..." />
            </div>
        );
    }

    return (
        <Card 
            title={
                <Title level={4} style={{ margin: 0 }}>
                    <Space>
                        <FileTextOutlined />
                        SÚMULAS ATIVAS
                    </Space>
                </Title>
            }
            bordered={false}
            className="shadow-sm"
            style={{ borderRadius: '8px' }}
        >
            {sumulas.length === 0 ? (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Nenhuma súmula ativa encontrada" 
                />
            ) : (
                <List
                    dataSource={sumulas}
                    renderItem={(sumula, index) => (
                        <List.Item key={sumula.id}>
                            <Card 
                                hoverable 
                                style={{ width: '100%', borderRadius: '6px' }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: window.innerWidth < 576 ? 'column' : 'row',
                                    justifyContent: 'space-between', 
                                    alignItems: window.innerWidth < 576 ? 'flex-start' : 'center',
                                    gap: window.innerWidth < 576 ? '12px' : '0'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        overflow: 'hidden'
                                    }}>
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <Badge 
                                                    dot 
                                                    status="success" 
                                                    title="Súmula ativa"
                                                    style={{ marginRight: 8 }}
                                                />
                                                <Text 
                                                    strong 
                                                    style={{ 
                                                        fontSize: '16px',
                                                        display: 'inline-block',
                                                        whiteSpace: 'normal',
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {sumula.name}
                                                </Text>
                                            </div>
                                            <div>
                                                {sumula.is_imortal ? (
                                                    <Tag color="gold" icon={<TrophyOutlined />}>
                                                        Imortal
                                                    </Tag>
                                                ) : (
                                                    <Tag color="processing" icon={<HistoryOutlined />}>
                                                        Classificatória
                                                    </Tag>
                                                )}
                                            </div>
                                        </Space>
                                    </div>
                                    <Button 
                                        type="primary"
                                        icon={<RightOutlined />}
                                        onClick={() => handleClick(index)}
                                        style={{ 
                                            width: window.innerWidth < 576 ? '100%' : 'auto'
                                        }}
                                    >
                                        Acessar
                                    </Button>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );
};

export default ActiveSumulaComponent;