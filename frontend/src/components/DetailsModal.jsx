// frontend/src/components/DetailsModal.jsx

import React, { useEffect, useState } from 'react';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="spinner"></div>
    </div>
);

function DetailsModal({ isVisible, onClose, details, isLoading, baseTitle, onMarkAsWatched, onDislike }) {
    // ================== ALTERAÇÃO 1 ==================
    // Os estados relacionados à confirmação foram removidos, pois não são mais necessários.
    // const [showWatchedConfirmation, setShowWatchedConfirmation] = useState(false);
    // const [isAddingNewSuggestion, setIsAddingNewSuggestion] = useState(false);

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

    const overlayClasses = isVisible
        ? "absolute inset-0 bg-black/80 z-50 flex items-end justify-center"
        : "hidden";

    const trailerUrl = details?.trailer_key
        ? `https://www.youtube.com/watch?v=${details.trailer_key}`
        : null;

    // ================== ALTERAÇÃO 2 ==================
    // A função agora executa a ação diretamente, sem abrir um pop-up de confirmação.
    const handleMarkAsWatched = () => {
        // Chama a função principal passada pelo HomeScreen
        onMarkAsWatched(baseTitle);
        
        // Adiciona o ID ao localStorage para não mostrá-lo novamente
        const watchedOrDislikedIds = JSON.parse(localStorage.getItem('watchedOrDislikedIds') || '[]');
        if (!watchedOrDislikedIds.includes(baseTitle.id)) {
            watchedOrDislikedIds.push(baseTitle.id);
            localStorage.setItem('watchedOrDislikedIds', JSON.stringify(watchedOrDislikedIds));
        }
        
        // Fecha o modal
        onClose();
    };

    // As funções 'handleConfirmWatched' e 'handleCancelWatched' foram removidas.

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
                                    {/* ================== ALTERAÇÃO 3 ================== */}
                                    {/* O texto do botão foi alterado para "Já assisti". */}
                                    <button
                                        onClick={handleMarkAsWatched}
                                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
                                    >
                                        Já Assisti
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
                
                {/* ================== ALTERAÇÃO 4 ================== */}
                {/* O JSX do modal de confirmação foi completamente removido. */}
            </div>
        </div>
    );
}

export default DetailsModal;