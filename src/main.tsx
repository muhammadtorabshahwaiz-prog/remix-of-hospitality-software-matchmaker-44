import "@/lib/logger";
import "@/lib/theme"; // applies the saved theme colours before the first paint
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { CompareProvider } from "@/components/compare-context"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <CompareProvider>
          <App />
        </CompareProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
