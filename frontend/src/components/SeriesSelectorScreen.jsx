// frontend/src/components/SeriesSelectorScreen.jsx

import React, { useState, useEffect } from 'react'; // AQUI ESTÁ A CORREÇÃO
import SelectionCard from './SelectionCard';

const MIN_SELECTIONS = 3; // A regra de negócio de no mínimo 3 seleções.

function SeriesSelectorScreen({ onSelectionComplete }) {
    const [initialTitles, setInitialTitles] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Busca os títulos iniciais da nossa API em Python.
    useEffect(() => {
        const fetchInitialTitles = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://127.0.0.1:5000/api/titles');
                if (!response.ok) {
                    throw new Error("Não foi possível carregar os títulos.");
                }
                const data = await response.json();
                setInitialTitles(data.titles);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialTitles();
    }, []); // Array vazio garante que a busca só acontece uma vez.

    // Função para lidar com o clique em um card.
    const handleSelectTitle = (titleId) => {
        // 'newSelectedIds' é uma cópia do estado atual para podermos modificá-la.
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(titleId)) {
            newSelectedIds.delete(titleId); // Se já tem, remove.
        } else {
            newSelectedIds.add(titleId); // Se não tem, adiciona.
        }
        setSelectedIds(newSelectedIds); // Atualiza o estado.
    };
    
    // Converte o Set para um Array e chama a função do componente pai.
    const handleProceed = () => {
        onSelectionComplete(Array.from(selectedIds));
    };

    const isButtonDisabled = selectedIds.size < MIN_SELECTIONS;

    // Renderiza mensagens de carregamento ou erro.
    if (loading) return <div className="flex justify-center items-center h-full text-white">Carregando títulos...</div>;
    if (error) return <div className="flex justify-center items-center h-full text-red-500">Erro: {error}</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="scrollable-content p-6 text-center">
                <h1 className="text-2xl font-extrabold text-white mb-2">Configure seu gosto</h1>
                <p className="text-slate-400 mb-6 text-sm">
                    {selectedIds.size < MIN_SELECTIONS 
                        ? `Escolha pelo menos mais ${MIN_SELECTIONS - selectedIds.size}.`
                        : `Você selecionou ${selectedIds.size} títulos. Pronto?`
                    }
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                    {initialTitles.map(title => (
                        <SelectionCard
                            key={title.id}
                            title={title}
                            isSelected={selectedIds.has(title.id)}
                            onSelect={() => handleSelectTitle(title.id)}
                        />
                    ))}
                </div>
            </div>
            
            <div className="sticky-footer">
                <button 
                    onClick={handleProceed}
                    disabled={isButtonDisabled}
                    className="w-full mx-auto btn-primary text-white font-bold py-3 px-4 rounded-lg text-lg disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                    Acessar Minha Home
                </button>
            </div>
        </div>
    );
}

export default SeriesSelectorScreen;