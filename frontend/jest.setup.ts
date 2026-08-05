import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true,
});

class ResizeObserverMock implements ResizeObserver {
  disconnect = jest.fn();
  observe = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: ResizeObserverMock,
  writable: true,
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  configurable: true,
  value: jest.fn(),
  writable: true,
});
