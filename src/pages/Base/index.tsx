import { Routes, Route } from 'react-router-dom';
import Loop from './Loop';

function Layout() {
  return (
    <Routes>
      <Route path="loop" element={<Loop />} />
    </Routes>
  );
}

export default Layout;
