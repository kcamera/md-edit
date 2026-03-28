import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.mdEdit.app',
  productName: 'md-edit',
  copyright: `Copyright © ${new Date().getFullYear()}`,
  directories: {
    output: 'dist',
    buildResources: 'resources'
  },
  files: ['out/**/*'],
  extraMetadata: {
    main: 'out/main/index.js'
  },
  fileAssociations: [
    {
      ext: 'md',
      name: 'Markdown File',
      role: 'Editor'
    },
    {
      ext: 'markdown',
      name: 'Markdown File',
      role: 'Editor'
    }
  ],
  mac: {
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] }
    ],
    icon: 'resources/icon.icns',
    category: 'public.app-category.productivity',
    hardenedRuntime: true,
    entitlements: 'resources/entitlements.mac.plist',
    entitlementsInherit: 'resources/entitlements.mac.plist',
    gatekeeperAssess: false
  },
  dmg: {
    title: 'md-edit',
    window: { width: 540, height: 380 },
    contents: [
      { x: 130, y: 220, type: 'file' },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ]
  },
  linux: {
    target: [
      { target: 'AppImage', arch: ['x64'] },
      { target: 'deb', arch: ['x64'] }
    ],
    icon: 'resources/icon.png',
    category: 'Office',
    synopsis: 'A desktop markdown editor',
    mimeTypes: ['text/markdown', 'text/x-markdown']
  }
}

export default config
