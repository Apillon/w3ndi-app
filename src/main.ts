import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createHead } from '@vueuse/head';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';

import App from '~/App.vue';
import routes from '~pages';
import directives from './directives/';

import './assets/css/main.css';
import 'vue3-toastify/dist/index.css';

 
const app = createApp(App);

const router = createRouter({
  routes,
  history: createWebHistory(),
});
app.use(router);

app.use(createHead());

/** Messages: vue3-toastify */
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'bottom-right',
} as ToastContainerOptions);

// register all directives
directives(app);

app.mount('#app');
