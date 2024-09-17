import {
    DeploymentChartVersionType,
    DeploymentTemplateConfigState,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { CompareWithTemplateGroupedSelectPickerOptionType } from '../types'

/**
 * schema will be same for default value and current editor value due to limitation of code editor
 */
export interface CompareTemplateViewProps extends Pick<DeploymentTemplateConfigState, 'schema'> {
    isLoading: boolean
    currentEditorTemplate: string
    currentEditorSelectedChart: DeploymentChartVersionType
    editorOnChange: (value: string) => void
    compareWithEditorTemplate: string
    readOnly: boolean
    compareWithOptions: CompareWithTemplateGroupedSelectPickerOptionType[]
    handleCompareWithOptionChange: (option: SelectPickerOptionType) => void
    selectedCompareWithOption: SelectPickerOptionType
}
