import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SuggestionsInfo from '../SuggestionsInfo'
import { SCOPED_VARIABLES_DOCUMENTATION } from '../constants'

describe('When SuggestionsInfo mounts', () => {
    it('should have a button', () => {
        render(<SuggestionsInfo />)
        expect(screen.getByRole('button')).toBeTruthy()
    })

    it('should expand content when button is clicked', () => {
        render(<SuggestionsInfo />)
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText(SCOPED_VARIABLES_DOCUMENTATION)).toBeTruthy()
    })

    it('should collapse content when button is clicked twice', () => {
        render(<SuggestionsInfo />)
        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByText(SCOPED_VARIABLES_DOCUMENTATION)).toBeFalsy()
    })
})
