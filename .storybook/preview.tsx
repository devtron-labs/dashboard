import React from 'react'
import type { Preview } from '@storybook/react'
import '../src/css/application.scss'
import { BrowserRouter } from 'react-router-dom'

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    tags: ['autodocs'],
    decorators: (Story) => <BrowserRouter><Story /></BrowserRouter>
}

export default preview
