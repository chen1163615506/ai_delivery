import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Space } from '../types';

interface SpaceContextType {
  currentSpace: Space | null;
  setCurrentSpace: (space: Space) => void;
  allSpaces: Space[];
  setAllSpaces: (spaces: Space[]) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSpace, setCurrentSpaceState] = useState<Space | null>(null);
  const [allSpaces, setAllSpaces] = useState<Space[]>([]);

  // 从localStorage加载当前空间
  useEffect(() => {
    const savedSpaceId = localStorage.getItem('currentSpaceId');
    if (savedSpaceId && allSpaces.length > 0) {
      const space = allSpaces.find(s => s.id === savedSpaceId);
      if (space) {
        setCurrentSpaceState(space);
      } else {
        // 如果保存的空间不存在，使用第一个空间（个人空间）
        setCurrentSpaceState(allSpaces[0]);
      }
    } else if (allSpaces.length > 0 && !currentSpace) {
      // 默认选择第一个空间（个人空间）
      setCurrentSpaceState(allSpaces[0]);
    }
  }, [allSpaces]);

  const setCurrentSpace = (space: Space) => {
    setCurrentSpaceState(space);
    localStorage.setItem('currentSpaceId', space.id);
  };

  return (
    <SpaceContext.Provider
      value={{
        currentSpace,
        setCurrentSpace,
        allSpaces,
        setAllSpaces,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
};
