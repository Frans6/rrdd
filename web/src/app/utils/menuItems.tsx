'use client'
import React from 'react';
import { 
    HomeOutlined,
    PlusOutlined,
    CalendarOutlined,
    TeamOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    LoginOutlined,
    HistoryOutlined
} from '@ant-design/icons';

export const initialPageMenu = [
    {
        key: 'home',
        icon: <HomeOutlined />,
        label: 'Página Inicial',
    },
    {
        key: 'my-events',
        icon: <CalendarOutlined />,
        label: 'Meus Eventos',
        children: [
            {
                key: 'new-event',
                icon: <PlusOutlined />,
                label: 'Novo Evento',
            },
            {
                key: 'join-event',
                icon: <LoginOutlined />,
                label: 'Participar de Evento',
            },
            {
                key: 'active-events',
                icon: <PlayCircleOutlined />,
                label: 'Eventos Ativos',
            },
            {
                key: 'past-events',
                icon: <HistoryOutlined />,
                label: 'Eventos Passados',
            }
        ]
    },
    {
        key: 'staff',
        icon: <TeamOutlined />,
        label: 'Staff',
    }
];