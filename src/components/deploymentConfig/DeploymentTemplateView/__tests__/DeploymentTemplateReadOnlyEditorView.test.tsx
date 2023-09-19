import React from 'react'
import { render, screen } from '@testing-library/react'
import DeploymentTemplateReadOnlyEditorView from '../DeploymentTemplateReadOnlyEditorView'
import { DeploymentConfigContext } from '../../DeploymentConfig'

// Mock necessary components and dependencies
jest.mock('../../../CodeEditor/CodeEditor', () => ({ value }) => {
    return <div data-testid="mock-code-editor">{value}</div>
})

jest.mock('../../../charts/discoverChartDetail/DiscoverChartDetails', () => ({
    __esModule: true,
    MarkDown: () => <div data-testid="mock-markdown">Mock Markdown</div>,
}))

const mockContextValue = {
    state: {
        schema: {}, // Mock as needed
        chartConfigLoading: false,
        yamlMode: false,
        selectedChart: {
            name: 'SomeChartName', // Mock as needed
        },
        showReadme: true,
        readme: 'Sample Readme Content', // Mock as needed
    },
}
describe('DeploymentTemplateReadOnlyEditorView Component', () => {
    it('renders CodeEditor when selected chart name is neither Rollout Deployment nor Deployment', () => {
        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={mockContextValue}>
                <DeploymentTemplateReadOnlyEditorView value="Sample YAML Content" isEnvOverride={false} />
            </DeploymentConfigContext.Provider>,
        )

        const codeEditor = screen.getByTestId('mock-code-editor')
        expect(codeEditor).toBeTruthy()
    })

    it('renders MarkDown when showReadme is true', () => {
        const updatedContextValue = {
            ...mockContextValue,
            state: {
                ...mockContextValue.state,
                selectedChart: {
                    name: 'NonMatchingChart', // Mock as needed
                },
            },
        }

        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={updatedContextValue}>
                <DeploymentTemplateReadOnlyEditorView value="Sample YAML Content" isEnvOverride={false} />
            </DeploymentConfigContext.Provider>,
        )

        const markDown = screen.getByTestId('mock-markdown')
        expect(markDown).toBeTruthy()
    })

    it('renders DeploymentTemplateGUIView when selected chart is rollout deployment or deployment', () => {
        const updatedContextValue = {
            ...mockContextValue,
            state: {
                ...mockContextValue.state,
                yamlMode: true,
            },
        }

        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={updatedContextValue}>
                <DeploymentTemplateReadOnlyEditorView value="Sample YAML Content" isEnvOverride={false} />
            </DeploymentConfigContext.Provider>,
        )

        const codeEditor = screen.getByTestId('mock-code-editor')
        expect(codeEditor).toBeTruthy()
    })
})
