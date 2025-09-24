// frontend/src/components/HomeScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import SuggestionCard from './SuggestionCard';
import ConfirmationToast from './ConfirmationToast';
import DetailsModal from './DetailsModal';

const TMDB_LOGO_URL = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg';

// ================== ALTERAÇÃO 1: RECEBER NOVA PROP ==================
function HomeScreen({ selectedIds, onRefine, onInitialLoadComplete }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itemToConfirm, setItemToConfirm] = useState(null);
    const [toastPosition, setToastPosition] = useState({ top: 0, left: 0 });
    const screenRef = useRef(null);
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!selectedIds || selectedIds.length === 0) {
                setLoading(false);
                setError("Nenhum título foi selecionado para gerar sugestões.");
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('http://127.0.0.1:5000/api/suggestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ selected_ids: selectedIds }),
                });
                if (!response.ok) throw new Error('A resposta da rede não foi bem-sucedida.');
                const data = await response.json();
                setSuggestions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                // ================== ALTERAÇÃO 2: AVISAR QUE TERMINOU ==================
                // Chamamos a função para notificar o App.jsx que o carregamento
                // inicial foi concluído, seja com sucesso ou erro.
                onInitialLoadComplete();
                // =====================================================================
            }
        };
        fetchSuggestions();
    }, [selectedIds]);

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
    
    const handleWatchedClick = (item, event) => {
        const cardElement = event.currentTarget.closest('.catalog-card');
        if (cardElement && screenRef.current) {
            const cardRect = cardElement.getBoundingClientRect();
            const screenRect = screenRef.current.getBoundingClientRect();
            setToastPosition({
                top: cardRect.bottom - screenRect.top + 8, left: cardRect.left - screenRect.left,
                width: cardRect.width,
            });
            setItemToConfirm(item);
        }
    };
    const handleConfirmWatched = () => {
        if (!itemToConfirm) return;
        setSuggestions(prev => prev.filter(s => s.id !== itemToConfirm.id));
        setItemToConfirm(null);
    };
    const handleCancelWatched = () => {
        setItemToConfirm(null);
    };

    if (loading) {
        // Mantemos este loading interno para recarregamentos (ex: refinar gosto),
        // mas o loading inicial será controlado pelo App.jsx.
        return <div className="flex justify-center items-center h-full text-white">Carregando sugestões...</div>;
    }

    if (error) return <div className="flex justify-center items-center h-full text-red-500">Erro: {error}</div>;

    return (
        <div ref={screenRef} className="scrollable-content relative h-full">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Sua Home</h2>
                    <button onClick={onRefine} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full">
                        Refinar Gosto
                    </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">Recomendado para Você</h3>
                
                {suggestions.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">
                        <p>Não encontramos sugestões com base na sua seleção.</p>
                        <p className="mt-2">Tente refinar seu gosto com outros títulos.</p>
                    </div>
                ) : (
                    <div id="catalog-grid" className="grid grid-cols-2 gap-4">
                        {suggestions.map(item => (
                            <SuggestionCard 
                                key={item.id} 
                                item={item} 
                                onWatchedClick={handleWatchedClick}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                )}
                
                <div className="flex justify-center pt-8 pb-4">
                    <img src={TMDB_LOGO_URL} alt="The Movie Database" className="w-48 h-auto opacity-50" />
                </div>
            </div>

            <ConfirmationToast 
                item={itemToConfirm}
                onConfirm={handleConfirmWatched}
                onCancel={handleCancelWatched}
                isVisible={!!itemToConfirm}
                position={toastPosition}
            />
            <DetailsModal
                isVisible={!!selectedTitle}
                onClose={handleCloseModal}
                baseTitle={selectedTitle}
                details={detailsData}
                isLoading={isDetailsLoading}
            />
        </div>
    );
}

export default HomeScreen;