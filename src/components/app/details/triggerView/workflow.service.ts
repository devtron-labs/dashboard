import { getCIConfig, getCDConfig, getWorkflowList } from '../../../../services/service';
import { WorkflowType, NodeAttr } from './types';
import { WorkflowTrigger, WorkflowCreate, Offset, WorkflowDimensions } from './config';
import { TriggerType, TriggerTypeMap, DEFAULT_STATUS } from '../../../../config';
import { isEmpty } from '../../../common';

export const getTriggerWorkflows = (appId): Promise<{ appName: string, workflows: WorkflowType[] }> => {
    return getInitialWorkflows(appId, WorkflowTrigger, WorkflowTrigger.workflow);
}

export const getCreateWorkflows = (appId): Promise<{ appName: string, workflows: WorkflowType[] }> => {
    return getInitialWorkflows(appId, WorkflowCreate, WorkflowCreate.workflow);
}

const getInitialWorkflows = (id, dimensions: WorkflowDimensions, workflowOffset: Offset): Promise<{ appName: string, workflows: WorkflowType[] }> => {
    return Promise.all([getWorkflowList(id), getCIConfig(id), getCDConfig(id)]).then(([workflow, ciConfig, cdConfig]) => {
        return getWorkflows(workflow, ciConfig, cdConfig, dimensions, workflowOffset);
    });
}

