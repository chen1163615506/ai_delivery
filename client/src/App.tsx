import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import SpaceSettingsPage from './pages/SpaceSettingsPage';
import TaskBoardPage from './pages/TaskBoardPage';
import TaskDetailPage from './pages/TaskDetailPage';
import SpaceKnowledgePage from './pages/SpaceKnowledgePage';
import { SpaceProvider } from './contexts/SpaceContext';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <SpaceProvider>
        <BrowserRouter basename="/ai_delivery">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="task-board" element={<TaskBoardPage />} />
              <Route path="space-knowledge" element={<SpaceKnowledgePage />} />
              <Route path="space-settings" element={<SpaceSettingsPage />} />
              <Route path="tasks/:taskId" element={<TaskDetailPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SpaceProvider>
    </ConfigProvider>
  );
}

export default App;

