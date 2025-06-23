import React from "react";
import Image from "next/image";
import adminl from "@/app/assets/admin_line.png";
import adminf from "@/app/assets/admin_fill.png";
import profilel from "@/app/assets/profile_line.png";
import profilef from "@/app/assets/profile_fill.png";
import sumulal from "@/app/assets/sumula_line.png";
import sumulaf from "@/app/assets/sumula_fill.png";
import resultl from "@/app/assets/result_line.png";
import resultf from "@/app/assets/result_fill.png";
import homel from "@/app/assets/home_line.png";
import homef from "@/app/assets/home_fill.png";
import calendarl from "@/app/assets/calendar_line.png";
import { useRouter, usePathname } from 'next/navigation';

type UserType = 'player' | 'staff' | 'manager' | 'admin' | 'common';

type NavItem = {
    figure: React.ReactNode
    href: string
}

const navItems: Record< UserType, NavItem[]> = {
    player: [
        { figure: <Image draggable="false" src={homel} alt="home" width={36} height={36}/>, href: '/home' },
        { figure: <Image draggable="false" src={resultl} alt="results" width={36} height={36}/>, href: '/results' },
        { figure: <Image draggable="false" src={profilel} alt="profile" width={36} height={36}/>, href: '/profile' },
    ],
    staff: [
        { figure: <Image draggable="false" src={homel} alt="home" width={36} height={36}/>, href: '/home' },
        { figure: <Image draggable="false" src={sumulal} alt="sumula" width={36} height={36}/>, href: '/sumula' },
        { figure: <Image draggable="false" src={resultl} alt="results" width={36} height={36}/>, href: '/results' },
    ],
    admin: [
        { figure: <Image draggable="false" src={homel} alt="home" width={36} height={36}/>, href: '/home' },
        { figure: <Image draggable="false" src={resultl} alt="results" width={36} height={36}/>, href: '/results' },
        { figure: <Image draggable="false" src={sumulal} alt="sumula" width={36} height={36}/>, href: '/sumula' },
        { figure: <Image draggable="false" src={adminl} alt="admin" width={36} height={36}/>, href: '/admin' },
    ],
    manager: [
        { figure: <Image draggable="false" src={homel} alt="home" width={36} height={36}/>, href: '/home' },
        { figure: <Image draggable="false" src={resultl} alt="results" width={36} height={36}/>, href: '/results' },
        { figure: <Image draggable="false" src={sumulal} alt="sumula" width={36} height={36}/>, href: '/sumula' },
        { figure: <Image draggable="false" src={adminl} alt="admin" width={36} height={36}/>, href: '/admin' },
    ],
    common: [
        { figure: <Image draggable="false" src={homel} alt="home" width={36} height={36}/>, href: '/home' },
        { figure: <Image draggable="false" src={calendarl} alt="contests" width={36} height={36}/>, href: '/contests' },
    ],
}


const EventNavBarComponent = ({userType = 'staff'} : {userType?: UserType}) => {
    const router = useRouter();
    const pathName = usePathname();
    const pathParts = pathName.split('/');
    const eventId = pathParts[1]; // Obtém o eventId da URL
    const currentPath = pathParts[2];
    
    const handleNavigation = (href: string) => {
        if (href === '/contests') {
            router.push(href);
        } else {
            // Se for uma rota dentro do evento, adiciona o eventId
            router.push(`/${eventId}${href}`);
        }
    };
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 md:mx-auto md:max-w-2xl md:rounded-t-3xl bg-secondary shadow-lg">
            <div className="flex justify-evenly items-center h-20 px-4">
                {navItems[userType].map((item, index) => {
                    // Verifica se o caminho atual corresponde ao item do menu
                    const isActive = '/' + currentPath === item.href;
                    // Escolhe a imagem preenchida se estiver ativo, caso contrário, usa a imagem de linha
                    let figureElement = item.figure;
                    
                    return (
                        <button 
                            key={index} 
                            onClick={() => handleNavigation(item.href)}
                            className={isActive ? "opacity-100" : "opacity-70"}
                        >
                            {figureElement}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default EventNavBarComponent;