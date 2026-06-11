import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ListProvider } from './context/ListContext'
import { ContentFilterProvider } from './context/ContentFilterContext'
import { HomeDataProvider } from './context/HomeDataContext'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ListProvider>
            <HomeDataProvider>
            <ContentFilterProvider>
              <App />
            </ContentFilterProvider>
            </HomeDataProvider>
          </ListProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
