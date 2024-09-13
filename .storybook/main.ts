import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: [
        {
            directory: '../src/stories',
            files: '*.stories.@(ts|tsx)',
            titlePrefix: 'Design System/',
        },
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@chromatic-com/storybook',
        '@storybook/addon-interactions',
        '@storybook/addon-a11y',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    typescript: {
        // Disabled to prevent connection lost issue while linking common lib locally
        reactDocgen: false,
    },
    core: {
        disableTelemetry: true,
    },
}
export default config
