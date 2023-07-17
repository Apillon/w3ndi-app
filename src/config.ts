const CONFIG = ref(import.meta.env);
console.log(CONFIG.value);

// Change to test / main as needed
export const DEV = CONFIG.value.DEV;
export const APP_NAME = CONFIG.value.VITE_APP_TITLE;
export const BASE_URL = CONFIG.value.VITE_BASE_URL;
export const API_URL = CONFIG.value.VITE_API_URL;
export const OAUTH_APP_URL = CONFIG.value.VITE_OAUTH_APP_URL;
export const KILT_NETWORK = CONFIG.value.VITE_KILT_NETWORK;