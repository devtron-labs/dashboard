import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ClipboardButton from '../ClipboardButton'

jest.mock('../../helpers/Helpers', () => ({
    copyToClipboard: jest.fn().mockImplementation((content, callback) => {
        callback()
    }),
}))

describe('When ClipboardButton mounts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should show the copy icon', () => {
        render(
            <ClipboardButton content="test" copiedTippyText="test" duration={1000} trigger={false} setTrigger={null} />,
        )
        expect(screen.getByRole('button')).toBeTruthy()
    })

    it('should show tippy on hover', () => {
        render(
            <ClipboardButton content="test" copiedTippyText="test" duration={1000} trigger={false} setTrigger={null} />,
        )
        fireEvent.mouseEnter(screen.getByRole('button'))
        expect(screen.getByText('Copy')).toBeTruthy()
    })

    it('should show copiedTippyText when trigger is true', () => {
        render(<ClipboardButton content="test" copiedTippyText="test" duration={1000} trigger setTrigger={null} />)
        expect(screen.getByText('test')).toBeTruthy()
    })

    it('should call copyToClipboard when clicked', () => {
        render(
            <ClipboardButton content="test" copiedTippyText="test" duration={1000} trigger={false} setTrigger={null} />,
        )
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText('test')).toBeTruthy()
    })
})
