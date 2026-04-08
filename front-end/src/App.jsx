import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@radix-ui/themes/styles.css';
import { Theme, Container } from '@radix-ui/themes';
import { Toaster } from 'sonner';
import './App.css';
import Menu from './components/Menu.jsx';
import Search from './components/Search.jsx';
import Favorites from './components/Favorites.jsx';
import EventDetails from './components/EventDetails.jsx';

const App = () => {

  const [searchResults, setSearchResults] = useState('');

  const handleDataReceived = (data) => {
    setSearchResults(data);
  };

  return (
    <>
      <Theme accentColor="gray">
        <BrowserRouter>
          <Toaster position="top-right" />
          <Menu />
          <Container>
            <Routes>
              <Route path="/search" element={<Search onDataReceived={handleDataReceived} savedResults={searchResults} />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/event/:id" element={<EventDetails />} />

              {/* Redirect root and unknown paths to /search */}
              <Route path="/" element={<Navigate to="/search" replace />} />
              <Route path="*" element={<Navigate to="/search" replace />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </Theme>
    </>
  );
};

export default App;