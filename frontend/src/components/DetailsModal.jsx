// frontend/src/components/DetailsModal.jsx

import React, { useEffect, useState } from 'react'; // 1. IMPORTAMOS O 'useEffect' E 'useState'

// Componente para o Spinner de Carregamento (sem alterações)
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="spinner"></div>
    </div>
);

function DetailsModal({ isVisible, onClose, details, isLoading, baseTitle, onMarkAsWatched, onDislike }) {
    const [showWatchedConfirmation, setShowWatchedConfirmation] = useState(false);
    const [isAddingNewSuggestion, setIsAddingNewSuggestion] = useState(false);

    // ================== ALTERAÇÃO PRINCIPAL: TRAVA DE ROLAGEM ==================
    // Usamos o useEffect para criar um "efeito colateral" que observa a
    // propriedade 'isVisible'.
    useEffect(() => {
        // Quando o modal estiver visível...
        if (isVisible) {
            // ...impedimos a rolagem do conteúdo de fundo.
            document.body.style.overflow = 'hidden';
        }

        // A função de "limpeza" do useEffect é executada quando o componente
        // é desmontado ou quando a dependência ('isVisible') muda.
        // Isso garante que a rolagem sempre seja reativada.
        return () => {
            document.body.style.overflow = 'unset'; // 'unset' restaura o valor padrão do CSS.
        };
    }, [isVisible]); // O array de dependências garante que este efeito só rode quando 'isVisible' mudar.
    // ========================================================================

    if (!isVisible || !baseTitle) {
        return null;
    }

    const overlayClasses = isVisible
        ? "fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-0 max-h-[100dvh]"
        : "hidden";

    const trailerUrl = details?.trailer_key
        ? `https://www.youtube.com/watch?v=${details.trailer_key}`
        : null;

    // Funções para manipular os botões no modal
    const handleMarkAsWatched = () => {
        setShowWatchedConfirmation(true);
    };

    const handleConfirmWatched = async () => {
        setIsAddingNewSuggestion(true);
        
        try {
            // Adiciona o título atual às preferências do usuário
            onMarkAsWatched(baseTitle);
            
            // Adiciona o ID ao localStorage de títulos assistidos
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
        onClose(); // Fecha o modal após confirmar
    };

    const handleCancelWatched = () => {
        setShowWatchedConfirmation(false);
    };

    const handleDislike = () => {
        // Refina o gosto do usuário, indicando que não gostou deste título
        onDislike(baseTitle);
        
        // Adiciona o ID ao localStorage de títulos não gostados
        const watchedOrDislikedIds = JSON.parse(localStorage.getItem('watchedOrDislikedIds') || '[]');
        if (!watchedOrDislikedIds.includes(baseTitle.id)) {
            watchedOrDislikedIds.push(baseTitle.id);
            localStorage.setItem('watchedOrDislikedIds', JSON.stringify(watchedOrDislikedIds));
        }
        
        onClose();
    };

    return (
        <div className={overlayClasses} onClick={onClose}>
            <div className="w-full max-w-[340px] bg-[#18181b] rounded-t-3xl max-h-[70vh] overflow-hidden flex flex-col mx-auto" onClick={(e) => e.stopPropagation()}>
                
                {/* Barra superior com controle de fechamento */}
                <div className="flex justify-between items-center p-4 bg-[#121212]">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <h2 className="text-base font-bold text-white truncate max-w-[70%]">{baseTitle.title}</h2>
                    <div className="w-8"></div> {/* Espaço para manter o layout centralizado */}
                </div>
                
                {/* Backdrop e conteúdo */}
                <div className="relative">
                    <div 
                        className="h-40 bg-cover bg-center"
                        style={{ backgroundImage: `url(${details?.backdrop_img || baseTitle.img})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent"></div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-lg font-extrabold text-white mb-1">{baseTitle.title}</h2>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 bg-[#18181b]">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : !details ? (
                        <p className="text-slate-300 text-center py-8">
                            Desculpe, não encontrei as informações desse título.
                        </p>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="text-xs text-slate-400">{details.genres.join(' · ')}</span>
                                {(details.number_of_seasons || details.number_of_seasons === 0) && (
                                    <span className="text-xs text-slate-400">· {details.number_of_seasons} Temporada{details.number_of_seasons !== 1 ? 's' : ''}</span>
                                )}
                            </div>
                            <p className="text-slate-300 text-sm mb-4 max-h-20 overflow-y-auto">
                                {details.synopsis}
                            </p>
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-white mb-1">Elenco Principal</h4>
                                <p className="text-slate-400 text-xs">
                                    {details.cast.join(', ')}
                                </p>
                            </div>
                            {trailerUrl ? (
                                <a
                                    href={trailerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full text-center block btn-primary text-white font-bold py-3 px-4 rounded-lg text-sm mb-4"
                                >
                                    Ver Trailer
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className="w-full text-center block btn-primary text-white font-bold py-3 px-4 rounded-lg text-sm mb-4 disabled:bg-slate-700 disabled:cursor-not-allowed"
                                >
                                    Trailer Indisponível
                                </button>
                            )}
                            
                            {/* Botões "Já Vi" e "Não Gostei" - Estilo mobile otimizado */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleMarkAsWatched}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                                >
                                    Já Vi
                                </button>
                                <button
                                    onClick={handleDislike}
                                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                                >
                                    Não Gostei
                                </button>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Modal de confirmação para "Já Vi" - Estilo mobile otimizado */}
                {showWatchedConfirmation && (
                    <div className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center p-4">
                        <div className="bg-[#18181b] rounded-2xl w-full max-w-[340px] mx-auto p-4">
                            <h3 className="text-sm font-bold text-white mb-2">Buscar nova recomendação?</h3>
                            <p className="text-slate-300 text-xs mb-4">
                                Você assistiu a "{baseTitle.title}". Deseja buscar uma nova recomendação baseada nesse título?
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleCancelWatched}
                                    className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg text-sm"
                                >
                                    Não
                                </button>
                                <button
                                    onClick={handleConfirmWatched}
                                    disabled={isAddingNewSuggestion}
                                    className="bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center"
                                >
                                    {isAddingNewSuggestion ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Sim"
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