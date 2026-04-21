import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {InputBuildingContextProvider} from "@/providers/InputBuildingContextProvider.tsx";
import {OutputBuildingContextProvider} from "@/providers/OutputBuildingContextProvider.tsx";
import { ThemeProvider } from "@/contexts/ThemeContext";

createRoot(document.getElementById('root')!).render(

  <StrictMode>
      <ThemeProvider>
          <InputBuildingContextProvider>
            <OutputBuildingContextProvider>
                <App />
            </OutputBuildingContextProvider>
          </InputBuildingContextProvider>
      </ThemeProvider>
  </StrictMode>,
)
