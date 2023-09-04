import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import SavedVariablesView from '../SavedVariables'
import { validScopedVariablesData } from '../mocks'
import { downloadData } from '../utils'
import { ScopedVariablesDataInterface } from '../types'
import { useClickOutside, useFileReader } from '../../common'

jest.mock('../../CodeEditor/CodeEditor', () => jest.fn(() => <div></div>))
jest.mock('../utils', () => ({
    downloadData: jest.fn(),
    parseIntoYAMLString: jest.fn(() => 'YAML'),
}))

jest.mock('../../common', () => ({
    importComponentFromFELibrary: jest.fn(),
    useClickOutside: jest.fn(),
    useFileReader: jest.fn(),
}))

describe('SavedVariables', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render YAML view by default', () => {
        ;(useFileReader as jest.Mock).mockResolvedValue({
            readFile: jest.fn(),
            fileData: 'fileData',
            progress: 100,
            abortRead: jest.fn(),
            status: {
                status: true,
                message: 'SUCCESS',
            },
        })
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
        ;(useFileReader as jest.Mock).mockResolvedValue({
            readFile: jest.fn(),
            fileData: 'fileData',
            progress: 100,
            abortRead: jest.fn(),
            status: {
                status: true,
                message: 'SUCCESS',
            },
        })
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
        ;(useFileReader as jest.Mock).mockResolvedValue({
            readFile: jest.fn(),
            fileData: 'fileData',
            progress: 100,
            abortRead: jest.fn(),
            status: {
                status: true,
                message: 'SUCCESS',
            },
        })
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
        ;(useFileReader as jest.Mock).mockResolvedValue({
            readFile: jest.fn(),
            fileData: 'fileData',
            progress: 100,
            abortRead: jest.fn(),
            status: {
                status: true,
                message: 'SUCCESS',
            },
        })
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
        ;(useFileReader as jest.Mock).mockResolvedValue({
            readFile: jest.fn(),
            fileData: 'fileData',
            progress: 100,
            abortRead: jest.fn(),
            status: {
                status: true,
                message: 'SUCCESS',
            },
        })
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
        expect(useClickOutside).toHaveBeenCalled()
    })
})
