import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import SavedVariablesView from '../SavedVariables'
import { validScopedVariablesData } from '../mocks'
import { downloadData } from '../utils/helpers'
import { ScopedVariablesDataInterface } from '../types'

jest.mock('../../CodeEditor/CodeEditor', () => jest.fn(() => <div></div>))
jest.mock('../utils/helpers', () => ({
    downloadData: jest.fn(),
    parseIntoYAMLString: jest.fn(() => 'YAML'),
}))
jest.mock('../../common', () => ({
    importComponentFromFELibrary: jest.fn(),
}))

describe('SavedVariables', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render YAML view by default', () => {
        const { container } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataInterface}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        expect(container.querySelector('.scoped-variables-active-tab')?.textContent).toBe('YAML')
    })

    it('should render Variable List view when Variable List tab is clicked', () => {
        const { container } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataInterface}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        const variableListTab = container.querySelector('.scoped-variables-tab:nth-child(2)')
        fireEvent.click(variableListTab as Element)
        expect(container.querySelector('.scoped-variables-active-tab')?.textContent).toBe('Variable List')
        const yamlTab = container.querySelector('.scoped-variables-tab:nth-child(1)')
        fireEvent.click(yamlTab as Element)
        expect(container.querySelector('.scoped-variables-active-tab')?.textContent).toBe('YAML')
    })

    it('should download saved file when download saved file button is clicked from dropdown', () => {
        const { container, getByTestId } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataInterface}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        const dropdownButton = getByTestId('dropdown-btn')
        fireEvent.click(dropdownButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeTruthy()
        const downloadButton = container.querySelector('.scoped-variables-editor-infobar__dropdown-item:nth-child(1)')
        expect(downloadButton?.innerHTML).toBe('Download saved file')
        expect(downloadData).not.toHaveBeenCalled()
        fireEvent.click(downloadButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeFalsy()
    })

    it('should download template file when download template file button is clicked from dropdown', () => {
        const { container, getByTestId } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataInterface}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        const dropdownButton = getByTestId('dropdown-btn')
        fireEvent.click(dropdownButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeTruthy()
        const downloadButton = container.querySelector('.scoped-variables-editor-infobar__dropdown-item:nth-child(2)')
        expect(downloadButton?.innerHTML).toBe('Download template')
        expect(downloadData).not.toHaveBeenCalled()
        fireEvent.click(downloadButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeFalsy()
    })

    it('should close dropdown when dropdown is open and somewhere outside is clicked', () => {
        const { container, getByTestId } = render(
            <SavedVariablesView
                scopedVariablesData={validScopedVariablesData.result.manifest as ScopedVariablesDataInterface}
                setScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                reloadScopedVariables={() => {}}
            />,
        )
        const dropdownButton = getByTestId('dropdown-btn')
        fireEvent.click(dropdownButton as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeTruthy()
        fireEvent.click(container.querySelector('input') as Element)
        expect(container.querySelector('.scoped-variables-editor-infobar__dropdown')).toBeFalsy()
    })
})
