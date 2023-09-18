import React from 'react'
import DeploymentTemplateGUIView from '../DeploymentTemplateGUIView'
import { fireEvent, render, screen } from '@testing-library/react'
import { DeploymentConfigContext } from '../../DeploymentConfig'

describe('DeploymentTemplateGUIView Component', () => {
    const mockProps = {
        fetchingValues: false,
        value: 'test',
        readOnly: false,
    }

    it('should render properly when loading state is false', () => {
        render(
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
                <DeploymentTemplateGUIView {...mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        expect(screen.getByText('Container Port')).toBeTruthy()
    })
    it('should render progress loader when in loading state', () => {
        const _mockProps = {
            fetchingValues: true,
            value: 'test',
            readOnly: false,
        }
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
                <DeploymentTemplateGUIView {..._mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        expect(getByTestId('loading-gui-view')).toBeTruthy()
    })
    it('should render error msgs when inputs are invalid', () => {
        const { queryAllByText } = render(
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
                        //@ts-ignore
                        basicFieldValuesErrorObj: {
                            port: {
                                isValid: false,
                                message: 'This is required field',
                            },
                            cpu: {
                                isValid: false,
                                message: 'This is required fieldror',
                            },
                            memory: {
                                isValid: false,
                                message: 'This is required field',
                            },
                        },
                    },
                    dispatch: jest.fn(),
                    isConfigProtectionEnabled: true,
                    changeEditorMode: jest.fn(),
                }}
            >
                <DeploymentTemplateGUIView {...mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        expect(queryAllByText('This is required field')).toBeTruthy()
    })
    it('should render input and textarea to add new variable, when clicked on add variable', () => {
        const { getByTestId, getByText } = render(
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
                        basicFieldValues: {
                            envVariables: [
                                {
                                    name: 'test',
                                    index: 1,
                                },
                            ],
                            hosts: [
                                {
                                    name: 'test',
                                    index: 1,
                                },
                            ],
                            resources: {
                                limits: {
                                    cpu: 'test',
                                    memory: 'test',
                                },
                            },
                        },
                        //@ts-ignore
                        basicFieldValuesErrorObj: {
                            port: {
                                isValid: true,
                                message: 'This is required field',
                            },
                            cpu: {
                                isValid: true,
                                message: 'This is required fieldror',
                            },
                            memory: {
                                isValid: true,
                                message: 'This is required field',
                            },
                            envVariables: [],
                        },
                    },
                    dispatch: jest.fn(),
                    isConfigProtectionEnabled: true,
                    changeEditorMode: jest.fn(),
                }}
            >
                <DeploymentTemplateGUIView {...mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        fireEvent.click(getByTestId('environment-variable-addvariable-button'))
        expect(getByTestId('environment-variable-name')).toBeTruthy()
        expect(getByTestId('environment-variable-value')).toBeTruthy()
    })
    it('should render host & path input fields when HTTP Requests Routes toggle is on', () => {
        const { getByTestId, getByText } = render(
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
                        basicFieldValues: {
                            envVariables: [
                                {
                                    name: 'test',
                                    index: 1,
                                },
                            ],
                            hosts: [
                                {
                                    name: 'test',
                                    index: 1,
                                },
                            ],
                            resources: {
                                limits: {
                                    cpu: 'test',
                                    memory: 'test',
                                },
                            },
                            enabled: true,
                        },
                        //@ts-ignore
                        basicFieldValuesErrorObj: {
                            port: {
                                isValid: true,
                                message: 'This is required field',
                            },
                            cpu: {
                                isValid: true,
                                message: 'This is required fieldror',
                            },
                            memory: {
                                isValid: true,
                                message: 'This is required field',
                            },
                            envVariables: [],
                        },
                    },
                    dispatch: jest.fn(),
                    isConfigProtectionEnabled: true,
                    changeEditorMode: jest.fn(),
                }}
            >
                <DeploymentTemplateGUIView {...mockProps} />
            </DeploymentConfigContext.Provider>,
        )
        fireEvent.click(getByTestId('handle-toggle-button'))
        expect(getByText('Host')).toBeTruthy()
        expect(getByText('Path')).toBeTruthy()
    })
})
