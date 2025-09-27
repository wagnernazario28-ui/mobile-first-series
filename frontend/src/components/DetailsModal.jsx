// frontend/src/components/DetailsModal.jsx

import React, { useEffect, useState } from 'react';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="spinner"></div>
    </div>
);

// ================== ALTERAÇÃO PRINCIPAL ==================
// 1. A prop 'scrollTop' foi removida. Não precisamos mais dela.
function DetailsModal({ isVisible, onClose, details, isLoading, baseTitle, onMarkAsWatched, onDislike }) {
    const [showWatchedConfirmation, setShowWatchedConfirmation] = useState(false);
    const [isAddingNewSuggestion, setIsAddingNewSuggestion] = useState(false);

    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isVisible]);

    if (!isVisible || !baseTitle) {
        return null;
    }

    // A classe 'items-end' garante que o modal sempre aparecerá na parte de baixo da tela.
    const overlayClasses = isVisible
        ? "absolute inset-0 bg-black/80 z-50 flex items-end justify-center"
        : "hidden";

    const trailerUrl = details?.trailer_key
        ? `https://www.youtube.com/watch?v=${details.trailer_key}`
        : null;

    const handleMarkAsWatched = () => {
        setShowWatchedConfirmation(true);
    };

    const handleConfirmWatched = async () => {
        setIsAddingNewSuggestion(true);
        try {
            onMarkAsWatched(baseTitle);
            const watchedOrDislikedIds = JSON.parse(localStorage.getItem('watchedOrDislikedIds') || '[]');
            if (!watchedOrDislikedIds.includes(baseTitle.id)) {
                watchedOrDislikedIds.push(baseTitle.id);
                localStorage.setItem('watchedOrDislikedIds', JSON.stringify(watchedOrDislikedIds));
            }
        } catch (error) {
            console.error("Erro ao processar título assistido:", error);
        }
        setIsAddingNewSuggestion(false);
        setShowWatchedConfirmation(false);
        onClose();
    };

    const handleCancelWatched = () => {
        setShowWatchedConfirmation(false);
    };

    const handleDislike = () => {
        onDislike(baseTitle);
        const watchedOrDislikedIds = JSON.parse(localStorage.getItem('watchedOrDislikedIds') || '[]');
        if (!watchedOrDislikedIds.includes(baseTitle.id)) {
            watchedOrDislikedIds.push(baseTitle.id);
            localStorage.setItem('watchedOrDislikedIds', JSON.stringify(watchedOrDislikedIds));
        }
        onClose();
    };

    return (
        // 2. O estilo inline 'style={{...}}' foi removido.
        <div
            className={overlayClasses}
            onClick={onClose}
        >
            <div className="w-full max-w-[390px] bg-[#18181b] rounded-t-3xl max-h-[85%] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex-shrink-0 p-4 flex justify-center items-center relative border-b border-slate-700/50">
                    <button onClick={onClose} className="absolute left-4 text-slate-400 hover:text-white">&times;</button>
                    <div className="w-8 h-1.5 bg-slate-600 rounded-full"></div>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    <div 
                        className="h-48 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${details?.backdrop_img || baseTitle.img})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h2 className="text-2xl font-extrabold text-white leading-tight">{baseTitle.title}</h2>
                        </div>
                    </div>

                    <div className="p-4">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : !details ? (
                            <p className="text-slate-300 text-center py-8">
                                Desculpe, não encontrei as informações desse título.
                            </p>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="text-sm text-slate-400">{details.genres.join(' · ')}</span>
                                    {(details.number_of_seasons || details.number_of_seasons === 0) && (
                                        <span className="text-sm text-slate-400">· {details.number_of_seasons} Temporada{details.number_of_seasons !== 1 ? 's' : ''}</span>
                                    )}
                                </div>
                                <p className="text-slate-300 text-sm mb-4">
                                    {details.synopsis}
                                </p>
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-white mb-1">Elenco Principal</h4>
                                    <p className="text-slate-400 text-xs">
                                        {details.cast.join(', ')}
                                    </p>
                                </div>
                                {trailerUrl ? (
                                    <a
                                        href={trailerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-center block btn-primary text-white font-bold py-3 px-4 rounded-lg text-lg mb-4"
                                    >
                                        Ver Trailer
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full text-center block btn-primary text-white font-bold py-3 px-4 rounded-lg text-lg mb-4 disabled:bg-slate-700 disabled:cursor-not-allowed"
                                    >
                                        Trailer Indisponível
                                    </button>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleMarkAsWatched}
                                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
                                    >
                                        Já Vi
                                    </button>
                                    <button
                                        onClick={handleDislike}
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
                                    >
                                        Não Gostei
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                {showWatchedConfirmation && (
                    <div className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center p-4">
                        <div className="bg-[#1e293b] rounded-2xl w-full max-w-[340px] mx-auto p-4 border border-slate-700">
                            <h3 className="text-base font-bold text-white mb-2 text-center">Adicionar à sua Home?</h3>
                            <p className="text-slate-300 text-sm mb-4 text-center">
                                Você assistiu a "{baseTitle.title}". Buscaremos uma nova recomendação com base nesse título para você.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleCancelWatched}
                                    className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmWatched}
                                    disabled={isAddingNewSuggestion}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center"
                                >
                                    {isAddingNewSuggestion ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Confirmar"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetailsModal;