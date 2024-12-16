import { DeploymentChartVersionType, GUIViewError } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTemplateFormProps } from '../types'

export interface GUIViewProps
    extends Pick<
        DeploymentTemplateFormProps,
        | 'editorOnChange'
        | 'lockedConfigKeysWithLockType'
        | 'hideLockedKeys'
        | 'uneditedDocument'
        | 'editedDocument'
        | 'mergeStrategy'
    > {
    value: string
    readOnly: boolean
    isUnSet: boolean
    handleChangeToYAMLMode: () => void
    guiSchema: string
    selectedChart: DeploymentChartVersionType
}

export type GUIViewState =
    | {
          guiSchema: object
          uiSchema: object
          error?: never
      }
    | {
          guiSchema?: never
          uiSchema?: never
          error: GUIViewError
      }
