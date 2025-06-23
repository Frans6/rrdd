import React, { useState, useContext } from 'react';
import { Card, Typography, Input, Button, Form, Space } from 'antd';
import { PlusOutlined, LoginOutlined, TeamOutlined } from '@ant-design/icons';
import { UserContext } from "../contexts/UserContext";
import { Grid } from 'antd';

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

interface EventsComponentProps {
    title: string;
    description: string;
    optionalph?: string;
    placeholder: string;
    useEmail: boolean;
    type: string;
    function: (args: any) => any;
}

const EventsComponent = (props: EventsComponentProps) => {
    const { user } = useContext(UserContext);
    const [field, setField] = useState<string>("");
    const [token, setToken] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const getIcon = () => {
        switch (props.type) {
            case "create":
                return <PlusOutlined />;
            case "staff":
                return <TeamOutlined />;
            case "join":
            default:
                return <LoginOutlined />;
        }
    };

    const getButtonText = () => {
        switch (props.type) {
            case "create":
                return "Criar Evento";
            case "staff":
                return "Entrar como Staff";
            case "join":
            default:
                return "Participar do Evento";
        }
    };

    const handleSubmit = async () => {
        let params: any;
        switch (props.type) {
            case "create":
                params = {
                    access: user.access,
                    name: field,
                    token: token
                };
                break;
            case "join":
                params = {
                    access: user.access,
                    email: field,
                    token: token
                };
                break;
            case "staff":
                params = {
                    access: user.access,
                    token: token
                };
                break;
            default:
                return;
        }

        setLoading(true);
        try {
            await props.function(params);
            form.resetFields();
            setField("");
            setToken("");
        } catch (error) {
            console.error(`Error in ${props.type} operation:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={<Text strong style={{ color: '#1890ff', fontSize: 20 }}>{props.title.toUpperCase()}</Text>}
            headStyle={{ backgroundColor: "#e6f7ff", minHeight: 40 }}
            bordered={false}
            hoverable
            style={{ 
                width: '100%', 
                maxWidth: isMobile ? 400 : '100%', 
                marginBottom: 24,
                transition: 'transform 0.3s, box-shadow 0.3s',
            }}
            bodyStyle={{ 
                padding: 24,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <Form
                form={form}
                layout="horizontal"
                onFinish={handleSubmit}
                style={{ width: '100%' }}
            >
                <Paragraph style={{ fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                    {props.description}
                </Paragraph>

                {/* Container principal que mantém alinhamento */}
                <div style={{ 
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '50px',
                    alignItems: 'flex-start', // Alinha elementos ao topo
                    justifyContent: isMobile ? 'center' : 'flex-start', 
                    width: '100%',
                    marginBottom: '5px' // Pequena margem para as mensagens de erro
                }}>
                    {/* Container para o primeiro campo e sua mensagem de erro */}
                    {props.useEmail && (
                        <div style={{ 
                            width: isMobile ? '100%' : '40%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Form.Item
                                name="field"
                                rules={[{ 
                                    required: true, 
                                    message: props.type === "create" ? 'Por favor, insira o nome do evento' : 'Por favor, insira o e-mail', 
                                    type: props.type === "create" ? undefined : 'email'
                                }]}
                                style={{ 
                                    width: '100%',
                                    marginBottom: 0 // Remove margem padrão do Form.Item
                                }}
                            >
                                <Input 
                                    placeholder={props.optionalph} 
                                    size="large"
                                    onChange={e => setField(e.target.value)}
                                    value={field}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            {/* Remover esta div dedicada para mensagem de erro, pois o Form.Item já exibe o erro */}
                            {/* 
                            <div className="ant-form-item-explain-error" style={{ 
                                minHeight: '22px',
                                fontSize: '14px',
                                color: '#ff4d4f',
                                lineHeight: '1.6',
                                padding: '2px 0'
                            }}>
                                {form.getFieldError('field')?.[0]}
                            </div>
                            */}
                        </div>
                    )}

                    {/* Container para o segundo campo e sua mensagem de erro */}
                    <div style={{ 
                        width: isMobile ? '100%' : props.useEmail ? '35%' : '50%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Form.Item
                            name="token"
                            rules={[{ required: true, message: 'Por favor, insira o token' }]}
                            style={{ 
                                width: '100%',
                                marginBottom: 0 // Remove margem padrão do Form.Item
                            }}
                        >
                            <Input 
                                placeholder={props.placeholder} 
                                size="large"
                                onChange={e => setToken(e.target.value)}
                                value={token}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        {/* Remover também esta div dedicada para mensagem de erro */}
                        {/*
                        <div className="ant-form-item-explain-error" style={{ 
                            minHeight: '22px',
                            fontSize: '14px',
                            color: '#ff4d4f',
                            lineHeight: '1.6',
                            padding: '2px 0'
                        }}>
                            {form.getFieldError('token')?.[0]}
                        </div>
                        */}
                    </div>

                    {/* Container para o botão */}
                    <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        justifyContent: isMobile ? 'center' : 'flex-end',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        <Form.Item style={{ 
                            marginBottom: 0, 
                            width: isMobile ? '100%' : 'auto'
                        }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={getIcon()}
                                loading={loading}
                                size="large"
                                style={{ 
                                    width: isMobile ? '100%' : 'auto',
                                    minWidth: '180px'
                                }}
                            >
                                {getButtonText()}
                            </Button>
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Card>
    );
};

export default EventsComponent;