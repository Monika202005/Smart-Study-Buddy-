import '@testing-library/jest-dom';

// Polyfill localStorage for Node 22 + Vitest JSDOM
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  writable: true,
  configurable: true,
});

// Polyfill scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = function () {};
