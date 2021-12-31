import { getCIConfig, getCDConfig, getWorkflowList } from '../../../../services/service';
import { WorkflowType, NodeAttr } from './types';
import { WorkflowTrigger, WorkflowCreate, Offset, WorkflowDimensions, WorkflowDimensionType } from './config';
import { TriggerType, TriggerTypeMap, DEFAULT_STATUS } from '../../../../config';
import { isEmpty } from '../../../common';
import { CINode } from '../../../workflowEditor/nodes/CINode';


enum PipelineType {
    CI_PIPELINE = "CI_PIPELINE",
    CD_PIPELINE = "CD_PIPELINE"
}

export interface Task {
    name?: string;
    type?: string;
    cmd?: string;
    args?: Array<string>;
}

//Start Workflow Response
export interface Tree {
    id: number;
    appWorkflowId: number;
    type: PipelineType;
    componentId: number;
    parentId: number;
    parentType: PipelineType;
}

export interface Workflow {
    id: number;
    name: string;
    appId: number;
    tree?: Tree[];
}

export interface WorkflowResult {
    appId: number;
    appName: string;
    workflows: Workflow[];
}
//End Workflow Response

//Start CI Response
export interface DockerBuildConfig {
    gitMaterialId: number;
    dockerfileRelativePath: string;
    args?: Map<string, string>;
}

export interface ExternalCiConfig {
    id: number;
    webhookUrl: string;
    payload: string;
    accessKey: string;
}

export interface Source {
    type: string;
    value: string;
}

export interface CiMaterial {
    source: Source;
    gitMaterialId: number;
    id: number;
    gitMaterialName: string;
}

export interface CiScript {
    id: number;
    index: number;
    name: string;
    script: string;
    outputLocation?: string;
}

export interface CiPipeline {
    isManual: boolean;
    dockerArgs?: Map<string, string>;
    isExternal: boolean;
    parentCiPipeline: number;
    parentAppId: number;
    externalCiConfig: ExternalCiConfig;
    ciMaterial?: CiMaterial[];
    name?: string;
    id?: number;
    active?: boolean;
    linkedCount: number;
    scanEnabled: boolean;
    deleted?: boolean;
    version?: string;
    beforeDockerBuild?: Array<Task>;
    afterDockerBuild?: Array<Task>;
    appWorkflowId?: number;
    beforeDockerBuildScripts?: Array<CiScript>;
    afterDockerBuildScripts?: Array<CiScript>;
}

export interface Material {
    gitMaterialId: number;
    materialName: string;
}

export interface CiPipelineResult {
    id?: number;
    appId?: number;
    dockerRegistry?: string;
    dockerRepository?: string;
    dockerBuildConfig?: DockerBuildConfig;
    ciPipelines?: CiPipeline[];
    appName?: string;
    version?: string;
    materials: Material[];
    scanEnabled: boolean;
    appWorkflowId?: number;
    beforeDockerBuild?: Array<Task>;
    afterDockerBuild?: Array<Task>;
}
//End CI Response

//Start CD response
export interface Strategy {
    deploymentTemplate: string;
    config: any;
    default?: boolean;
}

export interface CDStage {
    status: string;
    name: string;
    triggerType: 'AUTOMATIC' | 'MANUAL';
    config: string;
}

export interface CDStageConfigMapSecretNames {
    configMaps: any[];
    secrets: any[];
}

export interface CdPipeline {
    id: number;
    environmentId: number;
    environmentName?: string;
    ciPipelineId: number;
    triggerType: 'AUTOMATIC' | 'MANUAL';
    name: string;
    strategies?: Strategy[];
    namespace?: string;
    appWorkflowId?: number;
    deploymentTemplate?: string;
    preStage?: CDStage;
    postStage?: CDStage;
    preStageConfigMapSecretNames?: CDStageConfigMapSecretNames;
    postStageConfigMapSecretNames?: CDStageConfigMapSecretNames;
    runPreStageInEnv?: boolean;
    runPostStageInEnv?: boolean;
    isClusterCdActive?: boolean;
    parentPipelineId?: number;
    parentPipelineType?: string;
}

