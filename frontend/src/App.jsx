// frontend/src/App.jsx

import SeriesSelector from './components/SeriesSelector';
import './App.css'; // Mantemos o CSS para estilizações futuras

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <SeriesSelector />
      </header>
    </div>
  );
}

export default App;