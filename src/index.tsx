import ReactDomClient from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Snake from './pages/Snake';
import Base from './pages/Base';
import Navigation from './pages';
import './index.css';

const root = ReactDomClient.createRoot(document.getElementById('root')!);

root.render(
  <BrowserRouter basename={process.env.PUBLIC_URL || '/'}>
    <Routes>
      <Route path="/base">
        <Route path="*" element={<Base />} />
      </Route>
      <Route path="/snake">
        <Route path="*" element={<Snake />} />
      </Route>
      <Route index element={<Navigation />} />
    </Routes>
  </BrowserRouter>
);
