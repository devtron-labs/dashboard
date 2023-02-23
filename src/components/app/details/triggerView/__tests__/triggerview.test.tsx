import React from 'react'
import TriggerView from '../TriggerView'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

describe('Trigger View', () => {
    it('Render Trigger View', () => {
        const { container } = render(<TriggerView />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()
    })
})
