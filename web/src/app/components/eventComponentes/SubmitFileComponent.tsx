import React, { useContext, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { usePathname } from "next/navigation";
import request from "@/app/utils/request";
import toast from "react-hot-toast";
import { formDataSettings } from "@/app/utils/formDataSettings";
import { isAxiosError } from "axios";
import { Upload, Button, Card, Typography, Space } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface SubmitFileComponentProps {
    isManager: boolean;
}

export default function SubmitFileComponent(props: SubmitFileComponentProps) {
    const [playerFile, setPlayerFile] = useState<File | null>(null);
    const [staffFile, setStaffFile] = useState<File | null>(null);
    const [playerLoading, setPlayerLoading] = useState<boolean>(false);
    const [staffLoading, setStaffLoading] = useState<boolean>(false);
    const currentId = usePathname().split("/")[1];
    const { user } = useContext(UserContext);

    const handlePlayerFileChange = (info: any) => {
        if (info.file) {
            setPlayerFile(info.file.originFileObj);
        }
    };

    const handleStaffFileChange = (info: any) => {
        if (info.file) {
            setStaffFile(info.file.originFileObj);
        }
    };

    const handlePlayerSubmit = async () => {
        if (playerFile) {
            setPlayerLoading(true);
            const formData = new FormData();
            formData.append("file", playerFile);
            try {
                const response = await request.post(`/api/upload-player/?event_id=${currentId}`, formData, formDataSettings(user.access));
                if (response.status === 201) {
                    if (typeof response.data === 'object' && response.data !== null && 'message' in response.data && 'errors' in response.data) {
                        toast.success(response.data.message);
                        toast.success(response.data.errors, { icon: "⚠️" });
                    } else {
                        toast.success(response.data);
                    }
                    setPlayerFile(null);
                }
            } catch (error: unknown) {
                if (isAxiosError(error)) {
                    const { data } = error.response || {};
                    const errorMessage = data?.errors || "Erro desconhecido.";
                    toast.error(errorMessage);
                } else {
                    toast.error("Ocorreu um erro ao enviar o arquivo.");
                }
                console.log(error);
            } finally {
                setPlayerLoading(false);
            }
        } else {
            toast.error("Selecione um arquivo para enviar!");
        }
    };

    const handleStaffSubmit = async () => {
        if (staffFile) {
            setStaffLoading(true);
            const formData = new FormData();
            formData.append("file", staffFile);
            try {
                const response = await request.post(`/api/upload-staff/?event_id=${currentId}`, formData, formDataSettings(user.access));
                if (response.status === 201) {
                    toast.success(response.data);
                    setStaffFile(null);
                }
            } catch (error: unknown) {
                if (isAxiosError(error)) {
                    const { data } = error.response || {};
                    const errorMessage = data?.errors || "Erro desconhecido.";
                    toast.error(errorMessage);
                } else {
                    toast.error("Ocorreu um erro ao enviar o arquivo.");
                }
                console.log(error);
            } finally {
                setStaffLoading(false);
            }
        } else {
            toast.error("Selecione um arquivo para enviar!");
        }
    };

    // Propriedades compartilhadas para os componentes Upload
    const uploadProps: UploadProps = {
        beforeUpload: () => false, // Impede o upload automático
        maxCount: 1, // Permite apenas um arquivo por vez
        accept: '.csv, .xlsx, .xls', // Tipos de arquivo aceitáveis
        showUploadList: true,
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: '20px' }}>
            <Card 
                title={<Text strong style={{ color: '#0088cc' }}>ADICIONAR JOGADORES</Text>}
                bordered={false} 
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Dragger 
                        {...uploadProps}
                        onChange={handlePlayerFileChange}
                        fileList={playerFile ? [{ uid: '1', name: playerFile.name, status: 'done' } as any] : []}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Clique ou arraste um arquivo para esta área</p>
                        <p className="ant-upload-hint">
                            Suporte para arquivos CSV e Excel
                        </p>
                    </Dragger>
                    
                    <Button 
                        type="primary"
                        icon={<UploadOutlined />}
                        loading={playerLoading}
                        onClick={handlePlayerSubmit}
                        style={{ width: '100%', marginTop: 16 }}
                    >
                        Enviar
                    </Button>
                </Space>
            </Card>

            {!props.isManager && (
                <Card 
                    title={<Text strong style={{ color: '#0088cc' }}>ADICIONAR STAFF</Text>}
                    bordered={false} 
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Dragger 
                            {...uploadProps}
                            onChange={handleStaffFileChange}
                            fileList={staffFile ? [{ uid: '1', name: staffFile.name, status: 'done' } as any] : []}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Clique ou arraste um arquivo para esta área</p>
                            <p className="ant-upload-hint">
                                Suporte para arquivos CSV e Excel
                            </p>
                        </Dragger>
                        
                        <Button 
                            type="primary"
                            icon={<UploadOutlined />}
                            loading={staffLoading}
                            onClick={handleStaffSubmit}
                            style={{ width: '100%', marginTop: 16 }}
                        >
                            Enviar
                        </Button>
                    </Space>
                </Card>
            )}
        </Space>
    );
}
