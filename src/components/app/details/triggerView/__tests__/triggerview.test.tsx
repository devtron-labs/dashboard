import React from 'react'
import TriggerView from '../TriggerView'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
describe('Trigger View', () => {
    it('Render Trigger View without crashing', () => {
        const { container } = render(<TriggerView />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()
    })
    // it('Finish config message appearing without breaking when no workflow is configured',async () => {
    //     expect(screen.findByText('Go To App Configurations')).toBeInTheDocument
    // })
    // it('Select Image button for a cd must appear without breaking',async () => {
    //     expect(screen.findByText('Select Image')).toBeInTheDocument
    // })
})
