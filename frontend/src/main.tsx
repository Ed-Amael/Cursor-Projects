import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './ui/AppLayout';
import HomePage from './pages/HomePage';
import PlansPage from './pages/PlansPage';
import ResourcesPage from './pages/ResourcesPage';
import SupportPage from './pages/SupportPage';
import FaqPage from './pages/FaqPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SpeedTestPage from './pages/SpeedTestPage';
import AccountPage from './pages/AccountPage';
import CoveragePage from './pages/CoveragePage';
import './ui/global.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="faqs" element={<FaqPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="coverage" element={<CoveragePage />} />
          <Route path="speed-test" element={<SpeedTestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);