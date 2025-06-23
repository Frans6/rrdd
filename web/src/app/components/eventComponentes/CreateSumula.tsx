import React, { useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Typography, 
  Input, 
  Select, 
  List, 
  Switch, 
  Avatar, 
  Space, 
  Tag,
  Empty,
  Divider,
  Card,
  Button,
  Row,
  Col,
  Pagination
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SearchOutlined,
  TrophyOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { UserContext } from "@/app/contexts/UserContext";
import getAllPlayers from "@/app/utils/api/getAllPlayers";
import getStaffList from "@/app/utils/api/getStaffList";
import createQualifierSum from "@/app/utils/api/createQualifierSum";
import createImortalSum from "@/app/utils/api/createImortalSum";
import capitalize from "@/app/utils/capitalize";

const { Title, Text } = Typography;
const { Option } = Select;

interface player {
  id: number;
  full_name: string;
}

interface CreateSumulaProps {
  buttonName: string;
  isImortal: boolean;
}

export default function CreateSumula(props: CreateSumulaProps) {
  const currentId = usePathname().split("/")[1];
  const { user } = useContext(UserContext);
  const [playerName, setPlayerName] = useState<string>("");
  const [staffName, setStaffName] = useState<string>("");
  const [sumName, setSumName] = useState<string>("");
  const [isImortal, setIsImortal] = useState<boolean>(false);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [players, setPlayers] = useState<player[]>([]);
  const [classfiedPlayers, setClassfiedPlayers] = useState<player[]>([]);

  const [currentStaffs, setCurrentStaffs] = useState<any[]>([]);
  const [currentPlayers, setCurrentPlayers] = useState<player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Novos estados para paginação e busca
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [searchResults, setSearchResults] = useState<player[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);

  const clearData = () => {
    setSumName("");
    setPlayerName("");
    setStaffName("");
    setCurrentPlayers([]);
    setCurrentStaffs([]);
  }

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const playersList = await getAllPlayers(currentId, user.access);
        const classfiedPlayers = playersList.filter((player: any) => player.is_imortal === false);
        setPlayers(playersList);
        setClassfiedPlayers(classfiedPlayers);
      } catch (error) {
        console.log("Erro ao processar a requisição:", error);
      } finally {
        setLoading(false);
      }
    }
    
    const fetchStaffList = async () => {
      try {
        setLoading(true);
        const staffList = await getStaffList(currentId, user.access);
        setStaffs(staffList);
      } catch (error) {
        console.error("Erro ao processar a requisição:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayers();
    fetchStaffList();
  }, []);

  // Atualiza os resultados da busca quando o termo de pesquisa ou a página mudam
  useEffect(() => {
    const filtered = (isImortal || props.isImortal ? players : classfiedPlayers)
      .filter(item => item?.full_name?.toLowerCase().includes(playerName?.toLowerCase()));
    
    setSearchResults(filtered);
    setTotalPlayers(filtered.length);
    setCurrentPage(1); // Reset para primeira página quando mudar a busca
  }, [playerName, players, classfiedPlayers, isImortal, props.isImortal]);

  // Calcula quais jogadores mostrar na página atual
  const paginatedPlayers = searchResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClickRemovePlayer = (playerToRemove: player) => {
    setCurrentPlayers((prevPlayers) =>
      prevPlayers.filter((player) => player.id !== playerToRemove.id)
    );
  };

  const handleClickAddPlayer = (playerToAdd: player) => {
    setCurrentPlayers((prevPlayers) => [...prevPlayers.filter((player) => player.id !== playerToAdd.id), playerToAdd]);
  }

  const handleClickAddStaff = (staffToAdd: any) => {
    setCurrentStaffs((prevStaffs) =>
      [...prevStaffs.filter((staff) => staff.id !== staffToAdd.id), staffToAdd]
    );
  }

  const handleClickRemoveStaff = (staffToRemove: any) => {
    setCurrentStaffs((prevStaffs) =>
      prevStaffs.filter((staff) => staff.id !== staffToRemove.id)
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (props.isImortal) {
        await createImortalSum(sumName, currentId, currentPlayers, currentStaffs, user.access);
      } else {
        await createQualifierSum(sumName, currentId, currentPlayers, currentStaffs, user.access);
      }
      clearData();
    } catch (error) {
      console.error("Erro ao criar súmula:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para mudança de página
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  return (
    <div className="create-sumula-container">
      <Card
        title={
          <Space align="center">
            {props.isImortal ? 
              <TrophyOutlined style={{ color: '#faad14', fontSize: 20 }} /> : 
              <FileTextOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            }
            <Title level={4} style={{ margin: 0 }}>
              {props.isImortal ? "Criar Súmula de Imortais" : "Criar Súmula Classificatória"}
            </Title>
          </Space>
        }
        bordered={true}
        style={{ 
          marginBottom: 24, 
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Seção de configuração da súmula */}
          {!props.isImortal && (
            <Card 
              size="small" 
              title="Configurações da Súmula"
              bordered={true}
              style={{ marginBottom: 16 }}
              headStyle={{ backgroundColor: '#f5f5f5' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>Nome da súmula</Text>
                  <Input 
                    placeholder="Digite um nome para a súmula" 
                    value={sumName}
                    onChange={e => setSumName(e.target.value)}
                    prefix={<FileTextOutlined />}
                    allowClear
                    size="large"
                  />
                </Space>

                <div>
                  <Text>Utilizar suplentes</Text>
                  <Switch 
                    checked={isImortal} 
                    onChange={(checked) => setIsImortal(checked)}
                    style={{ marginLeft: 8 }}
                  />
                </div>
              </Space>
            </Card>
          )}

          <Row gutter={16} style={{ marginBottom: 16 }}>
            {/* Coluna da esquerda - Staffs */}
            <Col xs={24} md={12}>
              {/* Seção de staffs */}
              <Card 
                size="small" 
                title={
                  <Space>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <span>Adicionar Staffs</span>
                  </Space>
                }
                bordered={true}
                style={{ height: '100%' }}
                headStyle={{ backgroundColor: '#f0f7ff', borderBottom: '1px solid #d6e8ff' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Input 
                    placeholder="Pesquisar staffs" 
                    value={staffName}
                    onChange={e => setStaffName(e.target.value)}
                    prefix={<SearchOutlined />}
                    allowClear
                    style={{ marginBottom: 8 }}
                  />
                  
                  {/* Lista de staffs para adicionar */}
                  <Card 
                    size="small" 
                    title="Staffs disponíveis" 
                    style={{ marginBottom: 16 }}
                    headStyle={{ padding: '0 12px', backgroundColor: '#fafafa' }}
                    bodyStyle={{ padding: 0, maxHeight: '300px', overflowY: 'auto' }}
                  >
                    <List
                      dataSource={staffs.filter(item => item?.full_name?.toLowerCase().includes(staffName?.toLocaleLowerCase())).slice(0, 4)}
                      renderItem={staff => (
                        <List.Item
                          key={staff.id}
                          actions={[
                            <Button 
                              key="add" 
                              type="primary" 
                              shape="circle" 
                              icon={<PlusOutlined />} 
                              onClick={() => handleClickAddStaff(staff)} 
                              size="small"
                            />
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<TeamOutlined />} />}
                            title={capitalize(staff.full_name)}
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: <Empty description="Nenhum staff encontrado" /> }}
                    />
                  </Card>
                  
                  {/* Lista de staffs selecionados */}
                  <Card 
                    size="small" 
                    title={
                      <Space>
                        <span>Staffs selecionados</span>
                        <Tag color="blue">{currentStaffs.length}</Tag>
                      </Space>
                    }
                    headStyle={{ padding: '0 12px', backgroundColor: '#fafafa' }}
                    bodyStyle={{ padding: 0, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    <List
                      dataSource={currentStaffs}
                      renderItem={staff => (
                        <List.Item
                          key={staff.id}
                          actions={[
                            <Button 
                              key="remove" 
                              danger 
                              shape="circle" 
                              icon={<MinusOutlined />} 
                              onClick={() => handleClickRemoveStaff(staff)}
                              size="small" 
                            />
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                            title={capitalize(staff.full_name)}
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: <Empty description="Nenhum staff selecionado" /> }}
                    />
                  </Card>
                </Space>
              </Card>
            </Col>
            
            {/* Coluna da direita - Jogadores */}
            <Col xs={24} md={12}>
              {/* Seção de jogadores */}
              <Card 
                size="small" 
                title={
                  <Space>
                    <UserOutlined style={{ color: '#52c41a' }} />
                    <span>Adicionar Jogadores</span>
                  </Space>
                }
                bordered={true}
                style={{ height: '100%' }}
                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Input 
                    placeholder="Pesquisar jogadores" 
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    prefix={<SearchOutlined />}
                    allowClear
                    style={{ marginBottom: 8 }}
                  />
                  
                  {/* Lista de jogadores para adicionar */}
                  <Card 
                    size="small" 
                    title="Jogadores disponíveis" 
                    style={{ marginBottom: 16 }}
                    headStyle={{ padding: '0 12px', backgroundColor: '#fafafa' }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <List
                        dataSource={paginatedPlayers}
                        renderItem={player => (
                          <List.Item
                            key={player.id}
                            actions={[
                              <Button 
                                key="add" 
                                type="primary" 
                                shape="circle" 
                                icon={<PlusOutlined />} 
                                onClick={() => handleClickAddPlayer(player)} 
                                size="small"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                              />
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                              title={capitalize(player.full_name)}
                            />
                          </List.Item>
                        )}
                        locale={{ 
                          emptyText: 
                            <Empty 
                              description={
                                playerName ? 
                                  "Nenhum jogador encontrado com esse nome" : 
                                  "Nenhum jogador disponível"
                              } 
                            /> 
                        }}
                      />
                    </div>
                    
                    {/* Navegação fixa abaixo da lista */}
                    <div style={{ 
                      padding: '12px 0', 
                      background: '#f8f8f8', 
                      borderTop: '1px solid #f0f0f0',
                      borderRadius: '0 0 4px 4px',
                      position: 'sticky',
                      bottom: 0
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 16px'
                      }}>
                        {/* Tag com número de jogadores encontrados */}
                        <Tag color="#108ee9" style={{ 
                          fontSize: '12px', 
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontWeight: '500'
                        }}>
                          {totalPlayers} {totalPlayers === 1 ? 'jogador' : 'jogadores'}
                        </Tag>
                        
                        {/* Navegação simplificada */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          background: '#fff',
                          borderRadius: '20px',
                          padding: '4px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                        }}>
                          <Button 
                            type="text"
                            icon={<LeftOutlined />} 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            style={{ 
                              borderRadius: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            size="small"
                          />
                          
                          <div style={{ 
                            padding: '0 12px',
                            fontWeight: '500',
                            color: '#1890ff',
                            fontSize: '14px'
                          }}>
                            {currentPage} / {Math.ceil(totalPlayers / pageSize)}
                          </div>
                          
                          <Button 
                            type="text"
                            icon={<RightOutlined />} 
                            disabled={currentPage === Math.ceil(totalPlayers / pageSize)}
                            onClick={() => handlePageChange(currentPage + 1)}
                            style={{ 
                              borderRadius: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            size="small"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Lista de jogadores selecionados */}
                  <Card 
                    size="small" 
                    title={
                      <Space>
                        <span>Jogadores selecionados</span>
                        <Tag color="success">{currentPlayers.length}</Tag>
                      </Space>
                    }
                    headStyle={{ padding: '0 12px', backgroundColor: '#fafafa' }}
                    bodyStyle={{ padding: 0, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    <List
                      dataSource={currentPlayers}
                      renderItem={player => (
                        <List.Item
                          key={player.id}
                          actions={[
                            <Button 
                              key="remove" 
                              danger 
                              shape="circle" 
                              icon={<MinusOutlined />} 
                              onClick={() => handleClickRemovePlayer(player)}
                              size="small" 
                            />
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                            title={capitalize(player.full_name)}
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: <Empty description="Nenhum jogador selecionado" /> }}
                    />
                  </Card>
                </Space>
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <Button 
            type="primary"
            size="large"
            icon={props.isImortal ? <TrophyOutlined /> : <FileTextOutlined />}
            onClick={handleSubmit}
            loading={loading}
            block
          >
            Criar Súmula
          </Button>
        </Space>
      </Card>
    </div>
  );
}