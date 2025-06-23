'use client'
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/app/contexts/UserContext";
import { usePathname } from "next/navigation";
import validatePath from "@/app/utils/validadePath";
import getBasePath from "@/app/utils/getBasePath";
import request from "@/app/utils/request";
import { settingsWithAuth } from "@/app/utils/settingsWithAuth";

// Ant Design imports
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Spin, 
  Modal, 
  Checkbox, 
  Space, 
  Divider,
  Badge, 
  message, 
  Tag,
  Progress,
  Grid
} from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  ArrowRightOutlined,
  TrophyOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface Points {
  pageNumber: number;
  player1Id: number;
  player2Id: number;
  points: number;
}

// Adicione esta função formatTime fora do componente para evitar problemas com hooks
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function SumulaId() {
  // Todos os hooks devem estar juntos no início do componente
  const { user, loading } = useContext(UserContext);
  const router = useRouter();
  const params = usePathname().split("/");
  const currentId = parseInt(params[1]);
  const currentPath = params[2];
  const screens = useBreakpoint(); // Adicione essa linha se não existir
  const isMobile = !screens.md; // Adicione essa linha para definir isMobile

  // Estados gerais
  const [currentSumula, setCurrentSumula] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [canSee, setCanSee] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rounds, setRounds] = useState<any>([]);
  const [playersScore, setPlayersScore] = useState<any>([]);
  const [sumulaPoints, setSumulaPoints] = useState<Points[]>([]);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [click3Disabled, setClick3Disabled] = useState<boolean>(false);
  const [click1Disabled, setClick1Disabled] = useState<boolean>(false);
  const [finishConfirm, setFinishConfirm] = useState<boolean>(false);
  const [duplaPontuacoes, setDuplaPontuacoes] = useState<{ [key: number]: number }>({});
  const [imortalPlayers, setImortalPlayers] = useState<any>([]);
  const [sumulaPointsAux, setSumulaPointsAux] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Estados do cronômetro
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 segundos = 1 minuto
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const [timerIntervalId, setTimerIntervalId] = useState<number | null>(null);

  // Cálculos derivados (não são estados)
  const roundProgress = Math.round(((currentPage + 1) / (rounds?.length || 1)) * 100);

  // Todos os useEffect devem estar juntos logo após os estados
  useEffect(() => {
    if (!user.access && !loading) {
      router.push("/");
    } else if (user.all_events) {
      const current = user.all_events.find(elem => elem.event?.id === currentId);
      if (current && current.role) {
        validatePath(current.role, currentPath) === true ?
          validateSumula() : router.push(`/${currentId}/${getBasePath(current.role)}`);
      } else {
        router.push("/contests");
      }
    }
  }, [user]);

  // Limpar o timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [timerIntervalId]);

  // Funções do componente
  async function validateSumula() {
    setIsLoading(true);
    const sumula = window.localStorage.getItem("current_sumula");
    if (sumula) {
      const auxSumula = JSON.parse(sumula);
      if (auxSumula.id === parseInt(params[3])) {
        setPlayersScore(auxSumula.players_score);
        setRounds(auxSumula.rounds);
        setCurrentSumula(auxSumula);
        setCanSee(true);
      } else {
        router.push(`/${currentId}/sumula`);
      }
    } else {
      router.push(`/${currentId}/sumula`);
    }
    setIsLoading(false);
  }

  // Capitaliza nomes que vêm em caixa alta do SIGAA
  const capitalize = (fullName: any) => {
    return fullName
      .split(' ')
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Funções do cronômetro
  const startTimer = () => {
    if (timerRunning || timerCompleted) return;
    
    setTimerRunning(true);
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          setTimerRunning(false);
          setTimerCompleted(true);
          message.success('Tempo concluído! Agora você pode atribuir a pontuação.');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimerIntervalId(intervalId as unknown as number);
  };

  const pauseTimer = () => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
      setTimerRunning(false);
    }
  };
  
  const resetTimer = () => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
    setTimeLeft(60);
    setTimerRunning(false);
    setTimerCompleted(false);
  };

  // Outras funções de manipulação
  const clearPagePoints = (pageNumber: number) => {
    setSumulaPoints(sumulaPoints.filter((point) => point.pageNumber !== pageNumber));
    setDuplaPontuacoes({});
    setClick1Disabled(false);
    setClick3Disabled(false);
    resetTimer(); // Reinicia o cronômetro ao limpar pontos
    message.success('Pontuação limpa com sucesso!');
  };

  const handleAddPoints = (pageIndex: number, points: number, pair: any, index: number) => {
    if (!timerCompleted) {
      message.warning('Aguarde o cronômetro terminar antes de atribuir pontuação!');
      return;
    }
    
    const player1 = pair.player1?.player;
    const player2 = pair.player2?.player;

    const newPoints: any = {
      pageNumber: pageIndex,
      points: points,
    };

    if (player1 && player2) {
      newPoints.player1Id = player1.id;
      newPoints.player2Id = player2.id;
    } else if (player1) {
      newPoints.player1Id = player1.id;
    } else if (player2) {
      newPoints.player2Id = player2.id;
    }

    setSumulaPoints([...sumulaPoints, newPoints]);

    setDuplaPontuacoes((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + points,
    }));

    points === 1 ? setClick1Disabled(true) : setClick3Disabled(true);
    message.success(`${points} pontos adicionados à Dupla ${index + 1}`);
  };

  const finishRound = () => {
    setCurrentPage(currentPage + 1);
    setIsFinishDialogOpen(false);
    setClick1Disabled(false);
    setClick3Disabled(false);
    setDuplaPontuacoes({});
    resetTimer(); // Reinicia o cronômetro para a próxima rodada
    message.success('Rodada finalizada com sucesso!');
  };

  const handleFinishSumula = async () => {
    try {
      setIsLoading(true);
      const updatedPlayersScore = playersScore.map((currentPlayer: any) => {
        const playerPoints = sumulaPoints.filter((point: Points) => 
          point.player1Id === currentPlayer.player.id || point.player2Id === currentPlayer.player.id);
        const points = playerPoints.reduce((acc, current) => acc + current.points, 0);
        return {
          ...currentPlayer,
          points: points,
        };
      });
      
      const ids = playersScore.map((currentPlayer: any) => ({
        id: currentPlayer.player.id
      }));
      
      const removed = ids.filter((item: any) => 
        !imortalPlayers.some((player: any) => player.id === item.id));
      
      const body = {
        "id": currentSumula.id,
        "name": currentSumula.name,
        "description": currentSumula.description,
        "referee": currentSumula.referee,
        "players_score": updatedPlayersScore,
        "imortal_players": removed,
      }
      
      const response = await request.put(
        `/api/sumula/${currentSumula.is_imortal ? "imortal" : "classificatoria"}/?event_id=${currentId}`, 
        body, 
        settingsWithAuth(user.access)
      );
      
      if (response.status === 200) {
        message.success('Súmula finalizada com sucesso!');
        router.push(`/${currentId}/sumula`);
      }
    } catch (error) {
      console.error(error);
      message.error('Erro ao finalizar a súmula');
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  const seeFinalScore = () => {
    const scores = playersScore.map((currentPlayer: any) => {
      const playerPoints = sumulaPoints.filter((point: Points) => 
        point.player1Id === currentPlayer.player.id || point.player2Id === currentPlayer.player.id);
      const points = playerPoints.reduce((acc, current) => acc + current.points, 0);
      return {
        ...currentPlayer,
        points: points,
      };
    });
    setSumulaPointsAux(scores);
    setIsDialogOpen(true);
  };

  const leaveSumula = () => {
    window.localStorage.removeItem("current_sumula");
    router.push(`/${currentId}/sumula`);
  };

  const handleIsImortalChange = (playerId: string, isChecked: boolean) => {
    setImortalPlayers((prev: any) => {
      if (isChecked) {
        return [...prev, { id: playerId }];
      } else {
        return prev.filter((player: any) => player.id !== playerId);
      }
    });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setImortalPlayers([]);
    setFinishConfirm(false);
  };

  // Renderização condicional de carregamento
  if (!canSee || loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Carregando súmula..." />
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Row gutter={[0, 24]}>
        {/* Header */}
        <Col span={24}>
          <Card bordered={false} className="shadow-sm">
            {/* Layout flexível que se ajusta para coluna em dispositivos móveis */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              width: '100%'
            }}>
              {/* Lado esquerdo: informações da rodada */}
              <div style={{ 
                flex: 1, 
                marginBottom: '20px' 
              }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {/* Primeira linha com botões e informações - ajustada para mobile */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <Button 
                      icon={<LeftOutlined />} 
                      onClick={() => setIsLeaveOpen(true)}
                    >
                      Voltar
                    </Button>
                    
                    <Divider type="vertical" />
                    
                    <Badge 
                      count={`Rodada ${currentPage + 1} de ${rounds.length}`} 
                      style={{ backgroundColor: '#1890ff' }} 
                    />
                    
                    <Tag color={currentSumula.is_imortal ? "gold" : "processing"} 
                        icon={currentSumula.is_imortal ? <TrophyOutlined /> : <HistoryOutlined />}>
                      {currentSumula.is_imortal ? "Súmula de Imortal" : "Súmula Classificatória"}
                    </Tag>
                  </div>
                  
                  {/* Barra de progresso sozinha em 100% da largura disponível */}
                  <Progress 
                    percent={roundProgress} 
                    status="active" 
                    strokeColor={{ from: '#108ee9', to: '#87d068' }}
                    style={{ margin: '8px 0' }}
                  />
                  
                  <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                    Rodada {currentPage + 1}
                  </Title>
                </Space>
              </div>
              
              {/* Lado direito: cronômetro - sem borda à esquerda no mobile */}
              <div style={{ 
                width: '100%',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Container do cronômetro com tempo centralizado */}
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: '10px'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '22px', color: '#1890ff', marginBottom: '5px' }} />
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold',
                    color: timerCompleted ? '#52c41a' : (timerRunning ? '#1890ff' : '#f5222d'),
                    textAlign: 'center'
                  }}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '10px', 
                  display: 'flex', 
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  {/* Botões do cronômetro em layout responsivo */}
                  <Space wrap align="center" style={{ justifyContent: 'center' }}>
                    {!timerRunning && !timerCompleted && (
                      <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />} 
                        size="middle"
                        onClick={startTimer}
                      >
                        Iniciar
                      </Button>
                    )}
                    
                    {timerRunning && (
                      <Button 
                        icon={<PauseCircleOutlined />} 
                        size="middle"
                        onClick={pauseTimer}
                      >
                        Pausar
                      </Button>
                    )}
                    
                    <Button 
                      danger 
                      icon={<DeleteOutlined />}
                      size="middle"
                      onClick={resetTimer}
                      disabled={timeLeft === 60 && !timerRunning && !timerCompleted}
                    >
                      Reiniciar
                    </Button>
                  </Space>
                </div>
                
                {!timerCompleted && (
                  <div style={{ marginTop: '8px', textAlign: 'center', width: '100%' }}>
                    <Tag color="warning" style={{ 
                      marginRight: 0, 
                      fontSize: '13px', 
                      padding: '2px 8px' 
                    }}>
                      {timerRunning ? 'Em andamento...' : 'Iniciar antes de pontuar'}
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
        
        {/* Cards das duplas */}
        {rounds[currentPage].map((pair: any, index: number) => (
          <Col xs={24} sm={12} key={index} style={{ padding: '0 8px' }}>
            <Card 
              title={`Dupla ${index + 1}`}
              headStyle={{ 
                backgroundColor: '#f0f2f5', 
                textAlign: 'center', 
                fontWeight: 'bold' 
              }}
              bordered={true}
              className="shadow-sm"
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 16 }}>
                    {pair.player1 ? capitalize(pair.player1.player.full_name) : "Sem jogador"}
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: 16 }}>
                    {pair.player2 ? capitalize(pair.player2.player.full_name) : "Sem jogador"}
                  </Text>
                </div>
                
                <Divider plain>Pontuação</Divider>
                
                <Badge 
                  count={duplaPontuacoes[index] || 0} 
                  overflowCount={999} 
                  showZero 
                  style={{ 
                    backgroundColor: duplaPontuacoes[index] ? '#52c41a' : '#d9d9d9',
                    fontSize: '16px',
                    padding: '0 10px'
                  }} 
                />
                
                <Space size="middle">
                  <Button 
                    type="primary" 
                    size="large"
                    disabled={!timerCompleted || duplaPontuacoes[index] !== undefined || click1Disabled} 
                    onClick={() => handleAddPoints(currentPage, 1, pair, index)}
                  >
                    +1
                  </Button>
                  
                  <Button 
                    type="primary" 
                    size="large"
                    disabled={!timerCompleted || duplaPontuacoes[index] !== undefined || click3Disabled} 
                    onClick={() => handleAddPoints(currentPage, 3, pair, index)}
                  >
                    +3
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
        
        {/* Footer Actions */}
        <Col span={24}>
          <Card bordered={false} className="shadow-sm">
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              gap: isMobile ? '12px' : '16px',
              width: '100%'
            }}>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => clearPagePoints(currentPage)}
                style={{ 
                  maxWidth: isMobile ? '100%' : 'auto',
                  fontSize: isMobile ? '14px' : '16px',
                  height: isMobile ? '34px' : '40px'
                }}
              >
                Limpar
                {!isMobile && " pontuação"}
              </Button>
              
              {currentPage !== rounds.length - 1 ? (
                <Button 
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={() => setIsFinishDialogOpen(true)}
                  style={{ 
                    maxWidth: isMobile ? '100%' : 'auto',
                    fontSize: isMobile ? '14px' : '16px',
                    height: isMobile ? '34px' : '40px'
                  }}
                >
                  {isMobile ? "Próxima" : "Finalizar Rodada"}
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={seeFinalScore}
                  style={{ 
                    maxWidth: isMobile ? '100%' : 'auto',
                    fontSize: isMobile ? '14px' : '16px',
                    height: isMobile ? '34px' : '40px'
                  }}
                >
                  Finalizar Súmula
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modais */}
      <Modal
        title="Sair da súmula"
        open={isLeaveOpen}
        onCancel={() => setIsLeaveOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLeaveOpen(false)}>
            Cancelar
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={leaveSumula}
          >
            Confirmar
          </Button>,
        ]}
      >
        <p>Tem certeza que deseja sair da súmula? Nenhuma alteração será salva.</p>
      </Modal>

      <Modal
        title="Finalizar Rodada"
        open={isFinishDialogOpen}
        onCancel={() => setIsFinishDialogOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsFinishDialogOpen(false)}>
            Cancelar
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={finishRound}
          >
            Confirmar
          </Button>,
        ]}
      >
        <p>Tem certeza que deseja avançar para a próxima rodada? Esta ação não pode ser desfeita.</p>
      </Modal>

      <Modal
        title="Finalizar Súmula"
        open={isDialogOpen}
        onCancel={closeDialog}
        width={800}
        footer={[
          <Button key="cancel" onClick={closeDialog}>
            Cancelar
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            disabled={!finishConfirm}
            onClick={handleFinishSumula}
            loading={isLoading}
          >
            Confirmar
          </Button>,
        ]}
      >
        <p>
          Confira as pontuações
          {!currentSumula.is_imortal && ", selecione os participantes que se classificaram"} 
          e finalize a súmula. Esta ação não pode ser desfeita.
        </p>
        
        <Divider />
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
          {sumulaPointsAux
            .sort((a: any, b: any) => b.points - a.points)
            .map((player: any, index: number) => (
              <Row 
                key={index} 
                align="middle" 
                style={{ 
                  padding: '8px 0',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}
              >
                <Col span={2}>
                  {index < 3 && (
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: ['gold', 'silver', '#cd7f32'][index],
                      color: index === 0 ? 'black' : 'white',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                  )}
                </Col>
                <Col span={1}>
                  {!currentSumula.is_imortal && (
                    <Checkbox onChange={(e) => handleIsImortalChange(player.player.id, e.target.checked)} />
                  )}
                </Col>
                <Col span={18}>
                  <Text style={{ fontSize: '15px' }}>
                    {capitalize(player.player.full_name)}
                  </Text>
                </Col>
                <Col span={3}>
                  <Tag color="blue" style={{ fontSize: '14px', marginRight: 0 }}>
                    {player.points} pts
                  </Tag>
                </Col>
              </Row>
            ))}
        </div>
        
        <Divider />
        
        <Checkbox 
          checked={finishConfirm}
          onChange={(e) => setFinishConfirm(e.target.checked)}
        >
          Confirmo que as pontuações estão corretas
        </Checkbox>
      </Modal>
    </div>
  );
};