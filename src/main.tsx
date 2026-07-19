import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminApp } from './admin/AdminApp.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { PlatformProvider } from './context/PlatformContext'

const isAdminRoute = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider>
      {isAdminRoute ? (
        <AdminApp />
      ) : (
        <AuthProvider>
          <App />
        </AuthProvider>
      )}
    </PlatformProvider>
  </StrictMode>,
)
