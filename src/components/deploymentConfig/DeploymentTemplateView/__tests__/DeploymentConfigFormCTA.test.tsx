import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import DeploymentConfigFormCTA from '../DeploymentConfigFormCTA'
import { DeploymentConfigContext } from '../../DeploymentConfig'

describe('DeploymentConfigFormCTA', () => {
    const mockContextValue = {
        state: {
            loading: false,
            chartConfig: {},
            latestDraft: {
                draftState: 4,
                canApprove: false,
            },
            selectedTabIndex: 2,
            showReadme: false,
            selectedChart: {
                id: '1',
                name: 'test',
                version: '1.0.0',
            },
        },
        isConfigProtectionEnabled: false,
    }

    const defaultProps = {
        loading: false,
        showAppMetricsToggle: true,
        isAppMetricsEnabled: true,
        isEnvOverride: false,
        isCiPipeline: false,
        disableCheckbox: false,
        disableButton: false,
        toggleAppMetrics: jest.fn(),
        isPublishedMode: false,
        reload: jest.fn(),
        isValues: false,
    }

    it('renders the component with Save & Next button when not in environment override mode', () => {
        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={mockContextValue}>
                <DeploymentConfigFormCTA {...defaultProps} />
            </DeploymentConfigContext.Provider>,
        )

        expect(screen.getByTestId('base-deployment-template-save-and-next-button')).toBeTruthy()
    })

    it('renders the component with "Approve Changes" button when in environment override mode', () => {
        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={mockContextValue}>
                <DeploymentConfigFormCTA {...defaultProps} isEnvOverride={true} />
            </DeploymentConfigContext.Provider>,
        )

        expect(screen.getByText('Approve changes')).toBeTruthy()
    })

    it('renders the Application Metrics section with "Enabled" when metrics are enabled', () => {
        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={mockContextValue}>
                <DeploymentConfigFormCTA {...defaultProps} />
            </DeploymentConfigContext.Provider>,
        )

        expect(screen.getByText('Enabled')).toBeTruthy()
    })

    it('renders the Application Metrics section with "Not enabled" when metrics are disabled', () => {
        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={mockContextValue}>
                <DeploymentConfigFormCTA {...defaultProps} isAppMetricsEnabled={false} />
            </DeploymentConfigContext.Provider>,
        )

        expect(screen.getByText('Not enabled')).toBeTruthy()
    })

    it('renders the component with "Save Changes..." button when config protection is enabled', () => {
        const _mockContextValue = {
            state: {
                ...mockContextValue.state,
                selectedTabIndex: 1,
            },
            isConfigProtectionEnabled: true,
        }

        const _defaultProps = {
            ...defaultProps,
            isEnvOverride: true,
        }

        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={_mockContextValue}>
                <DeploymentConfigFormCTA {..._defaultProps} />
            </DeploymentConfigContext.Provider>,
        )

        expect(screen.getByText('Save changes...')).toBeTruthy()
    })
    it('renders the button with Save & Next text', () => {
        const _mockContextValue = {
            state: {
                ...mockContextValue.state,
                selectedTabIndex: 1,
            },
        }

        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={_mockContextValue}>
                <DeploymentConfigFormCTA {...defaultProps} />
            </DeploymentConfigContext.Provider>,
        )

        const button = screen.getByText('Save & Next')
        expect(button).toBeTruthy()
    })

    it('renders the button with Save changes text', () => {
        const _mockContextValue = {
            state: {
                ...mockContextValue.state,
                selectedTabIndex: 1,
            },
        }

        const _defaultProps = {
            ...defaultProps,
            isEnvOverride: true,
        }
        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={_mockContextValue}>
                <DeploymentConfigFormCTA {..._defaultProps} />
            </DeploymentConfigContext.Provider>,
        )

        const button = screen.getByText('Save changes')
        expect(button).toBeTruthy()
    })

    it('renders the disabled button when in manifest view', () => {
        const _mockContextValue = {
            state: {
                ...mockContextValue.state,
                selectedTabIndex: 1, // to make isApprovalPending false
            },
        }
        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={_mockContextValue}>
                <DeploymentConfigFormCTA {...defaultProps} isValues={false} />
            </DeploymentConfigContext.Provider>,
        )

        const button = screen.getByText('Save & Next')
        expect(button).toBeTruthy()
        // @ts-ignore
        expect(button.disabled).toEqual(true)
    })
    it('should render loading components when loading is true', () => {
        render(
            // @ts-ignore
            <DeploymentConfigContext.Provider value={mockContextValue}>
                <DeploymentConfigFormCTA {...defaultProps} loading={true} />
            </DeploymentConfigContext.Provider>,
        )

        expect(screen.getByTestId('progressing')).toBeTruthy()
    })
})
