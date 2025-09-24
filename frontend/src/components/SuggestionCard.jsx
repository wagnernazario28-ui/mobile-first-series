// frontend/src/components/SuggestionCard.jsx

import React from 'react';
import CheckmarkIcon from './CheckmarkIcon';

const serviceNames = {
    'netflix': 'Netflix',
    'prime': 'Prime Video',
    'disney': 'Disney+',
    'max': 'Max',
    'apple': 'Apple TV+',
    'globoplay': 'Globoplay'
};

// ================== ALTERAÇÃO AQUI ==================
// Adicionamos uma nova propriedade: 'onCardClick'.
const SuggestionCard = React.forwardRef(({ item, onWatchedClick, onCardClick }, ref) => {
    
    const handleWatchedButtonClick = (e) => {
        // O stopPropagation aqui é crucial para que, ao clicar no checkmark,
        // ele não dispare o clique do card também.
        e.stopPropagation();
        onWatchedClick(item, e);
    };

    return (
        // Adicionamos o evento onClick ao div principal do card.
        // Ele vai chamar a função que a HomeScreen nos passar.
        <div 
            ref={ref} 
            className="catalog-card rounded-lg overflow-hidden bg-[#1e293b] relative"
            onClick={() => onCardClick(item)}
        >
            <img 
                src={item.img} 
                alt={`Pôster de ${item.title}`} 
                className="w-full h-full object-cover" 
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h5 className="font-bold text-white truncate text-sm">{item.title}</h5>
                <p className="text-xs text-slate-400">
                    {serviceNames[item.service] || 'Streaming'} - {item.type}
                </p>
            </div>

            <CheckmarkIcon 
                className="checkmark-btn"
                onClick={handleWatchedButtonClick}
            />
        </div>
    );
});

export default SuggestionCard;