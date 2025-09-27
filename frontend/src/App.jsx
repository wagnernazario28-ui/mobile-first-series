// frontend/src/App.jsx

// 1. IMPORTAMOS O 'useCallback' DO REACT
import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import SeriesSelectorScreen from './components/SeriesSelectorScreen';
import HomeScreen from './components/HomeScreen';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const handleStart = () => {
    setCurrentScreen('selection');
  };

  const handleSelectionComplete = (ids) => {
    setSelectedIds(ids);
    setCurrentScreen('home');
    setIsInitialLoading(true);
  };

  // ================== ALTERAÇÃO PRINCIPAL AQUI ==================
  // 2. ENVOLVEMOS A FUNÇÃO COM 'useCallback'.
  // O array de dependências vazio `[]` garante que esta função
  // seja criada apenas UMA VEZ durante todo o ciclo de vida do componente.
  // Agora, ela não será mais a causa de um re-render desnecessário na HomeScreen.
  const handleInitialLoadComplete = useCallback(() => {
    setIsInitialLoading(false);
  }, []);
  // =============================================================

  const handleRefineTaste = () => {
    setCurrentScreen('selection');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'selection':
        return <SeriesSelectorScreen onSelectionComplete={handleSelectionComplete} />;
      case 'home':
        // A prop passada para a HomeScreen agora é estável.
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

        {isInitialLoading && (
          <LoadingOverlay message="Aguarde, estamos preparando tudo para você..." />
        )}
      </main>
    </div>
  );
}

export default App;