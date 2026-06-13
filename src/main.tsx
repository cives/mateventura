import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { validateContent } from './schemas/contentValidation';

const contentErrors = validateContent();
if (contentErrors.length > 0) {
  throw new Error(`Contenido local inválido: ${contentErrors.join('; ')}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
