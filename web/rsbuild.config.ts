/**
 * @file   rsbuild.config.ts — Rsbuild 构建配置
 * @desc   Naive UI 按需导入 + 本地化首屏资源 + 开发代理
 * @ref    https://github.com/webees/rsbuild-vue3-vant4/blob/main/rsbuild.config.ts
 */
import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import AutoImport from 'unplugin-auto-import/rspack'
import Components from 'unplugin-vue-components/rspack'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

function readPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
    return String(pkg.version || '0.0.0')
  } catch {
    return '0.0.0'
  }
}

function readCommitSha() {
  const sha =
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA
  if (sha) return sha.slice(0, 8)

  try {
    return execSync('git rev-parse --short=8 HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return 'dev'
  }
}

const appVersion = `${readPackageVersion()}+${readCommitSha()}`

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
  source: {
    define: {
      'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(appVersion)
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
