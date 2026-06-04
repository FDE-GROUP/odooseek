import type { Preview } from '@storybook/tanstack-react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo'
    },

    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#0a0a0a' },
        light: { name: 'Light', value: '#ffffff' },
      },
    },
  },
};

export default preview;
