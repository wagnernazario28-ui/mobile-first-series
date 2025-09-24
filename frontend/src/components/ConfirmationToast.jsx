// frontend/src/components/ConfirmationToast.jsx

import React from 'react';

// A prop 'position' foi adicionada
function ConfirmationToast({ item, onConfirm, onCancel, isVisible, position }) {
  if (!isVisible || !item) {
    return null;
  }

  // Estilos inline para posicionar o toast dinamicamente.
  // Usamos os valores calculados no HomeScreen.
  const toastStyle = {
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: `${position.width}px`,
  };

  return (
    // A classe 'confirmation-toast' agora é para estilização, não para posicionamento.
    // O posicionamento é feito via 'style={toastStyle}'.
    <div 
      className="confirmation-toast" 
      style={toastStyle}
    >
      <p className="text-center text-white mb-2 text-sm">
        Marcar "{item.title}" como assistido?
      </p>
      <div className="flex gap-2">
        <button 
          onClick={onCancel}
          className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg text-xs"
        >
          Cancelar
        </button>
        <button 
          onClick={onConfirm}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 rounded-lg text-xs"
        >
          Sim
        </button>
      </div>
    </div>
  );
}

export default ConfirmationToast;