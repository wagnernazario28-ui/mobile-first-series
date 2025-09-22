// frontend/src/components/SeriesSelector.jsx

import React, { useState, useEffect } from 'react';

function SeriesSelector() {
  // useState cria uma "variável de estado" para armazenar a lista de gêneros.
  // Começa como um array vazio.
  const [genres, setGenres] = useState([]);
  // Criamos um segundo estado para controlar a mensagem de "Carregando...".
  const [loading, setLoading] = useState(true);

  // useEffect é usado para executar "efeitos colaterais", como buscar dados de uma API.
  // O array vazio [] no final garante que este código rode apenas uma vez,
  // quando o componente é montado na tela pela primeira vez.
  useEffect(() => {
    // A URL completa do nosso endpoint no back-end.
    // O Flask, por padrão, roda na porta 5000.
    const apiUrl = 'http://127.0.0.1:5000/api/genres';

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setGenres(data); // Colocamos os dados recebidos no nosso estado.
        setLoading(false); // Desativamos a mensagem de "Carregando".
      })
      .catch(error => {
        console.error("Erro ao buscar dados da API:", error);
        setLoading(false); // Também paramos de carregar em caso de erro.
      });
  }, []);

  return (
    <div>
      <h1>Seletor de Séries</h1>
      
      {/* Exibição condicional: mostra uma mensagem enquanto os dados não chegam */}
      {loading ? (
        <p>Carregando gêneros...</p>
      ) : (
        <ul>
          {/* Usamos .map() para transformar cada item do array 'genres' em um item de lista <li> */}
          {genres.map(genre => (
            <li key={genre}>{genre}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SeriesSelector;