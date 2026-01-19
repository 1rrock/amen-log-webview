import { HashRouter, Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Write from './pages/Write';
import Result from './pages/Result';
import History from './pages/History';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/write" element={<Write />} />
        <Route path="/result" element={<Result />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </HashRouter>
  );
}

export default App;