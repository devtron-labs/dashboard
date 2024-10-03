import { DeploymentChartVersionType } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTemplateFormProps } from '../types'

export enum NodeEntityType {
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    LEAF = 'LEAF',
}

export type NodeType =
    | {
          key: string
          title: string
          path: string
          type: NodeEntityType
          selectionStatus: 'all-selected' | 'some-selected' | 'none-selected'
          isChecked?: never
          children: Array<NodeType>
      }
    | {
          key: string
          title: string
          path: string
          type: NodeEntityType.LEAF
          isChecked: boolean
          selectionStatus?: never
          children?: never
      }

export type GUIViewModelType = {
    schema: object
    json: object
    totalCheckedCount: number
    root: NodeType
    updateNodeForPath: (path: string) => void
    getUncheckedNodes: () => string[]
}

export type ViewErrorType = Record<'title' | 'subTitle', string>

export type DeploymentTemplateGUICheckboxEditorProps = {
    node: NodeType
    updateNodeForPath: (path: string) => void
}

export type traversalType = {
    node: NodeType
    wf: (node: NodeType, data: unknown) => void
    data: unknown
}

export interface DeploymentTemplateGUIViewProps
    extends Pick<
        DeploymentTemplateFormProps,
        'editorOnChange' | 'lockedConfigKeysWithLockType' | 'hideLockedKeys' | 'uneditedDocument' | 'editedDocument'
    > {
    value: string
    readOnly: boolean
    isUnSet: boolean
    handleEnableWasGuiOrHideLockedKeysEdited: () => void
    wasGuiOrHideLockedKeysEdited: boolean
    handleChangeToYAMLMode: () => void
    guiSchema: string
    selectedChart: DeploymentChartVersionType
}
