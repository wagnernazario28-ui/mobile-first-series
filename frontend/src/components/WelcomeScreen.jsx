// frontend/src/components/WelcomeScreen.jsx

import React, { useState, useEffect } from 'react';

// Componente de fundo reescrito para usar <img>
const WelcomeBackground = () => {
    const [backgroundTitles, setBackgroundTitles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBackgroundTitles = async () => {
            try {
                // Usamos o novo endpoint que criamos no back-end
                const response = await fetch('http://127.0.0.1:5000/api/background-titles');
                if (!response.ok) {
                    throw new Error("Não foi possível carregar as imagens de fundo.");
                }
                const data = await response.json();
                // Pegamos os primeiros 30 títulos para preencher a tela
                setBackgroundTitles(data.titles.slice(0, 30));
            } catch (error) {
                console.error("Erro no WelcomeBackground:", error);
                // Em caso de erro, podemos deixar o fundo escuro
            } finally {
                setLoading(false);
            }
        };

        fetchBackgroundTitles();
    }, []); // Array vazio garante que a busca só acontece uma vez.

    // Enquanto carrega, podemos mostrar nada ou um spinner simples,
    // mas para o fundo, é melhor não mostrar nada.
    if (loading) {
        return null;
    }

    return (
        <div className="welcome-bg-grid">
            {backgroundTitles.map(title => (
                <div key={title.id} className="bg-card">
                    {/* A MUDANÇA FUNDAMENTAL:
                      Agora usamos uma tag <img> real, que é muito mais
                      confiável para carregar imagens externas do que 'background-image'.
                      Isso resolve o problema de uma vez por todas.
                    */}
                    <img src={title.img} alt="" className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
    );
};

// Componente principal da tela (sem alterações na lógica principal)
function WelcomeScreen({ onStart }) {
    return (
        <div className="welcome-screen flex flex-col h-full justify-end text-center p-8">
            <WelcomeBackground />
            <div className="welcome-overlay"></div>
            <div className="relative z-10">
                <h1 className="text-4xl font-black text-white mb-4 leading-tight fade-in-1">
                    Sua noite perfeita começa aqui.
                </h1>
                <p className="text-slate-300 text-lg mb-8 fade-in-2">
                    Quanto mais você usa, mais nosso sistema inteligente entende seu gosto, entregando a recomendação perfeita em qualquer streaming.
                </p>
                <button
                    onClick={onStart}
                    className="w-full mx-auto btn-primary text-white font-bold py-4 px-4 rounded-lg text-lg fade-in-3"
                >
                    Começar a Descobrir
                </button>
            </div>
        </div>
    );
}

export default WelcomeScreen;