export interface CdPipelineResult {
    pipelines?: CdPipeline[];
    appId: number;
}

//End CD response

type PartialNodeAttr = Partial<NodeAttr>

export interface FullNode {
    node: PartialNodeAttr;
    hasPre: true;
    hasPost: true;
}

export interface WorkflowDisplay {
    id: number;
    name: string;
    nodes: Array<NodeAttr>;
    type: string;
}

export const getTriggerWorkflows = (appId): Promise<{ appName: string, workflows: WorkflowType[] }> => {
    return getInitialWorkflows(appId, WorkflowTrigger, WorkflowTrigger.workflow);
}

export const getCreateWorkflows = (appId): Promise<{ appName: string, workflows: WorkflowType[] }> => {
    return getInitialWorkflows(appId, WorkflowCreate, WorkflowCreate.workflow);
}

export const getInitialWorkflows = (id, dimensions: WorkflowDimensions, workflowOffset: Offset): Promise<{ appName: string, workflows: WorkflowType[] }> => {
    return Promise.all([getWorkflowList(id), getCIConfig(id), getCDConfig(id)]).then(([workflow, ciConfig, cdConfig]) => {
        return processWorkflow(workflow.result as WorkflowResult, ciConfig.result as CiPipelineResult, cdConfig as CdPipelineResult, dimensions, workflowOffset);
    });
}

