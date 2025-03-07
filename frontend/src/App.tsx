import "./App.css";
import { EmergencyResponseMap } from "./components";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Notfalldienste-Erreichbarkeitsanalyse</h1>
      </header>
      <main>
        <EmergencyResponseMap />
      </main>
      <footer>
        <p>© {new Date().getFullYear()} - Notfalldienste-Erreichbarkeitsanalyse</p>
      </footer>
    </div>
  );
}

export default App;