export const getWorkflows = (workflow, ciConfigResponse, cdConfig, dimensions, workflowOffset): { appName: string, workflows: WorkflowType[] } => {
    let gitHeight = 0;
    let ciHeight = 0;
    let cdHeight = 0;
    let workflows: WorkflowType[] = [];
    let ciConfig = ciConfigResponse.result;
    let appName = workflow.result.appName;
    let wf = workflow.result.workflows;
    wf.forEach((w, i) => {
        workflows.push({
            id: "" + w.id,
            name: w.name,
            dag: w.tree,
            nodes: [],
            startX: 0,
            startY: 0,
            height: 0,
            width: 0
        })
    })

    if (!ciConfig) return { appName, workflows: [] };

    let ciPipelines = ciConfig.ciPipelines ? ciConfig.ciPipelines.filter(pipeline => {
        return pipeline.active && !pipeline.deleted;
    }) : [];
    //start with CI Pipeline as it is the root
    ciPipelines.forEach((pipeline) => {
        let sourceNodes = pipeline.ciMaterial
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
                    downstreams: [`CI-${pipeline.id}`],
                    type: 'GIT',
                    icon: "git",
                    branch: ciMaterial ? ciMaterial.source.value : "",
                    sourceType: ciMaterial ? ciMaterial.source.type : "",
                    x: 0,
                    y: 0
                } as NodeAttr
            })
        //one CI node can belong to only one workflow
        //if this is no longer true then cannot create it here as it is mutated later on
        let trigger = pipeline.isManual ? TriggerType.Manual.toLocaleLowerCase() : TriggerType.Auto.toLocaleLowerCase();
        let isExternalCI = pipeline.isExternal;
        let isLinkedCI = !!pipeline.parentCiPipeline;
        let l = pipeline.name.length - 1;
        if (isLinkedCI) {
            l = pipeline.name.lastIndexOf('-');
        }
        let ciNodeHeight = getCINodeHeight(dimensions.type, pipeline);
        let ciNode = {
            isSource: true,
            isGitSource: false,
            isRoot: false,
            parents: sourceNodes.map(sn => sn.id),
            id: String(pipeline.id),
            x: 0,
            y: 0,
            parentAppId: pipeline.parentAppId,
            parentCiPipeline: pipeline.parentCiPipeline,
            height: ciNodeHeight,
            width: dimensions.cINodeSizes.nodeWidth,
            title: isLinkedCI ? pipeline.name.substring(0, l) || pipeline.name : pipeline.name, //show parent CI name if Linked CI
            triggerType: TriggerTypeMap[trigger],
            status: DEFAULT_STATUS,
            type: 'CI',
            inputMaterialList: [],
            downstreams: [],
            isExternalCI: isExternalCI,
            isLinkedCI: isLinkedCI,
            linkedCount: pipeline.linkedCount || 0,
        } as NodeAttr
        let relevantWF = workflows
            //We will act on all those workflows which have this CI
            //count of this would be one as same CI cannot be shared across
            .filter(w => w.dag && w.dag.filter(n => n.type == "CI_PIPELINE" && n.componentId == pipeline.id).length > 0);

        relevantWF.forEach(w => {
            //push these source nodes and CI node to the nodes of this workflow
            w.nodes.push(...sourceNodes, ciNode)
        })
        if (cdConfig && cdConfig.pipelines) {
            relevantWF.forEach(w => {
                //CD nodes which have this CI as parent are only relevant
                let relevantCD = w.dag.filter(n => n.type == "CD_PIPELINE" && n.parentId == pipeline.id && n.parentType == "CI_PIPELINE")
                let ciChildren = cdConfig.pipelines.filter((cd) => relevantCD.filter(n => n.componentId == cd.id).length > 0);
                ciNode.downstreams = ciChildren.map(cd => {
                    if (dimensions.type === 'trigger' && cd.preStage && !isEmpty(cd.preStage.config)) { return `PRECD-${cd.id}` } else { return `CD-${cd.id}` }
                })
                ciChildren.forEach((cd, cdIndex) => {
                    let trigger = cd.triggerType.toLowerCase() || '';
                    let preCD, postCD;
                    let stageIndex = 1;
                    if (cd.preStage && cd.preStage.config && !isEmpty(cd.preStage.config)) {
                        let trigger = cd.preStage.triggerType ? cd.preStage.triggerType.toLowerCase() : '';
                        preCD = {
                            parents: [ciNode.id],
                            height: dimensions.cDNodeSizes.nodeHeight,
                            width: dimensions.cDNodeSizes.nodeWidth,
                            title: cd.preStage.name,
                            isSource: false,
                            isGitSource: false,
                            id: String(cd.id),
                            activeIn: false,
                            activeOut: false,
                            downstreams: [`CD-${cd.id}`],
                            type: 'PRECD',
                            status: cd.preStage.status || DEFAULT_STATUS,
                            triggerType: TriggerTypeMap[trigger],
                            environmentName: cd.environmentName || "",
                            environmentId: cd.environmentId,
                            deploymentStrategy: cd.deploymentTemplate.toLowerCase() || '',
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
                    if (dimensions.type === 'trigger' && cd.postStage && !isEmpty(cd.postStage.config)) {
                        cdDownstreams = [`POSTCD-${cd.id}`]
                    }
                    let CD = {
                        parents: [ciNode.id],
                        height: dimensions.cDNodeSizes.nodeHeight,
                        width: dimensions.cDNodeSizes.nodeWidth,
                        title: cd.name,
                        isSource: false,
                        isGitSource: false,
                        id: String(cd.id),
                        activeIn: false,
                        activeOut: false,
                        downstreams: cdDownstreams,
                        type: 'CD',
                        status: DEFAULT_STATUS,
                        triggerType: TriggerTypeMap[trigger],
                        environmentName: cd.environmentName ? cd.environmentName : "",
                        environmentId: cd.environmentId,
                        deploymentStrategy: cd.deploymentTemplate.toLowerCase() || '',
                        inputMaterialList: [],
                        rollbackMaterialList: [],
                        stageIndex: stageIndex,
                        x: 0,
                        y: 0,
                        isRoot: false,
                        preNode: undefined,
                        postNode: undefined
                    } as NodeAttr
                    stageIndex++;

                    if (cd.postStage && cd.postStage.config && !isEmpty(cd.postStage.config)) {
                        let trigger = cd.postStage.triggerType.toLowerCase() || '';
                        postCD = {
                            parents: [cd.id],
                            height: dimensions.cDNodeSizes.nodeHeight,
                            width: dimensions.cDNodeSizes.nodeWidth,
                            title: cd.postStage.name,
                            isSource: false,
                            isGitSource: false,
                            id: String(cd.id),
                            activeIn: false,
                            activeOut: false,
                            downstreams: [],
                            type: 'POSTCD',
                            status: cd.postStage.status || DEFAULT_STATUS,
                            triggerType: TriggerTypeMap[trigger],
                            environmentName: cd.environmentName ? cd.environmentName : "",
                            environmentId: cd.environmentId,
                            deploymentStrategy: cd.deploymentTemplate.toLowerCase() || '',
                            inputMaterialList: [],
                            rollbackMaterialList: [],
                            stageIndex: stageIndex,
                            x: 0,
                            y: 0,
                            isRoot: false
                        } as NodeAttr;
                    }
                    if (dimensions.type === 'trigger') {
                        CD.preNode = preCD;
                        CD.postNode = postCD;
                    }
                    if (preCD && dimensions.type === 'trigger') w.nodes.push(preCD)
                    w.nodes.push(CD)
                    if (postCD && dimensions.type === 'trigger') w.nodes.push(postCD)
                    if (dimensions.type === 'create') {
                        let title = "";
                        title += preCD ? "Pre-deploy, " : "";
                        title += "Deploy";
                        title += postCD ? ", Post-deploy" : "";
                        CD.title = title;
                    }
                })
            })
        }
    })
    if (dimensions.type == 'trigger') {
        workflows = workflows.filter(wf => wf.nodes.length > 0);
    }
    //dag was a placeholder for workflow tree for easier processing
    //not needed anymore
    workflows.forEach(w => delete w['dag'])
    workflows.forEach((w, i) => {
        let startY = 0;
        let startX = 0;
        let sn = w.nodes.filter(n => n.type == 'GIT')
        let cin = w.nodes.filter(n => n.type == 'CI')
        let cdn = w.nodes.filter(n => n.type == 'CD')
        //start with source node as this is the first node
        sn.forEach((s, si) => {
            let sourceNodeY = startY + workflowOffset.offsetY + si * (dimensions.staticNodeSizes.nodeHeight + dimensions.staticNodeSizes.distanceY);
            s.x = 0 + workflowOffset.offsetX
            s.y = sourceNodeY;
            s.height = dimensions.staticNodeSizes.nodeHeight
            s.width = dimensions.staticNodeSizes.nodeWidth
            //then do it for CI nodes
            cin.filter(n => {
                return s.downstreams.filter(sn => sn == `CI-${n.id}`).length > 0
            }).forEach((ci, cii) => {
                let ciNodeY = workflowOffset.offsetY + startY;
                ci.x = workflowOffset.offsetX + startX + dimensions.staticNodeSizes.nodeWidth + dimensions.staticNodeSizes.distanceX
                ci.y = i ? ciNodeY : ciNodeY
                //finally do it for CD nodes
                cdn.filter((cd, cdi) => {
                    let cdNodeY = workflowOffset.offsetY + startY + cdi * (dimensions.cDNodeSizes.nodeHeight + dimensions.cDNodeSizes.distanceY)
                    if (cd.preNode) {
                        cd.preNode.y = i ? cdNodeY : cdNodeY
                        cd.preNode.x = ci.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX
                        cd.x = cd.preNode.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX
                        cd.y = cd.preNode.y
                        if (cd.postNode) {
                            cd.postNode.y = cd.preNode.y
                            cd.postNode.x = cd.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX
                        }
                    } else {
                        cd.y = i ? cdNodeY : cdNodeY
                        cd.x = ci.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX
                        if (cd.postNode) {
                            cd.postNode.y = cd.y
                            cd.postNode.x = cd.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX
                        }
                    }
                })
            })
        })
        let workflowWidth = dimensions.type === 'create' ? 840 : 1280;
        gitHeight = sn.length * (dimensions.staticNodeSizes.nodeHeight + dimensions.staticNodeSizes.distanceY);
        ciHeight = cin ? (dimensions.cINodeSizes.nodeHeight + dimensions.cINodeSizes.distanceY) : 0;
        cdHeight = cdn.length * (dimensions.cDNodeSizes.nodeHeight + dimensions.cDNodeSizes.distanceY);
        let maxHeight = getLargestNumber([gitHeight, ciHeight, cdHeight]);
        w.height = maxHeight + workflowOffset.offsetY;
        w.startY = i == 0 ? 0 : startY;
        w.width = workflowWidth;
    })
    return { appName, workflows };
}

function getCINodeHeight(dimensionType: 'trigger' | 'create', pipeline): number {
    if (dimensionType === 'create') return WorkflowCreate.cINodeSizes.nodeHeight;
    else {
        if (pipeline.parentCiPipeline) //linked CI pipeline
            return WorkflowTrigger.linkedCINodeSizes.nodeHeight;
        else if (pipeline.isExternal) return WorkflowTrigger.externalCINodeSizes.nodeHeight; //external CI
        else return WorkflowTrigger.cINodeSizes.nodeHeight;
    }
}

function getLargestNumber(arr: number[]): number {
    if (!arr.length) return 0;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (max < arr[i]) max = arr[i];
    }
    return max;
}