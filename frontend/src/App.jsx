import { useState, useEffect } from 'react';

// URL base da nossa API Flask. Em um projeto de produção, isso viria de uma variável de ambiente.
const API_URL = 'http://127.0.0.1:5000'; 

// Dados que não precisam vir da API por enquanto (mockado).
const services = { 'netflix': 'Netflix', 'prime': 'Prime Video', 'disney': 'Disney+', 'max': 'Max', 'apple': 'Apple TV+' };
const allTitlesForBg = [
    "https://placehold.co/200x300/111/FFFFFF?text=Pulp+Fiction", "https://placehold.co/200x300/111/FFFFFF?text=The+Matrix",
    "https://placehold.co/200x300/111/FFFFFF?text=Interestelar", "https://placehold.co/200x300/111/FFFFFF?text=The+Office",
    "https://placehold.co/200x300/111/FFFFFF?text=Friends", "https://placehold.co/200x300/111/FFFFFF?text=Succession"
];
const MIN_SELECTIONS = 3;


function App() {
  // --- ESTADO DA APLICAÇÃO (useState) ---
  // Usamos useState para armazenar dados que, ao mudarem, devem fazer a interface ser redesenhada.

  // Gerencia qual tela (view) está sendo exibida para o usuário.
  const [screen, setScreen] = useState('welcome'); // 'welcome', 'selection', 'home'
  
  // Armazena a lista de títulos que vem da API para a tela de seleção.
  const [initialTitles, setInitialTitles] = useState([]);
  
  // Armazena os IDs dos títulos que o usuário selecionou.
  const [selectedTitleIds, setSelectedTitleIds] = useState([]);
  
  // Armazena as sugestões de filmes/séries recebidas da API.
  const [suggestions, setSuggestions] = useState([]);
  
  // Gerencia o filtro de serviço de streaming ativo na tela de seleção.
  const [activeFilter, setActiveFilter] = useState('all');

  // --- EFEITOS COLATERAIS (useEffect) ---
  // useEffect é usado para executar código que interage com o "mundo exterior", como chamadas de API.

  // Este useEffect busca os títulos iniciais da nossa API Flask QUANDO a tela de seleção é exibida.
  useEffect(() => {
    // Só executa a busca se a tela for a de seleção e se os títulos ainda não foram carregados.
    if (screen === 'selection' && initialTitles.length === 0) {
      fetch(`${API_URL}/api/titles`)
        .then(response => response.json())
        .then(data => {
          console.log("Títulos recebidos da API:", data);
          setInitialTitles(data);
        })
        .catch(error => console.error("Erro ao buscar títulos:", error));
    }
  }, [screen]); // O array [screen] significa que este efeito rodará toda vez que a variável 'screen' mudar.

  // --- FUNÇÕES DE MANIPULAÇÃO DE EVENTOS (Handlers) ---
  // Funções que são chamadas em resposta a ações do usuário, como cliques.

  // Chamada quando o usuário clica em um card de filme/série na tela de seleção.
  const handleTitleClick = (titleId) => {
    // Cria uma cópia da lista de IDs selecionados.
    const newSelectedIds = [...selectedTitleIds];
    
    if (newSelectedIds.includes(titleId)) {
      // Se o ID já está na lista, remove (desmarca).
      setSelectedTitleIds(newSelectedIds.filter(id => id !== titleId));
    } else {
      // Se não está, adiciona (marca).
      newSelectedIds.push(titleId);
      setSelectedTitleIds(newSelectedIds);
    }
  };

  // Chamada quando o usuário clica no botão "Acessar Minha Home".
  const handleGetSuggestions = () => {
    // Faz uma requisição POST para a API, enviando os IDs selecionados no corpo.
    fetch(`${API_URL}/api/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selected_ids: selectedTitleIds })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Sugestões recebidas da API:", data);
      setSuggestions(data); // Guarda as sugestões no estado.
      setScreen('home');    // Muda para a tela 'home'.
    })
    .catch(error => console.error("Erro ao buscar sugestões:", error));
  };
  
  // Filtra os títulos a serem exibidos com base no filtro de serviço ativo.
  const filteredTitles = activeFilter === 'all' 
    ? initialTitles 
    : initialTitles.filter(t => t.service === activeFilter);
  
  // --- RENDERIZAÇÃO DO COMPONENTE ---
  // A seguir, o JSX que descreve como a interface deve se parecer.
  // Usamos renderização condicional para mostrar a tela correta baseada no estado 'screen'.

  return (
    <div className="mobile-frame">
      <main className="mobile-screen">

        {/* TELA DE BOAS-VINDAS */}
        {screen === 'welcome' && (
          <div className="welcome-screen flex flex-col h-full justify-end text-center p-8">
             <div className="welcome-bg-grid">
                {allTitlesForBg.map((imgUrl, index) => (
                    <div key={index} className="bg-card" style={{ backgroundImage: `url(${imgUrl})` }}></div>
                ))}
            </div>
            <div className="welcome-overlay"></div>
            <div className="relative z-10">
              <h1 className="text-5xl font-black text-white mb-4 leading-tight fade-in-1">Sua noite perfeita começa aqui.</h1>
              <p className="text-slate-300 text-lg mb-8 fade-in-2">Quanto mais você usa, mais nosso sistema inteligente entende seu gosto.</p>
              <button onClick={() => setScreen('selection')} className="w-full mx-auto btn-primary font-bold py-4 px-4 rounded-lg text-lg fade-in-3">Começar a Descobrir</button>
            </div>
          </div>
        )}

        {/* TELA DE SELEÇÃO */}
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
                {filteredTitles.map(title => (
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
        
        {/* TELA HOME */}
        {screen === 'home' && (
            <div className="scrollable-content p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Sua Home</h2>
                    <button onClick={() => setScreen('selection')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full">Refinar Gosto</button>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">Em Alta para Você</h3>
                {/* Aqui viria o carrossel e o grid de sugestões. 
                    Renderizar a lista 'suggestions' que está no estado.
                    Por simplicidade, vamos apenas mostrar os títulos. */}
                <div className='grid grid-cols-2 gap-4'>
                    {suggestions.map(item => (
                        <div key={item.id} className='catalog-card rounded-lg overflow-hidden bg-[#1e293b]'>
                             <img src={item.img.replace('600x400', '400x225')} className="w-full h-24 object-cover"/>
                             <div className="p-3">
                                <h5 className="font-bold text-white truncate text-sm">{item.title}</h5>
                                <p className="text-xs text-slate-400">{services[item.service]} - {item.type}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
  )
}

export default App