import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@components/Layout';
import { DashboardPage } from '@pages/DashboardPage';
import { StagedChangesPage } from '@pages/StagedChangesPage';
import { SettingsPage } from '@pages/SettingsPage';
// D1CV Pages
import { D1CVTechnologiesPage } from '@pages/d1cv/TechnologiesPage';
import { D1CVTechnologyFormPage } from '@pages/d1cv/TechnologyFormPage';
import { D1CVExperiencePage } from '@pages/d1cv/ExperiencePage';
import { D1CVEducationPage } from '@pages/d1cv/EducationPage';
import { ExperienceFormPage } from '@pages/d1cv/ExperienceFormPage';
import { EducationFormPage } from '@pages/d1cv/EducationFormPage';
import { ContactPage } from '@pages/d1cv/ContactPage';
import { ProfilePage } from '@pages/d1cv/ProfilePage';
import { ContentSectionPage } from '@pages/d1cv/ContentSectionPage';
// AI Agent Pages
import { AIAgentTechnologiesPage } from '@pages/ai-agent/TechnologiesPage';
import { AIAgentTechnologyDetailPage } from '@pages/ai-agent/TechnologyDetailPage';
import { AIAgentVectorizePage } from '@pages/ai-agent/VectorizePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* D1CV Routes */}
        <Route path="d1cv/technologies" element={<D1CVTechnologiesPage />} />
        <Route path="d1cv/technologies/new" element={<D1CVTechnologyFormPage />} />
        <Route path="d1cv/technologies/:name" element={<D1CVTechnologyFormPage />} />
        <Route path="d1cv/experience" element={<D1CVExperiencePage />} />
        <Route path="d1cv/experience/new" element={<ExperienceFormPage />} />
        <Route path="d1cv/experience/:id" element={<ExperienceFormPage />} />
        <Route path="d1cv/education" element={<D1CVEducationPage />} />
        <Route path="d1cv/education/new" element={<EducationFormPage />} />
        <Route path="d1cv/education/:id" element={<EducationFormPage />} />
        <Route path="d1cv/contact" element={<ContactPage />} />
        <Route path="d1cv/profile" element={<ProfilePage />} />
        <Route path="d1cv/sections/:sectionType" element={<ContentSectionPage />} />
        
        {/* AI Agent Routes */}
        <Route path="ai-agent/technologies" element={<AIAgentTechnologiesPage />} />
        <Route path="ai-agent/technologies/:stableId" element={<AIAgentTechnologyDetailPage />} />
        <Route path="ai-agent/vectorize" element={<AIAgentVectorizePage />} />
        
        {/* Staging & Settings */}
        <Route path="staged" element={<StagedChangesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        
        {/* Legacy redirect */}
        <Route path="technologies" element={<Navigate to="/d1cv/technologies" replace />} />
        <Route path="technologies/*" element={<Navigate to="/d1cv/technologies" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
