/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    hsConversationsSettings?: any;
    HubSpotConversations?: any;
    hsConversationsOnReady?: any;
  }
}
