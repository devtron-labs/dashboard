import React from 'react'
import DeploymentTemplateOptionsTab from '../DeploymentTemplateOptionsTab'
import { fireEvent, render, screen } from '@testing-library/react'
import { DeploymentConfigContext } from '../../DeploymentConfig'

jest.mock('../DeploymentTemplateView.component', () => ({
    ChartTypeVersionOptions: () => <div data-testid="test-div"></div>,
}))

describe('DeploymentTemplateOptionsTab Component', () => {
    const mockProps = {
        isEnvOverride: false,
        codeEditorValue: 'test',
        disableVersionSelect: true,
        isValues: true,
    }

    it('should render when chartname is Rollout Deployment', () => {
        const { getByTestId } = render(
            <DeploymentConfigContext.Provider
                value={{
                    isUnSet: true,
                    // @ts-ignore
                    state: {
                        selectedTabIndex: 1,
                        unableToParseYaml: false,
                        latestDraft: '',
                        selectedChart: {
                            id: 1,
                            version: '1',
                            chartRefId: 1,
                            type: 2,
                            pipelineConfigOverrideId: 1,
                            name: 'Rollout Deployment',
                            description: 'Test Chart Description',
                            isAppMetricsSupported: false,
                        },
                    },
                    dispatch: jest.fn(),
                    isConfigProtectionEnabled: true,
                    changeEditorMode: jest.fn(),
                }}
            >
                <DeploymentTemplateOptionsTab {...mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        expect(getByTestId('deployment-template-options-tab')).toBeTruthy()
        expect(screen.getByText('Basic')).toBeTruthy()
        expect(screen.getByText('Advanced (YAML)')).toBeTruthy()
    })
    it('should render when chartname is Rollout Deployment', async () => {
        const { getByTestId } = render(
            <DeploymentConfigContext.Provider
                value={{
                    isUnSet: true,
                    // @ts-ignore
                    state: {
                        selectedTabIndex: 1,
                        unableToParseYaml: false,
                        latestDraft: '',
                        selectedChart: {
                            id: 1,
                            version: '1',
                            chartRefId: 1,
                            type: 2,
                            pipelineConfigOverrideId: 1,
                            name: 'Deployment',
                            description: 'Test Chart Description',
                            isAppMetricsSupported: false,
                        },
                    },
                    dispatch: jest.fn(),
                    isConfigProtectionEnabled: true,
                    changeEditorMode: jest.fn(),
                }}
            >
                <DeploymentTemplateOptionsTab {...mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        expect(getByTestId('deployment-template-options-tab')).toBeTruthy()
        expect(screen.getByText('Basic')).toBeTruthy()
        expect(screen.getByText('Advanced (YAML)')).toBeTruthy()
    })
    it('should render error when unable To Parse Yaml', () => {
        const { getByTestId } = render(
            <DeploymentConfigContext.Provider
                value={{
                    isUnSet: true,
                    // @ts-ignore
                    state: {
                        selectedTabIndex: 1,
                        unableToParseYaml: true,
                        latestDraft: '',
                        selectedChart: {
                            id: 1,
                            version: '1',
                            chartRefId: 1,
                            type: 2,
                            pipelineConfigOverrideId: 1,
                            name: 'Rollout Deployment',
                            description: 'Test Chart Description',
                            isAppMetricsSupported: false,
                        },
                    },
                    dispatch: jest.fn(),
                    isConfigProtectionEnabled: true,
                    changeEditorMode: jest.fn(),
                }}
            >
                <DeploymentTemplateOptionsTab {...mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        expect(getByTestId('tippy-error')).toBeTruthy()
    })
    it('should show tippy inavalid yaml msg when unable To Parse Yaml', () => {
        const { getByTestId, getByText } = render(
            <DeploymentConfigContext.Provider
                value={{
                    isUnSet: true,
                    // @ts-ignore
                    state: {
                        selectedTabIndex: 1,
                        unableToParseYaml: true,
                        latestDraft: '',
                        selectedChart: {
                            id: 1,
                            version: '1',
                            chartRefId: 1,
                            type: 2,
                            pipelineConfigOverrideId: 1,
                            name: 'Rollout Deployment',
                            description: 'Test Chart Description',
                            isAppMetricsSupported: false,
                        },
                    },
                    dispatch: jest.fn(),
                    isConfigProtectionEnabled: true,
                    changeEditorMode: jest.fn(),
                }}
            >
                <DeploymentTemplateOptionsTab {...mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        const basicOption = getByTestId('base-deployment-template-basic-button')
        fireEvent.click(basicOption)
        expect(getByText('Invalid YAML')).toBeTruthy()
    })
})
