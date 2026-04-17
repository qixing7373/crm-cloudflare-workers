/**
 * @file   rsbuild.config.ts — Rsbuild 构建配置
 * @desc   CDN 外部化（vue/router/i18n/axios）+ AntD 按需导入 + 代理
 * @ref    https://github.com/webees/rsbuild-vue3-vant4/blob/main/rsbuild.config.ts
 */
import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import AutoImport from 'unplugin-auto-import/rspack'
import Components from 'unplugin-vue-components/rspack'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  dev: {
    lazyCompilation: false,
    setupMiddlewares: [
      (middlewares: any) => {
        middlewares.unshift((req: any, res: any, next: any) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          next()
        })
      }
    ]
  },
  output: {
    externals: {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      'vue-i18n': 'VueI18n',
      axios: 'axios'
    }
  },
  html: {
    title: undefined,
    meta: undefined,
    template: 'public/index.html'
  },
  server: {
    port: 7777,
    historyApiFallback: true,
    proxy: {
      '/api': 'http://127.0.0.1:8888',
      '/auth': 'http://127.0.0.1:8888'
    }
  },
  resolve: {
    alias: {
      '@': './src',
      '@shared': '../api/shared',
      '@i18n': './src/vue-i18n.ts',
      '@pinia': './src/vue-pinia.ts',
      '@router': './src/vue-router.ts'
    }
  },
  plugins: [pluginVue()],
  tools: {
    rspack: {
      module: {
        parser: {
          javascript: {
            // 忽略 sqlite-wasm 内部的动态依赖警告
            exprContextCritical: false
          }
        }
      },
      plugins: [
        AutoImport({
          imports: [
            'vue',
            'vue-router',
            'vue-i18n',
            'pinia',
            {
              'naive-ui': [
                'useDialog',
                'useMessage',
                'useNotification',
                'useLoadingBar'
              ]
            }
          ],
          dts: 'src/types/auto-imports.d.ts'
        }),
        Components({
          dirs: ['src/components'],
          resolvers: [NaiveUiResolver()],
          dts: 'src/types/components.d.ts'
        })
      ]
    }
  }
})
