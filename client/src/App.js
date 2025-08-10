import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Fixtures from './pages/Fixtures';
import Predictions from './pages/Predictions';
import Odds from './pages/Odds';
import Statistics from './pages/Statistics';
import Leagues from './pages/Leagues';
import Teams from './pages/Teams';
import CacheMonitor from './pages/CacheMonitor';
import MyBets from './pages/MyBets';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-slate-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/odds" element={<Odds />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/leagues" element={<Leagues />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/cache" element={<CacheMonitor />} />
            <Route path="/my-bets" element={<MyBets />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
