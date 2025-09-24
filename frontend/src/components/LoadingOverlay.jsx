// frontend/src/components/LoadingOverlay.jsx

import React from 'react';

// Este é um componente "presentacional" simples.
// Ele recebe a mensagem que deve exibir e não tem lógica própria.
// Ele reutiliza as classes 'loading-overlay', 'spinner' e 'loading-text'
// que já existem no nosso index.css.
function LoadingOverlay({ message }) {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

export default LoadingOverlay;