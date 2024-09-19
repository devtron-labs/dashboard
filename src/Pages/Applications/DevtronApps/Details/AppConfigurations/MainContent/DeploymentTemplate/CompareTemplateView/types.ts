import {
    CompareFromApprovalOptionsValuesType,
    DeploymentChartVersionType,
    DeploymentTemplateConfigState,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { CompareWithTemplateGroupedSelectPickerOptionType, DeploymentTemplateProps } from '../types'

/**
 * schema will be same for default value and current editor value due to limitation of code editor
 */
export interface CompareTemplateViewProps
    extends Pick<DeploymentTemplateConfigState, 'schema'>,
        Pick<DeploymentTemplateProps, 'isUnSet' | 'environmentName'> {
    isLoading: boolean
    currentEditorTemplate: string
    currentEditorSelectedChart: DeploymentChartVersionType
    editorOnChange: (value: string) => void
    compareWithEditorTemplate: string
    readOnly: boolean
    compareWithOptions: CompareWithTemplateGroupedSelectPickerOptionType[]
    handleCompareWithOptionChange: (option: SelectPickerOptionType) => void
    selectedCompareWithOption: SelectPickerOptionType
    isApprovalView: boolean
    compareFromSelectedOptionValue: CompareFromApprovalOptionsValuesType
    handleCompareFromOptionSelection: (option: SelectPickerOptionType) => void
    draftChartVersion: string
    isCurrentEditorOverridden: boolean
    handleOverride: () => void
    latestDraft: string
    isDeleteOverrideDraftState: boolean
}