export function processWorkflow(workflow: WorkflowResult, ciResponse: CiPipelineResult, cdResponse: CdPipelineResult, dimensions: WorkflowDimensions, workflowOffset: Offset): { appName: string, workflows: Array<WorkflowType> } {
    let ciPipelineToNodeWithDimension = (ciPipeline: CiPipeline) => ciPipelineToNode(ciPipeline, dimensions);
    let ciMap = new Map(
        (ciResponse?.ciPipelines?.filter(pipeline => pipeline.active && !pipeline.deleted) ?? [])
            .map(ciPipelineToNodeWithDimension)
            .map(ciPipeline => [ciPipeline.id, ciPipeline] as [string, NodeAttr])
    );
    let cdMap = new Map(
        (cdResponse?.pipelines ?? [])
            .map(cdPipeline => [cdPipeline.id, cdPipeline] as [number, CdPipeline])
    );
    let appName = workflow.appName;
    let workflows = new Array<WorkflowType>();

    //populate workflows with CI and CD nodes, sourceNodes are inside CI nodes and PreCD and PostCD nodes are inside CD nodes
    workflow.workflows
    .sort((a,b) => a.id - b.id)
    .forEach(workflow => {
        let wf = toWorkflowType(workflow);
        workflows.push(wf);
        (workflow.tree ?? [])
        .sort((a, b) => a.id - b.id)
        .forEach( branch => {
            if (branch.type == PipelineType.CI_PIPELINE) {
                let ciNode = ciMap.get(String(branch.componentId));
                if (!ciNode) {
                    return;
                }
                wf.nodes.push(ciNode);
            } else {
                let cdPipeline = cdMap.get(branch.componentId);
                if (!cdPipeline) {
                    return;
                }
                let cdNode = cdPipelineToNode(cdPipeline, dimensions, branch.parentId);
                let parentType = branch.parentType == PipelineType.CI_PIPELINE ? 'CI': 'CD';
                let type = cdNode.preNode ? 'PRECD' : 'CD';
                wf.nodes
                .filter(n => n.id == String(branch.parentId) && n.type == parentType)
                .forEach(node => {
                    (node.postNode ? node.postNode : node).downstreams.push(type + "-" + branch.componentId);
                    node.downstreamNodes.push(cdNode);
                });
                wf.nodes.push(cdNode);
            }
        })
    });

    if (dimensions.type == WorkflowDimensionType.TRIGGER) {
        workflows = workflows.filter(wf => wf.nodes.length > 0);
    }

    let maxWorkflowWidth = 0;
    //Calculate X and Y of nodes and Workflows
    //delete sourceNodes from CI, downstreamNodes for all nodes and dag from workflows
    workflows.forEach( (workflow, index) => {
        let startY = 0;
        let startX = 0;
        if (workflow.nodes.length == 0) {
            return;
        }

        let ciNode = workflow.nodes[0];
        ciNode.sourceNodes?.forEach((s, si) => {
            let sourceNodeY = startY + workflowOffset.offsetY + si * (dimensions.staticNodeSizes.nodeHeight + dimensions.staticNodeSizes.distanceY);
            s.x = startX + workflowOffset.offsetX;
            s.y = sourceNodeY;
            s.height = dimensions.staticNodeSizes.nodeHeight;
            s.width = dimensions.staticNodeSizes.nodeWidth;
        });

        ciNode.x = startX + workflowOffset.offsetX + dimensions.staticNodeSizes.nodeWidth + dimensions.staticNodeSizes.distanceX;
        ciNode.y = startY + workflowOffset.offsetY;

        if ((ciNode.downstreamNodes?.length ?? 0) > 0) {
            processDownstreamDeployments(ciNode.downstreamNodes, dimensions, ciNode.x, ciNode.y);
        }


        let finalWorkflow = new Array<NodeAttr>();
        workflow.nodes.forEach( node => {
            if (node.type == 'CI') {
                node.sourceNodes && finalWorkflow.push(...node.sourceNodes);
                finalWorkflow.push(node);
                delete node['sourceNodes'];
            }
            if (node.type == 'CD') {
                node.preNode && finalWorkflow.push(node.preNode);
                finalWorkflow.push(node);
                node.postNode && finalWorkflow.push(node.postNode);
            }
            delete node['downstreamNodes'];
        });
        delete workflow['dag'];

        let maxY = finalWorkflow.reduce((maxY, node) => Math.max(node.y + node.height + workflowOffset.offsetY, maxY), 0);
        let maxX = finalWorkflow.reduce((maxX, node) => Math.max(node.x + node.width + workflowOffset.offsetX, maxX), 0);

        let workflowWidth = dimensions.type === WorkflowDimensionType.CREATE ? 840 : 1280;
        workflow.height = maxY;
        workflow.startY = !index ? 0 : startY;

        workflow.width = Math.max(maxX, workflowWidth);

        maxWorkflowWidth = Math.max(maxWorkflowWidth, workflow.width);

        workflow.nodes = finalWorkflow;
    });

    workflows.forEach(workflow => workflow.width = maxWorkflowWidth);
    return {appName, workflows};
}

function processDownstreamDeployments(downstreams: Array<NodeAttr>, dimensions: WorkflowDimensions, startX: number, startY: number) {
    let lastY = startY
    for (let index = 0; index < downstreams.length; index++) {
        const element = downstreams[index];
        let cdNodeY = lastY;
        let cdNodeX = startX + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX;

        if (element.preNode) {
            element.preNode.y = cdNodeY;
            element.preNode.x = startX + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX;
            cdNodeX = element.preNode.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX;
        }

        element.y = cdNodeY;
        element.x = cdNodeX;

        let lastX = element.x;

        if (element.postNode) {
            element.postNode.y = element.y;
            element.postNode.x = element.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX;
            lastX = element.postNode.x;
        }

        lastY = cdNodeY  + dimensions.cDNodeSizes.nodeHeight + dimensions.cDNodeSizes.distanceY;

        if ((element.downstreamNodes?.length ?? 0) > 0) {
            processDownstreamDeployments(element.downstreamNodes, dimensions, lastX, cdNodeY)
            lastY = element.downstreamNodes[element.downstreamNodes.length - 1].y  + dimensions.cDNodeSizes.nodeHeight + dimensions.cDNodeSizes.distanceY;
        }

        //for next iteration use Y coordinate of the last element in downstreamNodes as it will have maximum Y coordinate
        startY = lastY
    }
}

