// frontend/src/components/SelectionCard.jsx

import React from 'react';

function SelectionCard({ title, isSelected, onSelect }) {
    // Adiciona a classe 'selected' dinamicamente com base na prop 'isSelected'
    const cardClasses = `selection-card ${isSelected ? 'selected' : ''}`;

    // O SVG do checkmark que aparece quando o card está selecionado
    const checkmark = (
        <div className="checkmark-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/>
            </svg>
        </div>
    );

    return (
        <div className={cardClasses} onClick={onSelect}>
            <img 
                src={title.img} 
                alt={`Pôster de ${title.title}`} 
                className="w-full h-full object-cover" 
            />
            <div className="title">{title.title}</div>
            {isSelected && checkmark}
        </div>
    );
}

export default SelectionCard;