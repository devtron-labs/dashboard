import React from 'react'
import { render } from '@testing-library/react'
import { CompareWithApprovalPendingAndDraft } from '../DeploymentTemplateView.component'

describe('CompareWithApprovalPendingAndDraft Component', () => {
    const mockProps = {
        isEnvOverride: true,
        overridden: true,
        readOnly: false,
        environmentName: 'Test Environment',
        selectedChart: {
            id: 1,
            version: '1',
            chartRefId: 1,
            type: 2,
            pipelineConfigOverrideId: 1,
            name: 'Test Chart',
            description: 'Test Chart Description',
            isAppMetricsSupported: false,
        },
        handleOverride: jest.fn(),
        latestDraft: {
            action: 1,
        },
        isPublishedOverriden: true,
        isDeleteDraftState: false,
        setShowDraftData: jest.fn(),
        isValues: true,
        selectedOptionDraft: {
            label: 'Approval Pending',
            id: 1,
        },
        setSelectedOptionDraft: jest.fn(),
    }

    it('renders when in isApprovalPending state', async () => {
        const { getByTestId, getByText } = render(<CompareWithApprovalPendingAndDraft {...mockProps} />)
        expect(getByTestId('approval-draft-dropdown')).toBeTruthy()
        expect(getByText('Approval Pending')).toBeTruthy()
    })
    it('renders delete override option in draft state, in overriden state', async () => {
        const { getByText } = render(<CompareWithApprovalPendingAndDraft {...mockProps} />)
        expect(getByText('Delete override')).toBeTruthy()
    })
    it('renders Allow override option in draft state, when not overriden', async () => {
        const _mockProps = {
            ...mockProps,
            overridden: false,
        }
        const { getByText } = render(<CompareWithApprovalPendingAndDraft {..._mockProps} />)
        expect(getByText('Allow override')).toBeTruthy()
    })
    it('should not render delete overriden is not in values state', async () => {
        const _mockProps = {
            ...mockProps,
            isValues: false,
        }
        const { queryByText } = render(<CompareWithApprovalPendingAndDraft {..._mockProps} />)
        expect(queryByText('Delete override')).toBeFalsy()
    })
    it('should not render Allow override is not in values state', async () => {
        const _mockProps = {
            ...mockProps,
            isValues: false,
            overridden: false,
        }
        const { queryByText } = render(<CompareWithApprovalPendingAndDraft {..._mockProps} />)
        expect(queryByText('Allow override')).toBeFalsy()
    })
    it('should render read only icon when in read only state', async () => {
        const _mockProps = {
            ...mockProps,
            readOnly: true,
        }
        const { getByTestId } = render(<CompareWithApprovalPendingAndDraft {..._mockProps} />)
        expect(getByTestId('readonly-icon')).toBeTruthy()
    })
})
