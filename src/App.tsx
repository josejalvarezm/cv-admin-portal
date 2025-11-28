import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@components/Layout';
import { DashboardPage } from '@pages/DashboardPage';
import { TechnologiesPage } from '@pages/TechnologiesPage';
import { TechnologyFormPage } from '@pages/TechnologyFormPage';
import { StagedChangesPage } from '@pages/StagedChangesPage';
import { SettingsPage } from '@pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="technologies" element={<TechnologiesPage />} />
        <Route path="technologies/new" element={<TechnologyFormPage />} />
        <Route path="technologies/:id" element={<TechnologyFormPage />} />
        <Route path="staged" element={<StagedChangesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