function toWorkflowType(workflow:Workflow): WorkflowType {
    return {
        id: ""+workflow.id,
        name: workflow.name,
        nodes: new Array<NodeAttr>(),
        startX: 0,
        startY: 0,
        height: 0,
        width: 0,
        dag: [],
    } as WorkflowType
}

function ciPipelineToNode(ciPipeline: CiPipeline, dimensions: WorkflowDimensions): NodeAttr {
    let sourceNodes = (ciPipeline?.ciMaterial ?? [])
        .map((ciMaterial) => {
            let materialName = ciMaterial.gitMaterialName || "";
            return {
                parents: [],
                height: dimensions.staticNodeSizes.nodeHeight,
                width: dimensions.staticNodeSizes.nodeWidth,
                title: materialName.toLowerCase(),
                isSource: true,
                isRoot: true,
                isGitSource: true,
                url: "",
                id: `GIT-${materialName}`,
                downstreams: [`CI-${ciPipeline.id}`],
                type: 'GIT',
                icon: "git",
                branch: ciMaterial?.source?.value ?? "",
                sourceType: ciMaterial?.source?.type ?? "",
                x: 0,
                y: 0,
            } as NodeAttr
        });
        let trigger = ciPipeline.isManual ? TriggerType.Manual.toLocaleLowerCase() : TriggerType.Auto.toLocaleLowerCase();
        let isExternalCI = ciPipeline.isExternal;
        let isLinkedCI = !!ciPipeline.parentCiPipeline;
        let l = (ciPipeline.name?.length ?? 1) - 1;
        if (isLinkedCI) {
            l = (ciPipeline.name ?? '').lastIndexOf('-');
        }
        let ciNodeHeight = getCINodeHeight(dimensions.type, ciPipeline);
        let ciNode = {
            isSource: true,
            isGitSource: false,
            isRoot: false,
            parents: sourceNodes.map(sn => sn.id),
            id: String(ciPipeline.id),
            x: 0,
            y: 0,
            parentAppId: ciPipeline.parentAppId,
            parentCiPipeline: ciPipeline.parentCiPipeline,
            height: ciNodeHeight,
            width: dimensions.cINodeSizes.nodeWidth,
            title: isLinkedCI ? (ciPipeline.name ?? '').substring(0, l) || ciPipeline.name : ciPipeline.name, //show parent CI name if Linked CI
            triggerType: TriggerTypeMap[trigger],
            status: DEFAULT_STATUS,
            type: 'CI',
            inputMaterialList: [],
            downstreams: [],
            isExternalCI: isExternalCI,
            isLinkedCI: isLinkedCI,
            linkedCount: ciPipeline.linkedCount || 0,
            sourceNodes: sourceNodes,
            downstreamNodes: new Array<NodeAttr>(),
        } as NodeAttr

    return ciNode;
}

