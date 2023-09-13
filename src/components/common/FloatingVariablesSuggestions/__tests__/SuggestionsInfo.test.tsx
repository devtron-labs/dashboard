import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import SuggestionsInfo from '../SuggestionsInfo'
import { URLS } from '../../../../config'

const history = createMemoryHistory()

describe('When SuggestionsInfo mounts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        history.push('/')
    })

    it('should have a button', () => {
        render(
            <Router history={history}>
                <SuggestionsInfo />
            </Router>,
        )
        expect(screen.getByRole('button')).toBeTruthy()
    })

    it('should expand content when button is clicked', () => {
        render(
            <Router history={history}>
                <SuggestionsInfo />
            </Router>,
        )
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText('@{{variablename}}')).toBeTruthy()
    })

    it('should collapse content when button is clicked twice', () => {
        render(
            <Router history={history}>
                <SuggestionsInfo />
            </Router>,
        )
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByText('@{{variablename}}')).toBeTruthy()
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByText('@{{variablename}}')).toBeFalsy()
    })

    it('should change location when Link is clicked', () => {
        render(
            <Router history={history}>
                <SuggestionsInfo />
            </Router>,
        )
        fireEvent.click(screen.getByRole('button'))
        screen.getByText('Global Configuration').click()
        expect(history.location.pathname).toBe(URLS.GLOBAL_CONFIG_SCOPED_VARIABLES)
    })
})
