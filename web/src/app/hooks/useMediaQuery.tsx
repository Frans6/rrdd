import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Inicializa com false para evitar problemas de hidratação no SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Verificação de ambiente de navegador
    if (typeof window === 'undefined') {
      return;
    }
    
    // Função para checar a media query e atualizar o estado
    const handleResize = () => {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);
    };
    
    // Verificação inicial
    handleResize();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    
    // Cleanup: remover listener ao desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [query]);

  return matches;
}