function cdPipelineToNode(cdPipeline: CdPipeline, dimensions: WorkflowDimensions, parentId: number): NodeAttr {
    let trigger = cdPipeline.triggerType?.toLowerCase() ?? '';
    let preCD : NodeAttr | undefined = undefined, postCD: NodeAttr | undefined = undefined;
    let stageIndex = 1;
    if (!isEmpty(cdPipeline?.preStage?.config)) {
        let trigger = cdPipeline.preStage?.triggerType?.toLowerCase() ?? '';
        preCD = {
            parents: [String(parentId)],
            height: dimensions.cDNodeSizes.nodeHeight,
            width: dimensions.cDNodeSizes.nodeWidth,
            title: cdPipeline.preStage?.name ?? '',
            isSource: false,
            isGitSource: false,
            id: String(cdPipeline.id),
            activeIn: false,
            activeOut: false,
            downstreams: [`CD-${cdPipeline.id}`],
            type: 'PRECD',
            status: cdPipeline.preStage?.status || DEFAULT_STATUS,
            triggerType: TriggerTypeMap[trigger],
            environmentName: cdPipeline.environmentName || "",
            environmentId: cdPipeline.environmentId,
            deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
            inputMaterialList: [],
            rollbackMaterialList: [],
            stageIndex: stageIndex,
            x: 0,
            y: 0,
            isRoot: false,
        } as NodeAttr
        stageIndex++;
    }
    let cdDownstreams = [];
    if (dimensions.type === WorkflowDimensionType.TRIGGER && !isEmpty(cdPipeline.postStage?.config)) {
        cdDownstreams = [`POSTCD-${cdPipeline.id}`]
    }

    let CD = {
        connectingCiPipelineId: cdPipeline.ciPipelineId,
        parents: [String(parentId)],
        height: dimensions.cDNodeSizes.nodeHeight,
        width: dimensions.cDNodeSizes.nodeWidth,
        title: cdPipeline.name,
        isSource: false,
        isGitSource: false,
        id: String(cdPipeline.id),
        activeIn: false,
        activeOut: false,
        downstreams: cdDownstreams,
        type: 'CD',
        status: DEFAULT_STATUS,
        triggerType: TriggerTypeMap[trigger],
        environmentName: cdPipeline.environmentName || "",
        environmentId: cdPipeline.environmentId,
        deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
        inputMaterialList: [],
        rollbackMaterialList: [],
        stageIndex: stageIndex,
        x: 0,
        y: 0,
        isRoot: false,
        preNode: undefined,
        postNode: undefined,
        downstreamNodes: new Array<NodeAttr>(),
    } as NodeAttr
    stageIndex++;

    if (!isEmpty(cdPipeline?.postStage?.config)) {
        let trigger = cdPipeline.postStage?.triggerType?.toLowerCase() ?? '';
        postCD = {
            parents: [String(cdPipeline.id)],
            height: dimensions.cDNodeSizes.nodeHeight,
            width: dimensions.cDNodeSizes.nodeWidth,
            title: cdPipeline.postStage?.name ?? '',
            isSource: false,
            isGitSource: false,
            id: String(cdPipeline.id),
            activeIn: false,
            activeOut: false,
            downstreams: [],
            type: 'POSTCD',
            status: cdPipeline.postStage?.status || DEFAULT_STATUS,
            triggerType: TriggerTypeMap[trigger],
            environmentName: cdPipeline.environmentName || "",
            environmentId: cdPipeline.environmentId,
            deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
            inputMaterialList: [],
            rollbackMaterialList: [],
            stageIndex: stageIndex,
            x: 0,
            y: 0,
            isRoot: false
        } as NodeAttr;
    }
    if (dimensions.type === WorkflowDimensionType.TRIGGER) {
        CD.preNode = preCD;
        CD.postNode = postCD;
    }
    if (dimensions.type === WorkflowDimensionType.CREATE) {
        let title = "";
        title += preCD ? "Pre-deploy, " : "";
        title += "Deploy";
        title += postCD ? ", Post-deploy" : "";
        CD.title = title;
    }
    return CD;
}

function getCINodeHeight(dimensionType: WorkflowDimensionType, pipeline: CiPipeline): number {
    if (dimensionType === WorkflowDimensionType.CREATE) return WorkflowCreate.cINodeSizes.nodeHeight;
    else {
        if (pipeline.parentCiPipeline) //linked CI pipeline
            return WorkflowTrigger.linkedCINodeSizes?.nodeHeight ?? 0;
        else if (pipeline.isExternal) return WorkflowTrigger.externalCINodeSizes?.nodeHeight ?? 0; //external CI
        else return WorkflowTrigger.cINodeSizes.nodeHeight;
    }
}