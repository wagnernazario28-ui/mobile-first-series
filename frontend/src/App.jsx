import { useState, useEffect } from 'react';
import tmdbLogo from './assets/tmdb-logo.svg';

const API_URL = 'http://127.0.0.1:5000'; 
const services = { 'netflix': 'Netflix', 'prime': 'Prime Video', 'disney': 'Disney+', 'max': 'Max', 'apple': 'Apple TV+' };
const MIN_SELECTIONS = 3;

function App() {
  const [screen, setScreen] = useState('welcome'); 
  const [initialTitles, setInitialTitles] = useState([]);
  const [selectedTitleIds, setSelectedTitleIds] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // --- EFEITOS COLATERAIS (useEffect) ---
  // Agora busca os títulos UMA VEZ, assim que o app carrega.
  useEffect(() => {
    fetch(`${API_URL}/api/titles`)
      .then(response => response.json())
      .then(data => {
        console.log("Títulos recebidos da API:", data);
        setInitialTitles(data.titles || []); // Garante que seja sempre um array
      })
      .catch(error => console.error("Erro ao buscar títulos:", error));
  }, []); // O array vazio [] faz com que isso rode apenas uma vez.

  // --- FUNÇÕES DE MANIPULAÇÃO DE EVENTOS (Handlers) ---
  const handleTitleClick = (titleId) => {
    const newSelectedIds = [...selectedTitleIds];
    if (newSelectedIds.includes(titleId)) {
      setSelectedTitleIds(newSelectedIds.filter(id => id !== titleId));
    } else {
      newSelectedIds.push(titleId);
      setSelectedTitleIds(newSelectedIds);
    }
  };

  const handleGetSuggestions = () => {
    setIsLoading(true); // Inicia o carregamento
    fetch(`${API_URL}/api/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_ids: selectedTitleIds })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Sugestões recebidas da API:", data);
      setSuggestions(data); 
      setScreen('home');    
    })
    .catch(error => console.error("Erro ao buscar sugestões:", error))
    .finally(() => {
      setIsLoading(false); // Finaliza o carregamento
    });
  };
  
  const filteredTitles = activeFilter === 'all' 
    ? initialTitles 
    : initialTitles.filter(t => t.service === activeFilter);
  
  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <div className="mobile-frame">
      <main className="mobile-screen">
        
        {/* TELA DE CARREGAMENTO (LOADING OVERLAY) */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="loading-text">Aguarde, estamos preparando tudo pra você.</p>
          </div>
        )}

        {/* TELA DE BOAS-VINDAS */}
        {screen === 'welcome' && (
          <div className="welcome-screen flex flex-col h-full justify-end text-center p-8">
             <div className="welcome-bg-grid">
                {/* Agora usa os 10 primeiros títulos da API para o fundo */}
                {initialTitles.slice(0, 10).map((title, index) => (
                    <div key={index} className="bg-card" style={{ backgroundImage: `url(${title.img})` }}></div>
                ))}
            </div>
            <div className="welcome-overlay"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-black text-white mb-4 leading-tight fade-in-1">Sua noite perfeita começa aqui.</h1>
              <p className="text-slate-300 text-lg mb-8 fade-in-2">Quanto mais você usa, mais nosso sistema inteligente entende seu gosto.</p>
              <button onClick={() => setScreen('selection')} className="w-full mx-auto btn-primary font-bold py-4 px-4 rounded-lg text-lg fade-in-3">Começar a Descobrir</button>
            </div>
          </div>
        )}

        {/* TELA DE SELEÇÃO (O restante do código permanece o mesmo) */}
        {screen === 'selection' && (
           <div className="flex flex-col h-full">
            <div className="scrollable-content p-6 text-center">
              <h1 className="text-2xl font-extrabold text-white mb-2">Configure seu gosto</h1>
              <p className="text-slate-400 mb-6 text-sm">
                {selectedTitleIds.length >= MIN_SELECTIONS 
                  ? `Você selecionou ${selectedTitleIds.length} títulos. Pronto?`
                  : `Escolha pelo menos mais ${MIN_SELECTIONS - selectedTitleIds.length}.`}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                 <button onClick={() => setActiveFilter('all')} className={`service-filter-btn font-semibold py-2 px-3 rounded-full ${activeFilter === 'all' ? 'active' : ''}`}>Todos</button>
                 {Object.entries(services).map(([key, name]) => (
                    <button key={key} onClick={() => setActiveFilter(key)} className={`service-filter-btn font-semibold py-2 px-3 rounded-full ${activeFilter === key ? 'active' : ''}`}>{name}</button>
                 ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {filteredTitles && filteredTitles.map(title => (
                  <div 
                    key={title.id} 
                    className={`selection-card ${selectedTitleIds.includes(title.id) ? 'selected' : ''}`}
                    onClick={() => handleTitleClick(title.id)}
                  >
                    <img src={title.img} alt={title.title} className="w-full h-full object-cover" />
                    <div className="title">{title.title}</div>
                    <button className="checkmark-btn selection-checkmark">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky-footer">
              <button 
                onClick={handleGetSuggestions} 
                className="w-full mx-auto btn-primary font-bold py-3 px-4 rounded-lg text-lg"
                disabled={selectedTitleIds.length < MIN_SELECTIONS}
              >
                Acessar Minha Home
              </button>
            </div>
          </div>
        )}
        
        {/* TELA HOME (O restante do código permanece o mesmo) */}
        {screen === 'home' && (
             <div className="scrollable-content p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Sua Home</h2>
                    <button onClick={() => setScreen('selection')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full">Refinar Gosto</button>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">Em Alta para Você</h3>
                <div className='grid grid-cols-2 gap-4'>
                    {suggestions.map(item => (
                        <div key={item.id} className='catalog-card rounded-lg overflow-hidden bg-[#1e293b] flex flex-col'>
                             <div className="w-full h-48 bg-black flex items-center justify-center">
                                <img src={item.img} alt={item.title} className="w-full h-full object-contain"/>
                             </div>
                             <div className="p-3">
                                <h5 className="font-bold text-white truncate text-sm">{item.title}</h5>
                                <p className="text-xs text-slate-400">{item.service ? services[item.service] : 'Série'}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="text-center mt-10 py-4">
                  <p className="text-xs text-slate-500 mb-2">
                    This product uses the TMDb API but is not endorsed or certified by TMDb.
                  </p>
                  <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" title="The Movie Database">
                    <img src={tmdbLogo} alt="The Movie Database Logo" className="h-4 inline-block" />
                  </a>
                </div>
            </div>
        )}

      </main>
    </div>
  )
}

export default App