import path from 'path';

import Vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite';
import Pages from 'vite-plugin-pages';
import Layouts from 'vite-plugin-vue-layouts';
import legacy from '@vitejs/plugin-legacy';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ViteWebfontDownload } from 'vite-plugin-webfont-dl';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig(({ command, mode }) => {
  const envMode = command === 'serve' ? mode : process.env.NODE_ENV || mode || 'production';
  process.env = { ...process.env, ...loadEnv(envMode.trim().toLowerCase(), process.cwd()) };

  const config = {
    resolve: {
      alias: {
        '~/': `${path.resolve(__dirname, 'src')}/`,
      },
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
    },
    build: {
      rollupOptions: {
        plugins: [],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
    plugins: [
      Vue(),
      Pages(),
      Layouts({
        layoutsDirs: 'src/layouts',
        defaultLayout: 'default',
      }),
      AutoImport({
        imports: ['vue', 'vue-router', '@vueuse/head', '@vueuse/core'],
        dirs: ['./src/lib/**'],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        dts: 'src/components.d.ts',
      }),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      ViteWebfontDownload([
        'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@700&family=IBM+Plex+Sans:wght@400;700&display=swap',
      ]),
    ]
  };
  const serveConfig = {
    server: {
      host: '127.0.0.1',
    },
  };

  return command === 'serve' ? { ...config, ...serveConfig } : config;
})