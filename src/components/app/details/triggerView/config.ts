
export enum WorkflowDimensionType {
    TRIGGER = 'trigger',
    CREATE = 'create'
}

export const WorkflowCreate = {
    type: WorkflowDimensionType.CREATE,
    staticNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 20
    } as NodeDimension, cINodeSizes: {
        nodeHeight: 64,
        nodeWidth: 240,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension, cDNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 240,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension, workflow: {
        distanceY: 0,
        distanceX: 0,
        offsetX: 20,
        offsetY: 24,
    } as Offset
} as WorkflowDimensions

export const WorkflowTrigger = {
    type: WorkflowDimensionType.TRIGGER,
    staticNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 20
    } as NodeDimension, cINodeSizes: {
        nodeHeight: 126,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension, externalCINodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension, linkedCINodeSizes: {
        nodeHeight: 84,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension, cDNodeSizes: {
        nodeHeight: 126,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension, workflow: {
        distanceY: 16,
        distanceX: 0,
        offsetX: 20,
        offsetY: 24
    } as Offset
} as WorkflowDimensions;

export interface Offset {
    distanceY: number,
    distanceX: number,
    offsetX: number,
    offsetY: number,
}

export interface NodeDimension {
    nodeHeight: number,
    nodeWidth: number,
    distanceX: number,
    distanceY: number,
}


export interface WorkflowDimensions {
    type: WorkflowDimensionType,
    staticNodeSizes: NodeDimension,
    cINodeSizes: NodeDimension,
    externalCINodeSizes?: NodeDimension,
    linkedCINodeSizes?: NodeDimension,
    cDNodeSizes: NodeDimension,
    workflow: Offset
}

export const CDButtonLabelMap = {
    PRECD: 'Trigger Stage',
    CD: 'Deploy',
    POSTCD: 'Trigger Stage',
}

export function getCDModalHeader(nodeType, envName) {
    switch (nodeType) {
        case 'PRECD': return `Pre Deployment`;
        case 'CD': return `Deploy to ${envName}`;
        case 'POSTCD': return `Post Deployment`;
        default: return "";
    }
}