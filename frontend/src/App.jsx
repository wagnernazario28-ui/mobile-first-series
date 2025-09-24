// frontend/src/App.jsx

import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import SeriesSelectorScreen from './components/SeriesSelectorScreen';
import HomeScreen from './components/HomeScreen';
import LoadingOverlay from './components/LoadingOverlay'; // 1. IMPORTAMOS O NOVO COMPONENTE
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedIds, setSelectedIds] = useState([]);
  // 2. ADICIONAMOS O NOVO ESTADO PARA CONTROLAR O OVERLAY DE CARREGAMENTO
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const handleStart = () => {
    setCurrentScreen('selection');
  };

  // 3. ATUALIZAMOS A FUNÇÃO PARA ATIVAR O CARREGAMENTO
  const handleSelectionComplete = (ids) => {
    setSelectedIds(ids);
    setCurrentScreen('home');
    setIsInitialLoading(true); // Ativa a tela de loading
  };

  // 4. CRIAMOS A FUNÇÃO QUE SERÁ CHAMADA PELA HOMESCREEN QUANDO ELA TERMINAR
  const handleInitialLoadComplete = () => {
    setIsInitialLoading(false); // Desativa a tela de loading
  };

  const handleRefineTaste = () => {
    setCurrentScreen('selection');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'selection':
        return <SeriesSelectorScreen onSelectionComplete={handleSelectionComplete} />;
      case 'home':
        // 5. PASSAMOS A NOVA FUNÇÃO COMO PROP PARA A HOMESCREEN
        return (
          <HomeScreen
            selectedIds={selectedIds}
            onRefine={handleRefineTaste}
            onInitialLoadComplete={handleInitialLoadComplete}
          />
        );
      case 'welcome':
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="mobile-frame">
      <main className="w-[390px] h-[844px] rounded-[30px] shadow-2xl overflow-hidden mobile-screen">
        {renderCurrentScreen()}

        {/* 6. RENDERIZAMOS O OVERLAY CONDICIONALMENTE */}
        {/* Ele só aparecerá se 'isInitialLoading' for verdadeiro */}
        {isInitialLoading && (
          <LoadingOverlay message="Aguarde, estamos preparando tudo para você..." />
        )}
      </main>
    </div>
  );
}

export default App;