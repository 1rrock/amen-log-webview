import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'gido-ai',
  brand: {
    displayName: '아멘 로그', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://static.toss.im/appsintoss/9817/4132a51c-5b1b-4863-bb01-e15375f317fb.png'
  },
  web: {
    host: '192.168.45.147',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    initialAccessoryButton: {
      id: 'logo',
      title: '로고',
      icon: {
        name: 'icon-emoji-folded-handsㄴ-mono',
      },
    },
  },
});
