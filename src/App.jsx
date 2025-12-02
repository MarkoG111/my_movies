import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ToWatchPage from './pages/ToWatchPage'
import WatchedPage from './pages/WatchedPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ToWatchPage />} />
        <Route path="/toWatch" element={<ToWatchPage />} />
        <Route path="/watched" element={<WatchedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
