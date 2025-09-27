// frontend/src/components/HomeScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import SuggestionCard from './SuggestionCard';
import DetailsModal from './DetailsModal';

const TMDB_LOGO_URL = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg';

// ================== ALTERAÇÃO 1 ==================
// Adicionamos os nomes de exibição para os novos serviços.
const serviceNames = {
    'all': 'Todos',
    'netflix': 'Netflix',
    'prime': 'Prime Video',
    'disney': 'Disney+',
    'max': 'Max',
    'apple': 'Apple TV+',
    'globoplay': 'Globoplay',
    'star+': 'Star+',
    'paramount+': 'Paramount+',
    'mubi': 'MUBI',
    'crunchyroll': 'Crunchyroll',
    'looke': 'Looke',
    'telecine': 'Telecine'
};

// ================== ALTERAÇÃO 2 ==================
// Adicionamos os novos identificadores na ordem que queremos
// que os botões apareçam na tela.
const filterOrder = [
    'all', 
    'netflix', 
    'prime', 
    'disney', 
    'max', 
    'apple', 
    'globoplay', 
    'star+', 
    'paramount+',
    'mubi',
    'crunchyroll',
    'looke',
    'telecine'
];
// =============================================================


function HomeScreen({ selectedIds, onRefine, onInitialLoadComplete }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const screenRef = useRef(null);
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [isFetching, setIsFetching] = useState(false);
    const [processedIds, setProcessedIds] = useState(new Set());
    
    useEffect(() => {
        const watchedOrDislikedIds = JSON.parse(localStorage.getItem('watchedOrDislikedIds') || '[]');
        setProcessedIds(new Set(watchedOrDislikedIds));
    }, []);

    useEffect(() => {
        localStorage.setItem('watchedOrDislikedIds', JSON.stringify(Array.from(processedIds)));
    }, [processedIds]);

    const fetchSuggestions = async (pageNum = 1, append = false) => {
        if (!selectedIds || selectedIds.length === 0) {
            setLoading(false);
            setError("Nenhum título foi selecionado para gerar sugestões.");
            return;
        }
        
        if (pageNum === 1 && !append) setLoading(true);
        else setLoadingMore(true);
        
        try {
            setError(null);
            const response = await fetch('http://127.0.0.1:5000/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    selected_ids: selectedIds,
                    page: pageNum,
                    exclude_ids: Array.from(processedIds)
                }),
            });
            if (!response.ok) throw new Error('A resposta da rede não foi bem-sucedida.');
            const data = await response.json();
            
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

    const fetchNewSuggestionsBasedOnWatched = async (watchedItem) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/recommendations/${watchedItem.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    exclude_ids: Array.from(new Set([...processedIds, ...suggestions.map(s => s.id)]))
                })
            });
            if (!response.ok) throw new Error('Falha ao buscar recomendações baseadas no título assistido');
            
            const recommendations = await response.json();
            
            setSuggestions(prev => {
                const newUniqueSuggestions = recommendations.filter(
                    newSuggestion => 
                        !prev.some(prevSuggestion => prevSuggestion.id === newSuggestion.id) &&
                        !processedIds.has(newSuggestion.id)
                );
                return [...prev, ...newUniqueSuggestions];
            });
            
        } catch (err) {
            console.error("Erro ao buscar novas recomendações:", err);
        }
    };

    useEffect(() => {
        if (selectedIds && selectedIds.length > 0) {
            fetchSuggestions(1, false);
        } else {
            setLoading(false);
            setError("Nenhum título foi selecionado para gerar sugestões.");
        }
    }, [selectedIds, onInitialLoadComplete]);

    const loadMoreSuggestions = () => {
        if (hasMore && !isFetching) {
            setIsFetching(true);
            fetchSuggestions(page + 1, true);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (!screenRef.current || loading || loadingMore) return;
            const { scrollTop, scrollHeight, clientHeight } = screenRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !isFetching) {
                loadMoreSuggestions();
            }
        };

        const currentRef = screenRef.current;
        if (currentRef) currentRef.addEventListener('scroll', handleScroll);
        return () => {
            if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
        };
    }, [loading, loadingMore, hasMore, isFetching]);

    const handleCardClick = async (item) => {
        setSelectedTitle(item);
        setIsDetailsLoading(true);
        setDetailsData(null);
        try {
            const mediaType = item.type === 'Série' ? 'tv' : 'movie';
            const response = await fetch(`http://127.0.0.1:5000/api/details/${mediaType}/${item.id}`);
            const data = await response.json();
            setDetailsData(response.ok ? data : null);
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

    const handleMarkAsWatched = (item) => {
        setProcessedIds(prev => new Set([...prev, item.id]));
        fetchNewSuggestionsBasedOnWatched(item);
        setSuggestions(prev => prev.filter(s => s.id !== item.id));
    };
    
    const handleDislike = async (item) => {
        setProcessedIds(prev => new Set([...prev, item.id]));
        try {
            await fetch('http://127.0.0.1:5000/api/disliked_titles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disliked_ids: [item.id] })
            });
        } catch (error) {
            console.error("Erro ao processar título não gostado:", error);
        }
        setSuggestions(prev => prev.filter(s => s.id !== item.id));
    };

    const filteredSuggestions = activeFilter === 'all'
        ? suggestions
        : suggestions.filter(item => item.service === activeFilter);

    if (loading) return <div className="flex justify-center items-center h-full text-white">Carregando sugestões...</div>;
    if (error) return <div className="flex justify-center items-center h-full text-red-500">Erro: {error}</div>;

    return (
        <div className="relative h-full">
            <div ref={screenRef} className="scrollable-content h-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Sua Home</h2>
                    </div>

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
                    
                    {loadingMore && (
                        <div className="flex justify-center my-6">
                            <div className="load-more-spinner"></div>
                        </div>
                    )}
                    
                    <div className="flex justify-center pt-8 pb-4">
                        <img src={TMDB_LOGO_URL} alt="The Movie Database" className="w-48 h-auto opacity-50" />
                    </div>
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