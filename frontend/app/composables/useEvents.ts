import mitt from "mitt";

const LOG_EVENTS = true; // Set this to false to disable logging

const emitter = mitt();

export const sendEvent = (type: string, event?: unknown) => {
  if (LOG_EVENTS && useRuntimeConfig().public.isDev) {
    console.log(`Event emitted: ${type} with data:`, event);
  }
  emitter.emit(type, event);
};

export const useListen = (type: string, handler: (event: unknown) => void) => {
  if (LOG_EVENTS && useRuntimeConfig().public.isDev) {
    console.log(`Listener on: ${type}`);
  }
  emitter.on(type, handler);
};

export const useStopListen = (
  type: string,
  handler?: (event: unknown) => void,
) => {
  if (LOG_EVENTS && useRuntimeConfig().public.isDev) {
    console.log(`Listener off: ${type}`);
  }
  emitter.off(type, handler);
};
