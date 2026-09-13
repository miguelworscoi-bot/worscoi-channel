import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@/lib/firebase';
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

// Global safety net for browser media error logs and YouTube iframe embed restrictions
function isSuppressedMediaError(errOrEvent: unknown): boolean {
  if (!errOrEvent) return false;
  if (typeof errOrEvent === 'object') {
    const obj = errOrEvent as Record<string, unknown>;
    if (obj.data === 150 || obj.data === 101 || obj.data === 100 || obj.data === 2 || obj.data === 5) {
      return true;
    }
    if (obj.target && typeof obj.target === 'object' && 'playerInfo' in (obj.target as Record<string, unknown>)) {
      return true;
    }
    if ('playerInfo' in obj || 'errorCode' in obj) {
      return true;
    }
  }

  const str = String(
    (typeof errOrEvent === 'object' && errOrEvent !== null
      ? (errOrEvent as { message?: string; error?: { message?: string } }).message ||
        (errOrEvent as { error?: { message?: string } }).error?.message ||
        JSON.stringify(errOrEvent)
      : errOrEvent) || ''
  );

  return (
    str.includes('interrupted by a new load request') ||
    str.includes('interrupted because the media was removed') ||
    str.includes('play() request was interrupted') ||
    str.includes('AbortError') ||
    str.includes('NotAllowedError') ||
    str.includes('playerInfo') ||
    str.includes('debug_videoId') ||
    str.includes('"data":150') ||
    str.includes('"data":101') ||
    str.includes('"errorCode":"auth"')
  );
}

window.addEventListener('error', (event) => {
  if (isSuppressedMediaError(event) || isSuppressedMediaError(event.error)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (isSuppressedMediaError(event.reason)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
});

// Capture and suppress window.onerror for legacy/iframe callback dispatch
const prevOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (isSuppressedMediaError(message) || isSuppressedMediaError(error)) {
    return true; // suppresses the error
  }
  if (prevOnError) {
    return prevOnError(message, source, lineno, colno, error);
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
