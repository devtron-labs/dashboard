import React from 'react'
import { render } from '@testing-library/react'
import VariablesList from '../VariablesList'
import { validVariablesList } from '../mocks'

describe('when VariablesList is mounted', () => {
    it('should display all the names and description', () => {
        const { container, getByText } = render(<VariablesList variablesList={validVariablesList} />)
        expect(container.querySelector('.dc__hover-n50')).toBeTruthy()
        validVariablesList.forEach((variable) => {
            expect(getByText(variable.name)).toBeTruthy()
            expect(getByText(variable.description)).toBeTruthy()
        })
    })
})
