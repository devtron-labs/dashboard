import { DeploymentTemplateConfigState } from '@devtron-labs/devtron-fe-common-lib'

/**
 * schema will be same for default value and current editor value due to limitation of code editor
 */
export interface CompareTemplateViewProps extends Pick<DeploymentTemplateConfigState, 'schema'> {
    isLoading: boolean
    currentEditorTemplate: string
    currentEditorSelectedChartVersion: string | null
    editorOnChange: (value: string) => void
}
