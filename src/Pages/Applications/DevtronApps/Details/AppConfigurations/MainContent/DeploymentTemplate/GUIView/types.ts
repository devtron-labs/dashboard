import { DeploymentChartVersionType, RJSFFormSchema } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTemplateFormProps } from '../types'

export enum NodeEntityType {
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    LEAF = 'LEAF',
}

export type NodeType = {
    key: string
    title: string
    path: string
    type: NodeEntityType
    fieldType: RJSFFormSchema['type']
} & (
    | {
          selectionStatus: 'all-selected' | 'some-selected' | 'none-selected'
          isChecked?: never
          children: Array<NodeType>
      }
    | {
          isChecked: boolean
          selectionStatus?: never
          children?: never
      }
)

export type TraversalType = {
    node: NodeType
    wf: (node: NodeType, data: unknown) => void
    data: unknown
}

export type GUIViewModelType = {
    schema: object
    json: object
    totalCheckedCount: number
    root: NodeType
    updateNodeForPath: (data: UpdateNodeForPathDataType) => void
    getUncheckedNodes: () => string[]
    postOrder: (props: TraversalType) => void
    inOrder: (props: TraversalType) => void
}

export type ViewErrorType = Record<'title' | 'subTitle', string>

export type GUIViewCheckboxProps = {
    node: NodeType
    updateNodeForPath: (path: string) => void
}

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

export type UpdateNodeForPathDataType = {
    path: string
    json: object
}
