// frontend/src/components/DetailsModal.jsx

import React, { useEffect } from 'react'; // 1. IMPORTAMOS O 'useEffect'

// Componente para o Spinner de Carregamento (sem alterações)
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="spinner"></div>
    </div>
);

function DetailsModal({ isVisible, onClose, details, isLoading, baseTitle }) {

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
        ? "modal-overlay visible"
        : "modal-overlay";

    const trailerUrl = details?.trailer_key
        ? `https://www.youtube.com/watch?v=${details.trailer_key}`
        : null;

    return (
        <div className={overlayClasses} onClick={onClose}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

                <div
                    className="modal-backdrop"
                    style={{ backgroundImage: `url(${details?.backdrop_img || baseTitle.img})` }}
                ></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center z-20 hover:bg-black/80 transition-colors"
                >
                    &times;
                </button>

                <div className="relative z-10 p-6 pt-48 text-left">
                    <h2 className="text-3xl font-extrabold text-white mb-2">{baseTitle.title}</h2>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : !details ? (
                        <p className="text-slate-300 text-center py-8">
                            Desculpe, não encontrei as informações desse título.
                        </p>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-4 flex-wrap">
                                <span className="text-sm text-slate-400">{details.genres.join(' · ')}</span>
                            </div>
                            <p className="text-slate-300 text-sm mb-4 h-24 overflow-y-auto">
                                {details.synopsis}
                            </p>
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-white mb-2">Elenco Principal</h4>
                                <p className="text-slate-400 text-xs">
                                    {details.cast.join(', ')}
                                </p>
                            </div>
                            {trailerUrl ? (
                                <a
                                    href={trailerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full text-center block btn-primary text-white font-bold py-3 px-4 rounded-lg text-lg"
                                >
                                    Ver Trailer
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className="w-full text-center block btn-primary text-white font-bold py-3 px-4 rounded-lg text-lg disabled:bg-slate-700 disabled:cursor-not-allowed"
                                >
                                    Trailer Indisponível
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DetailsModal;