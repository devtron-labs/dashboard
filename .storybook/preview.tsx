import React from 'react'
import type { Preview } from '@storybook/react'
import '../src/css/application.scss'
import '../src/css/colorPalette.scss'
import { BrowserRouter } from 'react-router-dom'
import { ToastManagerContainer } from '@devtron-labs/devtron-fe-common-lib'

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            values: [
                {
                    name: 'Light',
                    value: 'var(--N0)',
                },
                {
                    name: 'Dark',
                    value: 'var(--N700)',
                },
            ],
            default: 'Light',
        },
    },
    tags: ['autodocs'],
    decorators: (Story) => (
        <>
            <BrowserRouter>
                <Story />
            </BrowserRouter>
            <ToastManagerContainer />
        </>
    ),
}

export default preview
