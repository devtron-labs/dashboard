import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { CompareWithApprovalPendingAndDraft } from '../DeploymentTemplateView.component'

jest.mock('react-select', () => ({ options, value, onChange }) => {
    function handleChange(event) {
        const option = options[0].options.find((option) => option.label === event.currentTarget.value)
        onChange(option)
    }
    return (
        <select data-testid="select" value={value.label} onChange={handleChange}>
            {options[0].options.map(({ label, value }) => (
                <option key={value} value={value}>
                    {label}
                </option>
            ))}
        </select>
    )
})

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
            label: 'Approval Pending v(1)',
            id: 0,
        },
        setSelectedOptionDraft: jest.fn(),
    }

    it('renders when in isApprovalPending state', async () => {
        const {} = render(<CompareWithApprovalPendingAndDraft {...mockProps} />)
        expect(screen.getByTestId('approval-draft-dropdown')).toBeTruthy()
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
    it('should be select the option which is clicked', () => {
        render(<CompareWithApprovalPendingAndDraft {...mockProps} />)
        const selectElement = screen.getByTestId('select') as HTMLSelectElement
        const value = selectElement.value
        expect(value).toEqual('Approval Pending (v1)')
        fireEvent.click(selectElement, { target: { value: 'Values from draft (v1)' } })
        expect(selectElement.value).toEqual('Values from draft (v1)')
    })
    it('should call the handleOverride function when Allow override is clicked', () => {
        const _mockProps = {
            ...mockProps,
            overridden: false,
        }
        const { getByText } = render(<CompareWithApprovalPendingAndDraft {..._mockProps} />)
        fireEvent.click(getByText('Allow override'))
        expect(_mockProps.handleOverride).toHaveBeenCalled()
    })
    it('should call the handleOverride function when Delete override is clicked', () => {
        const { getByText } = render(<CompareWithApprovalPendingAndDraft {...mockProps} />)
        fireEvent.click(getByText('Delete override'))
        expect(mockProps.handleOverride).toHaveBeenCalled()
    })
})
