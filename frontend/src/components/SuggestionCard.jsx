// frontend/src/components/SuggestionCard.jsx

import React from 'react';

const serviceNames = {
    'netflix': 'Netflix',
    'prime': 'Prime Video',
    'disney': 'Disney+',
    'max': 'Max',
    'apple': 'Apple TV+',
    'globoplay': 'Globoplay'
};

// ================== ALTERAÇÃO AQUI ==================
// Removemos o botão do canto superior direito e mantemos apenas o clique no card.
const SuggestionCard = React.forwardRef(({ item, onCardClick }, ref) => {
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
        </div>
    );
});

export default SuggestionCard;