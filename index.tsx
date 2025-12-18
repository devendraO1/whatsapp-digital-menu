
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import MenuPage from './components/MenuPage';
import { ShopProvider } from './contexts/ShopContext';

const App = () => {
  return (
    <HashRouter>
      <ShopProvider>
        <Layout>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/menu/:slug" element={<MenuPage />} />
            <Route path="/" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Layout>
      </ShopProvider>
    </HashRouter>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
