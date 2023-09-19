import React from 'react'
import { fireEvent, getByTestId, render, screen } from '@testing-library/react'
import {
    ChartTypeVersionOptions,
    CompareWithApprovalPendingAndDraft,
    CompareWithDropdown,
    DropdownContainer,
    DropdownItem,
    SaveConfirmationDialog,
    SuccessToastBody,
    renderEditorHeading,
} from '../DeploymentTemplateView.component'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../../constants'
import { DeploymentConfigContext } from '../../DeploymentConfig'

jest.mock('react-select', () => ({ options, value, onChange }) => {
    function handleChange(event) {
        const option = options[0].options.find((option) => option.label === event.currentTarget.value)
        onChange(option)
    }
    return (
        <select data-testid="select" value={value.label} onChange={handleChange}>
            {options.map((_, idx) =>
                options[idx].options
                    ? options[idx].options.map(({ label, value }) => (
                          <option key={value} value={value}>
                              {label}
                          </option>
                      ))
                    : options.map(({ label, value, version }) => (
                          <option key={value} value={value}>
                              {label ? label : version}
                          </option>
                      )),
            )}
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

describe('DropdownContainer Component', () => {
    const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        children: <div data-testid="child">Test</div>,
    }
    it('should render correctly', () => {
        const { getByTestId } = render(<DropdownContainer {...mockProps} />)
        const dropdownContainer = getByTestId('dropdown-container')
        expect(dropdownContainer).toBeTruthy()
    })
    it('should call onClose function when clicked outside', () => {
        const { getByTestId } = render(<DropdownContainer {...mockProps} />)
        const dropdownContainer = getByTestId('dropdown-container')
        fireEvent.click(dropdownContainer)
        expect(mockProps.onClose).toHaveBeenCalled()
    })
    it('should call onClose function when clicked inside', () => {
        const { getByTestId } = render(<DropdownContainer {...mockProps} />)
        const dropdownContainer = getByTestId('dropdown-container')
        fireEvent.click(dropdownContainer.children[0])
        expect(mockProps.onClose).toHaveBeenCalled()
    })
    it('should not render when isOpen is false', () => {
        const _mockProps = {
            ...mockProps,
            isOpen: false,
        }
        const { queryByTestId } = render(<DropdownContainer {..._mockProps} />)
        const dropdownContainer = queryByTestId('dropdown-container')
        expect(dropdownContainer).toBeFalsy()
    })
    it('should render children when isOpen is true', () => {
        const { getByTestId } = render(<DropdownContainer {...mockProps} />)
        const dropdownContainer = getByTestId('child')
        expect(dropdownContainer).toBeTruthy()
    })
})

describe('DropdownItem', () => {
    it('renders with label and default styles', () => {
        const label = 'Example Label'
        const onClick = jest.fn()

        render(<DropdownItem label={label} isValues={false} onClick={onClick} />)
        const itemElement = screen.getByText(label)
        expect(itemElement).toBeTruthy()
        const classList = itemElement.classList
        expect(classList).toContain('fw-n') // Default font weight
        expect(classList).toContain('cn-9') // Default color
        fireEvent.click(itemElement)
        expect(onClick).toHaveBeenCalled()
    })

    it('renders with custom styles for values', () => {
        const label = 'Values Label'
        const onClick = jest.fn()

        render(<DropdownItem label={label} isValues={true} onClick={onClick} />)

        const itemElement = screen.getByText(label)
        const classList = itemElement.classList

        expect(itemElement).toBeTruthy()
        expect(classList).toContain('fw-6') // Custom font weight for values
        expect(classList).toContain('bcb-1') // Custom color for values
        fireEvent.click(itemElement)
        expect(onClick).toHaveBeenCalled()
    })
})

describe('CompareWithDropdown', () => {
    const defaultProps = {
        envId: 1,
        isEnvOverride: false,
        environments: [
            { id: 1, label: 'Environment 1' },
            { id: 2, label: 'Environment 2' },
        ],
        charts: [
            { id: 1, label: 'Chart 1', version: '1.0' },
            { id: 2, label: 'Chart 2', version: '2.0' },
        ],
        selectedOption: { id: 1, label: 'Option 1', type: 1 },
        setSelectedOption: jest.fn(),
        globalChartRef: {
            id: 1,
            version: '1.0',
        },
        isValues: true,
        groupedData: [[{ id: 1, label: 'Option 1', type: 1 }], [{ id: 2, label: 'Option 2', type: 2 }]],
    }

    it('renders the dropdown with default option', () => {
        // @ts-ignore
        const { getByText } = render(<CompareWithDropdown {...defaultProps} />)

        expect(getByText(`${DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label} (v1.0)`)).toBeTruthy()
    })

    it('handles option selection', () => {
        // @ts-ignore
        const { getByTestId } = render(<CompareWithDropdown {...defaultProps} />)

        const selectInput = getByTestId('select') as HTMLSelectElement
        fireEvent.click(selectInput, { target: { value: 'Base deployment template (v1.0)' } })

        expect(defaultProps.setSelectedOption).toHaveBeenCalledWith({
            id: -1,
            label: 'Base deployment template (v1.0)',
            chartRefId: 1,
            environmentName: 'Base deployment template',
            chartVersion: '1.0',
        })
    })
    it('should render the dropdown with the selected option', () => {
        const _defaultProps = {
            ...defaultProps,
            selectedOption: { id: 2, label: 'Option 2', type: 2 },
        }
        // @ts-ignore
        const { getByTestId } = render(<CompareWithDropdown {..._defaultProps} />)

        // @ts-ignore
        expect(getByTestId('select').value).toEqual('Option 2')
    })
})

describe('SuccessToastBody', () => {
    it('renders the "Updated" toast when chartConfig has an id', () => {
        const chartConfig = { id: 1 }
        const { getByText, getByTestId } = render(<SuccessToastBody chartConfig={chartConfig} />)

        // Assert that the "Updated" toast is rendered
        expect(getByTestId('update-base-deployment-template-popup')).toBeTruthy()
        expect(getByText('Updated')).toBeTruthy()
        expect(getByText('Changes will be reflected after next deployment.')).toBeTruthy()
    })

    it('renders the "Saved" toast when chartConfig has no id', () => {
        const chartConfig = {}
        const { getByText, getByTestId } = render(<SuccessToastBody chartConfig={chartConfig} />)

        // Assert that the "Saved" toast is rendered
        expect(getByTestId('saved-base-deployment-template-popup')).toBeTruthy()
        expect(getByText('Saved')).toBeTruthy()
        expect(getByText('Changes will be reflected after next deployment.')).toBeTruthy()
    })
})

describe('renderEditorHeading', () => {
    const environmentName = 'Test Environment'
    const selectedChart = {
        id: 1,
        version: '1.0',
        chartRefId: 1,
        type: 2,
        pipelineConfigOverrideId: 1,
        name: 'Test Chart',
        description: 'Test Chart Description',
        isAppMetricsSupported: false,
    }
    const handleOverride = jest.fn()
    const latestDraft = {
        action: 1,
    }

    // isEnvOverride: boolean,
    // overridden: boolean,
    // readOnly: boolean,
    // environmentName: string,
    // selectedChart: DeploymentChartVersionType,
    // handleOverride: (e: any) => Promise<void>,
    // latestDraft: any,
    // isPublishedOverriden: boolean,
    // isDeleteDraftState: boolean,
    // isValues: boolean,

    it('renders heading for a non-overridden, non-read-only state', () => {
        render(
            <div data-testid="heading-container">
                {renderEditorHeading(
                    false,
                    false,
                    false,
                    environmentName,
                    selectedChart,
                    handleOverride,
                    latestDraft,
                    false,
                    false,
                    true,
                )}
            </div>,
        )

        expect(screen.getByTestId('heading-container')).toBeTruthy()
        expect(screen.getByText('Last saved draft (v1.0)')).toBeTruthy()
        expect(screen.queryByText('Overridden')).toBeFalsy()
        expect(screen.queryByText('Allow override')).toBeFalsy()
    })

    it('render selected chart when latest draft is null', () => {
        render(
            <div data-testid="heading-container">
                {renderEditorHeading(
                    false,
                    false,
                    false,
                    environmentName,
                    selectedChart,
                    handleOverride,
                    null,
                    false,
                    false,
                    true,
                )}
            </div>,
        )

        expect(screen.getByTestId('heading-container')).toBeTruthy()
        expect(screen.getByText('Base deployment template (v1.0)')).toBeTruthy()
    })

    it('renders render environment name and version along with "overriden" when draft is overriden', () => {
        render(
            <div data-testid="heading-container">
                {renderEditorHeading(
                    true,
                    true,
                    false,
                    environmentName,
                    selectedChart,
                    handleOverride,
                    null,
                    false,
                    false,
                    true,
                )}
            </div>,
        )

        expect(screen.getByTestId('heading-container')).toBeTruthy()
        expect(screen.getByText('Test Environment (v1.0)')).toBeTruthy()
        expect(screen.getByText('Overriden')).toBeTruthy()
    })
    it('renders render environment name and version along with "Inheriting from base" when draft is not overriden', () => {
        render(
            <div data-testid="heading-container">
                {renderEditorHeading(
                    true,
                    false,
                    false,
                    environmentName,
                    selectedChart,
                    handleOverride,
                    null,
                    false,
                    false,
                    true,
                )}
            </div>,
        )

        expect(screen.getByTestId('heading-container')).toBeTruthy()
        expect(screen.getByText('Test Environment (v1.0)')).toBeTruthy()
        expect(screen.getByText('Inheriting from base')).toBeTruthy()
    })

    it('should not render delete override option in draft state, in overriden state, when in manifest view', async () => {
        const { queryByText } = render(
            <div data-testid="heading-container">
                {renderEditorHeading(
                    true,
                    true,
                    false,
                    environmentName,
                    selectedChart,
                    handleOverride,
                    latestDraft,
                    false,
                    false,
                    false,
                )}
            </div>,
        )
        expect(queryByText('Delete override')).toBeFalsy()
    })
    it('should not render Allow override option in draft state, when not overriden, when in manifest view', async () => {
        const { queryByText } = render(
            <div data-testid="heading-container">
                {renderEditorHeading(
                    true,
                    false,
                    false,
                    environmentName,
                    selectedChart,
                    handleOverride,
                    latestDraft,
                    false,
                    false,
                    false,
                )}
            </div>,
        )
        expect(queryByText('Allow override')).toBeFalsy()
    })
    it('should render locked icon when in read only state', async () => {
        const { getByTestId } = render(
            <div data-testid="heading-container">
                {renderEditorHeading(
                    true,
                    false,
                    true,
                    environmentName,
                    selectedChart,
                    handleOverride,
                    latestDraft,
                    false,
                    false,
                    false,
                )}
            </div>,
        )
        expect(getByTestId('locked-icon')).toBeTruthy()
    })
})

describe('ChartTypeVersionOptions', () => {
    const charts = [
        { id: 1, name: 'Chart A', version: '2.0' },
        { id: 2, name: 'Chart B', version: '2.0' },
        { id: 3, name: 'Chart C', version: '1.0' },
    ]

    const chartsMetadata = [
        { id: 1, name: 'Chart A' },
        { id: 2, name: 'Chart B' },
        { id: 3, name: 'Chart C' },
    ]

    const selectedChart = { id: 1, name: 'Chart A', version: '2.0' }
    const selectChart = jest.fn()

    it('renders chart type and version options correctly', () => {
        render(
            <ChartTypeVersionOptions
                isUnSet={false}
                disableVersionSelect={false}
                // @ts-ignore
                charts={charts}
                // @ts-ignore
                chartsMetadata={chartsMetadata}
                // @ts-ignore
                selectedChart={selectedChart}
                selectChart={selectChart}
                selectedChartRefId={selectedChart.id}
            />,
        )

        expect(screen.getByText('Chart type:')).toBeTruthy()
        expect(screen.getByText('Chart version:')).toBeTruthy()
    })

    it('renders selected chart version when version select is disabled', () => {
        render(
            <ChartTypeVersionOptions
                isUnSet={false}
                disableVersionSelect={true}
                // @ts-ignore
                charts={charts}
                // @ts-ignore
                chartsMetadata={chartsMetadata}
                // @ts-ignore
                selectedChart={selectedChart}
                selectChart={selectChart}
                selectedChartRefId={selectedChart.id}
            />,
        )

        expect(screen.getByText('2.0')).toBeTruthy()
    })

    it('renders chart version options when version select is enabled', () => {
        render(
            <ChartTypeVersionOptions
                isUnSet={false}
                disableVersionSelect={false}
                // @ts-ignore
                charts={charts}
                // @ts-ignore
                chartsMetadata={chartsMetadata}
                // @ts-ignore
                selectedChart={selectedChart}
                selectChart={selectChart}
                selectedChartRefId={selectedChart.id}
            />,
        )

        expect(screen.getByText('2.0')).toBeTruthy()
    })
})
