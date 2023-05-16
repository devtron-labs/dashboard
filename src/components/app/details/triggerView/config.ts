import { createContext } from 'react'
import { DeploymentNodeType } from '@devtron-labs/devtron-fe-common-lib'
import { TriggerViewContextType } from './types'

export const TriggerViewContext = createContext<TriggerViewContextType>({
    invalidateCache: false,
    refreshMaterial: (ciNodeId: number, materialId: number) => {},
    onClickTriggerCINode: () => {},
    onClickTriggerCDNode: (nodeType: DeploymentNodeType, _appId: number) => {},
    onClickCIMaterial: (ciNodeId: string, ciPipelineName: string, preserveMaterialSelection?: boolean) => {},
    onClickCDMaterial: (cdNodeId, nodeType: DeploymentNodeType, isApprovalNode?: boolean) => {},
    onClickRollbackMaterial: (cdNodeId: number, offset?: number, size?: number) => {},
    closeCIModal: () => {},
    selectCommit: (materialId: string, hash: string, ciPipelineId?: string) => {},
    selectMaterial: (materialId, pipelineId?: number) => {},
    toggleChanges: (materialId: string, hash: string) => {},
    toggleInvalidateCache: () => {},
    getMaterialByCommit: (ciNodeId: number, materialId: number, gitMaterialId: number, commitHash: string) => {},
    getFilteredMaterial: (ciNodeId: number, gitMaterialId: number, showExcluded: boolean) => {},
})

export enum WorkflowDimensionType {
    TRIGGER = 'trigger',
    CREATE = 'create',
}

export const WorkflowCreate = {
    type: WorkflowDimensionType.CREATE,
    staticNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 20,
    } as NodeDimension,
    cINodeSizes: {
        nodeHeight: 64,
        nodeWidth: 240,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    cDNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 240,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    workflow: {
        distanceY: 0,
        distanceX: 0,
        offsetX: 20,
        offsetY: 24,
    } as Offset,
} as WorkflowDimensions

export const WorkflowTrigger = {
    type: WorkflowDimensionType.TRIGGER,
    staticNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 20,
    } as NodeDimension,
    cINodeSizes: {
        nodeHeight: 126,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    externalCINodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    linkedCINodeSizes: {
        nodeHeight: 84,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    cDNodeSizes: {
        nodeHeight: 126,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    workflow: {
        distanceY: 16,
        distanceX: 0,
        offsetX: 20,
        offsetY: 24,
    } as Offset,
} as WorkflowDimensions

export interface Offset {
    distanceY: number
    distanceX: number
    offsetX: number
    offsetY: number
}

export interface NodeDimension {
    nodeHeight: number
    nodeWidth: number
    distanceX: number
    distanceY: number
}

export interface WorkflowDimensions {
    type: WorkflowDimensionType
    staticNodeSizes: NodeDimension
    cINodeSizes: NodeDimension
    externalCINodeSizes?: NodeDimension
    linkedCINodeSizes?: NodeDimension
    cDNodeSizes: NodeDimension
    workflow: Offset
}

export const CDButtonLabelMap = {
    PRECD: 'Trigger Stage',
    CD: 'Deploy',
    POSTCD: 'Trigger Stage',
}

export const getCommonConfigSelectStyles = (stylesOverride = {}) => {
    return {
        control: (base) => ({
            ...base,
            backgroundColor: 'white',
            border: 'none',
            boxShadow: 'none',
            minHeight: '32px',
            cursor: 'pointer',
            borderRadius: '4px 0 0 4px',
            padding: '7px 16px 7px 0px',
            '&:hover': {
                backgroundColor: 'var(--N100)',
            },
        }),
        menu: (base) => ({
            ...base,
            marginTop: '2px',
            minWidth: '350px',
        }),
        menuList: (base) => ({
            ...base,
            position: 'relative',
            paddingBottom: 0,
            paddingTop: 0,
            maxHeight: '250px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            padding: 0,
            color: 'var(--N400)',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        ...stylesOverride,
    }
}
