import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept HTMLMediaElement.prototype.play to prevent unhandled interruption errors
if (typeof HTMLMediaElement !== 'undefined') {
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    try {
      const promise = originalPlay.apply(this, args);
      if (promise && typeof promise.catch === 'function') {
        return promise.catch((err: unknown) => {
          const errObj = err as { name?: string; message?: string } | null;
          const msg = errObj?.message || String(err || '');
          if (
            errObj?.name === 'AbortError' ||
            errObj?.name === 'NotAllowedError' ||
            msg.includes('interrupted') ||
            msg.includes('play()')
          ) {
            // Silently suppress expected media playback interruptions
            return;
          }
          throw err;
        });
      }
      return promise;
    } catch (err: unknown) {
      const errObj = err as { name?: string; message?: string } | null;
      const msg = errObj?.message || String(err || '');
      if (
        errObj?.name === 'AbortError' ||
        errObj?.name === 'NotAllowedError' ||
        msg.includes('interrupted') ||
        msg.includes('play()')
      ) {
        return Promise.resolve();
      }
      throw err;
    }
  };
}

// Global safety net for browser media error logs
window.addEventListener('error', (event) => {
  const msg = String(event.message || event.error?.message || '');
  if (
    msg.includes('interrupted by a new load request') ||
    msg.includes('interrupted because the media was removed') ||
    msg.includes('play() request was interrupted')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = typeof reason === 'string' ? reason : reason?.message || String(reason || '');
  if (
    reason?.name === 'AbortError' ||
    reason?.name === 'NotAllowedError' ||
    msg.includes('interrupted by a new load request') ||
    msg.includes('interrupted because the media was removed') ||
    msg.includes('play() request was interrupted')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
