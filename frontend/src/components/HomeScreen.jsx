// frontend/src/components/HomeScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import SuggestionCard from './SuggestionCard';
import DetailsModal from './DetailsModal';

const TMDB_LOGO_URL = 'https://www.themovied.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg';

// Mapeamento de identificadores para nomes de exibição dos serviços.
const serviceNames = {
    'all': 'Todos',
    'netflix': 'Netflix',
    'prime': 'Prime Video',
    'disney': 'Disney+',
    'max': 'Max',
    'apple': 'Apple TV+',
    'globoplay': 'Globoplay'
};
// A ordem em que os botões de filtro aparecerão na tela.
const filterOrder = ['all', 'netflix', 'prime', 'disney', 'max', 'apple', 'globoplay'];

function HomeScreen({ selectedIds, onRefine, onInitialLoadComplete }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); // Novo estado para carregamento de mais itens
    const [error, setError] = useState(null);
    const [itemToConfirm, setItemToConfirm] = useState(null); // Mantido caso seja necessário no futuro
    const [toastPosition, setToastPosition] = useState({ top: 0, left: 0 }); // Mantido caso seja necessário no futuro
    const screenRef = useRef(null);
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' é o padrão.
    const [hasMore, setHasMore] = useState(true); // Indicador se há mais páginas
    const [page, setPage] = useState(1); // Contador de páginas
    const [isFetching, setIsFetching] = useState(false); // Para evitar múltiplas chamadas simultâneas
    const [processedIds, setProcessedIds] = useState(new Set()); // IDs que foram marcados como "Já Vi" ou "Não Gostei"

    // Função para buscar sugestões (tanto inicial quanto adicionais)
    const fetchSuggestions = async (pageNum = 1, append = false) => {
        if (!selectedIds || selectedIds.length === 0) {
            setLoading(false);
            setError("Nenhum título foi selecionado para gerar sugestões.");
            return;
        }
        
        if (pageNum === 1 && !append) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        
        try {
            setError(null);
            const response = await fetch('http://127.0.0.1:5000/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    selected_ids: selectedIds,
                    page: pageNum,
                    exclude_ids: Array.from(processedIds) // Excluir títulos já processados
                }),
            });
            if (!response.ok) throw new Error('A resposta da rede não foi bem-sucedida.');
            const data = await response.json();
            
            // Filtrar títulos que já estão na lista ou já foram processados
            const filteredSuggestions = data.suggestions.filter(suggestion => 
                !processedIds.has(suggestion.id) && 
                !suggestions.some(existing => existing.id === suggestion.id)
            );
            
            if (append) {
                setSuggestions(prev => [...prev, ...filteredSuggestions]);
            } else {
                setSuggestions(filteredSuggestions);
            }
            
            setHasMore(data.has_more);
            setPage(data.current_page);
        } catch (err) {
            setError(err.message);
        } finally {
            if (pageNum === 1 && !append) {
                setLoading(false);
                onInitialLoadComplete();
            } else {
                setLoadingMore(false);
            }
            setIsFetching(false);
        }
    };

    // Função para buscar novas recomendações baseadas em um título assistido
    const fetchNewSuggestionsBasedOnWatched = async (watchedItem) => {
        try {
            // Buscar recomendações diretamente baseadas no título assistido
            const response = await fetch(`http://127.0.0.1:5000/api/recommendations/${watchedItem.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    exclude_ids: Array.from(new Set([...processedIds, ...suggestions.map(s => s.id)]))
                })
            });
            if (!response.ok) {
                throw new Error('Falha ao buscar recomendações baseadas no título assistido');
            }
            
            const recommendations = await response.json();
            
            // Atualizar a lista de sugestões para incluir as novas baseadas no título assistido
            setSuggestions(prev => {
                // Filtrar duplicatas, títulos já processados e títulos já existentes na lista
                const newUniqueSuggestions = recommendations.filter(
                    newSuggestion => 
                        !prev.some(prevSuggestion => prevSuggestion.id === newSuggestion.id) &&
                        !processedIds.has(newSuggestion.id)
                );
                return [...prev, ...newUniqueSuggestions];
            });
            
        } catch (err) {
            console.error("Erro ao buscar novas recomendações:", err);
            // Em caso de erro, apenas remover o título assistido da lista
        }
    };

    // Carregar sugestões iniciais
    useEffect(() => {
        fetchSuggestions(1, false);
    }, [selectedIds, onInitialLoadComplete]);

    // Função para carregar mais sugestões quando o usuário rolar
    const loadMoreSuggestions = () => {
        if (hasMore && !isFetching) {
            setIsFetching(true);
            fetchSuggestions(page + 1, true);
        }
    };

    // Efeito para detectar quando o usuário está perto do final da página
    useEffect(() => {
        const handleScroll = () => {
            if (!screenRef.current || loading || loadingMore) return;
            
            const { scrollTop, scrollHeight, clientHeight } = screenRef.current;
            // Se o usuário estiver a 200px do final da página, carregar mais
            if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !isFetching) {
                loadMoreSuggestions();
            }
        };

        const currentRef = screenRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [loading, loadingMore, hasMore, isFetching]);

    const handleCardClick = async (item) => {
        setSelectedTitle(item);
        setIsDetailsLoading(true);
        setDetailsData(null);
        try {
            const mediaType = item.type === 'Série' ? 'tv' : 'movie';
            const response = await fetch(`http://127.0.0.1:5000/api/details/${mediaType}/${item.id}`);
            if (!response.ok) {
                setDetailsData(null);
            } else {
                const data = await response.json();
                setDetailsData(data);
            }
        } catch (err) {
            console.error("Erro ao buscar detalhes:", err);
            setDetailsData(null);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedTitle(null);
        setDetailsData(null);
    };

    // Filtra a lista de sugestões com base no filtro ativo
    const filteredSuggestions = activeFilter === 'all'
        ? suggestions
        : suggestions.filter(item => item.service === activeFilter);

    // Funções para lidar com as ações no modal de detalhes
    const handleMarkAsWatched = (item) => {
        // Adicionar o título aos IDs processados
        setProcessedIds(prev => new Set([...prev, item.id]));
        
        // Adicionar o título assistido às preferências e buscar novas recomendações
        fetchNewSuggestionsBasedOnWatched(item);
        
        // Remover o item da lista de sugestões atuais
        setSuggestions(prev => prev.filter(s => s.id !== item.id));
    };
    
    const handleDislike = async (item) => {
        // Adicionar o título aos IDs processados
        setProcessedIds(prev => new Set([...prev, item.id]));
        
        // Processar o título não gostado no backend para refinar recomendações futuras
        try {
            await fetch('http://127.0.0.1:5000/api/disliked_titles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disliked_ids: [item.id] })
            });
        } catch (error) {
            console.error("Erro ao processar título não gostado:", error);
        }
        
        // Remover o item da lista de sugestões
        setSuggestions(prev => prev.filter(s => s.id !== item.id));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full text-white">Carregando sugestões...</div>;
    }

    if (error) return <div className="flex justify-center items-center h-full text-red-500">Erro: {error}</div>;

    return (
        <div ref={screenRef} className="scrollable-content relative h-full">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Sua Home</h2>
                    <button onClick={onRefine} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full">
                        Refinar Gosto
                    </button>
                </div>

                {/* Renderização dos botões de filtro */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {filterOrder.map(filterKey => (
                        <button 
                            key={filterKey}
                            onClick={() => setActiveFilter(filterKey)}
                            className={`service-filter-btn font-semibold py-1 px-3 rounded-full ${activeFilter === filterKey ? 'active' : ''}`}
                        >
                            {serviceNames[filterKey]}
                        </button>
                    ))}
                </div>

                <h3 className="text-lg font-bold text-white mb-4">Recomendado para Você</h3>
                
                {filteredSuggestions.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">
                        <p>
                            {suggestions.length > 0
                                ? `Nenhuma sugestão encontrada para o filtro "${serviceNames[activeFilter]}".`
                                : "Não encontramos sugestões com base na sua seleção."
                            }
                        </p>
                        <p className="mt-2">Tente refinar seu gosto ou selecionar outro filtro.</p>
                    </div>
                ) : (
                    <div id="catalog-grid" className="grid grid-cols-2 gap-4">
                        {filteredSuggestions.map(item => (
                            <SuggestionCard 
                                key={`${item.id}-${item.service}`}
                                item={item} 
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                )}
                
                {/* Indicador de carregamento para mais itens */}
                {loadingMore && (
                    <div className="flex justify-center my-6">
                        <div className="load-more-spinner"></div>
                    </div>
                )}
                
                <div className="flex justify-center pt-8 pb-4">
                    <img src={TMDB_LOGO_URL} alt="The Movie Database" className="w-48 h-auto opacity-50" />
                </div>
            </div>

            <DetailsModal
                isVisible={!!selectedTitle}
                onClose={handleCloseModal}
                baseTitle={selectedTitle}
                details={detailsData}
                isLoading={isDetailsLoading}
                onMarkAsWatched={handleMarkAsWatched}
                onDislike={handleDislike}
            />
        </div>
    );
}

export default HomeScreen;