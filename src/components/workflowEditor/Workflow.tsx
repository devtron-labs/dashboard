/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'react'
import { RouteComponentProps, Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { CINode } from './nodes/CINode'
import { CDNode } from './nodes/CDNode'
import { StaticNode } from './nodes/StaticNode'
import {
    RectangularEdge as Edge,
    getLinkedCIPipelineURL,
    getCIPipelineURL,
    getCDPipelineURL,
    getExCIPipelineURL,
    getWebhookDetailsURL,
    importComponentFromFELibrary,
} from '../common'
import { PipelineSelect } from './PipelineSelect'
import { WorkflowCreate } from '../app/details/triggerView/config'
import { WebhookNode } from './nodes/WebhookNode'
import WebhookTippyCard from './nodes/WebhookTippyCard'
import DeprecatedPipelineWarning from './DeprecatedPipelineWarning'
import { GIT_BRANCH_NOT_CONFIGURED, URLS } from '../../config'
import {
    CommonNodeAttr,
    AddCDPositions,
    noop,
    WorkflowNodeType,
    PipelineType,
    AddPipelineType,
    SelectedNode,
    ConditionalWrap,
    ChangeCIPayloadType,
    CIPipelineNodeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICInput } from '../../assets/icons/ic-input.svg'
import { ReactComponent as ICMoreOption } from '../../assets/icons/ic-more-option.svg'
import { ReactComponent as ICDelete } from '../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as ICEdit } from '../../assets/icons/ic-pencil.svg'
import { WorkflowPositionState } from './types'
import { CHANGE_CI_TOOLTIP } from './constants'

const ApprovalNodeEdge = importComponentFromFELibrary('ApprovalNodeEdge')
const LinkedCDNode = importComponentFromFELibrary('LinkedCDNode')
const getParsedPluginPolicyConsequenceData = importComponentFromFELibrary(
    'getParsedPluginPolicyConsequenceData',
    () => null,
    'function',
)

export interface WorkflowProps
    extends RouteComponentProps<{ appId: string; workflowId?: string; ciPipelineId?: string; cdPipelineId?: string }> {
    nodes: CommonNodeAttr[]
    id: number
    name: string
    startX: number
    startY: number
    width: number | string
    height: number | string
    showDeleteDialog: (workflowId: number) => void
    handleCDSelect: (
        workflowId: number | string,
        ciPipelineId: number | string,
        parentPipelineType: string,
        parentPipelineId: number | string,
        isWebhookCD?: boolean,
        childPipelineId?: number | string,
        addType?: AddPipelineType,
    ) => void
    openEditWorkflow: (event, workflowId: number) => string
    handleCISelect: (workflowId: string | number, type: CIPipelineNodeType) => void
    addCIPipeline: (type: CIPipelineNodeType) => void
    addWebhookCD: (workflowId?: number | string) => void
    cdWorkflowList?: any[]
    showWebhookTippy?: boolean
    hideWebhookTippy?: () => void
    isJobView?: boolean
    envList?: any[]
    filteredCIPipelines?: any[]
    addNewPipelineBlocked?: boolean
    handleChangeCI?: (changeCIPayload: ChangeCIPayloadType) => void
    selectedNode?: SelectedNode
    handleSelectedNodeChange?: (selectedNode: SelectedNode) => void
    appName?: string
    getWorkflows?: () => void
    reloadEnvironments?: () => void
    workflowPositionState?: WorkflowPositionState
    handleDisplayLoader?: () => void
    isOffendingPipelineView?: boolean
}

interface WorkflowState {
    top: number
    left: number
    showCIMenu: boolean
}

export class Workflow extends Component<WorkflowProps, WorkflowState> {
    constructor(props) {
        super(props)
        this.state = {
            showCIMenu: false,
            top: 0,
            left: 0,
        }
        this.renderWebhookTippyContent = this.renderWebhookTippyContent.bind(this)
    }

    setPosition = (top: number, left: number) => {
        this.setState({ top, left })
    }

    getNodesData = ({ nodeId, nodesWithBufferHeight }: { nodeId: string; nodesWithBufferHeight: CommonNodeAttr[] }) => {
        const _nodes = [...nodesWithBufferHeight]
        const _cdNamesList = this.props.cdWorkflowList?.find((_cwf) => _cwf.ciPipelineId === +nodeId)?.cdPipelines || []

        if (_cdNamesList?.length > 0) {
            _nodes.push({
                type: 'CD',
                parents: [],
                title: 'Deploy',
                id: nodeId,
                isSource: false,
                isGitSource: false,
                isRoot: false,
                downstreams: [],
                height: _cdNamesList.length > 9 ? 225 : 44 + _cdNamesList.length * 20,
                width: WorkflowCreate.cDNodeSizes.nodeWidth,
                x: 580,
                y: 25,
                showPluginWarning: false,
                isTriggerBlocked: false,
                pluginBlockState: getParsedPluginPolicyConsequenceData() || null,
                approvalConfigData: null,
            })
        }

        return {
            nodes: _nodes,
            cdNamesList: _cdNamesList || [],
        }
    }

    goToWorkFlowEditor = (node: CommonNodeAttr) => {
        if (node.branch === GIT_BRANCH_NOT_CONFIGURED) {
            this.props.history.push(
                getCIPipelineURL(
                    this.props.match.params.appId,
                    this.props.id.toString(),
                    true,
                    node.downstreams[0].split('-')[1],
                    this.props.isJobView,
                    node.isJobCI,
                ),
            )
        }
    }

    renderAdditionalEdge() {
        return (
            <g
                className="edge-group"
                style={{
                    cursor: 'pointer',
                }}
            >
                <path
                    className="color-path"
                    d="M520 56 L 580 56"
                    fill="transparent"
                    stroke="var(--N400)"
                    strokeWidth="2"
                />
                <path d="M575 56 L 555 46 L 565 56 L 555 66 Z" fill="var(--N600)" />
            </g>
        )
    }

    // The logic for rendering edges are: if there are few child nodes, then show parallel edge as well.
    // In case of approval we have a special edge.
    // In case there are more than one child nodes, then we will show add cd button thrice.
    // AND renderAdditionalEdge would only work for cdWorkflowList that is CIConfigDiffView
    renderNodes({ nodesWithBufferHeight }: { nodesWithBufferHeight: CommonNodeAttr[] }) {
        const ci = nodesWithBufferHeight.find((node) => node.type == WorkflowNodeType.CI && !node.isLinkedCD)
        const webhook = nodesWithBufferHeight.find((node) => node.type == WorkflowNodeType.WEBHOOK)
        const linkedCD = nodesWithBufferHeight.find((node) => node.isLinkedCD)
        const _nodesData = this.getNodesData({
            nodeId: ci?.id || webhook?.id || linkedCD?.id || '',
            nodesWithBufferHeight,
        })
        const _nodes = _nodesData.nodes

        if (linkedCD) {
            return _nodes.map((node) => {
                if (node.isLinkedCD && LinkedCDNode) {
                    return this.renderLinkedCD(node)
                }
                if (_nodesData.cdNamesList.length > 0) {
                    return (
                        <>
                            {this.renderAdditionalEdge()}
                            {this.renderCDNodes(node, linkedCD.id, false, _nodesData.cdNamesList)}
                        </>
                    )
                }

                return this.renderCDNodes(node, linkedCD.id, false)
            })
        }
        if (ci) {
            return _nodes.map((node) => {
                if (node.type == WorkflowNodeType.GIT) {
                    return this.renderSourceNode(node, ci)
                }
                if (node.type == WorkflowNodeType.CI) {
                    return this.renderCINodes(node)
                }
                if (_nodesData.cdNamesList.length > 0) {
                    return (
                        <>
                            {this.renderAdditionalEdge()}
                            {this.renderCDNodes(node, ci.id, false, _nodesData.cdNamesList)}
                        </>
                    )
                }

                return this.renderCDNodes(node, ci.id, false)
            })
        }
        if (webhook) {
            return _nodes.map((node) => {
                if (node.type == WorkflowNodeType.WEBHOOK) {
                    return this.renderWebhookNode(node)
                }
                if (_nodesData.cdNamesList.length > 0) {
                    return (
                        <>
                            {this.renderAdditionalEdge()}
                            {this.renderCDNodes(node, webhook.id, true, _nodesData.cdNamesList)}
                        </>
                    )
                }

                return this.renderCDNodes(node, webhook.id, true)
            })
        }
        return this.renderAddCIpipeline()
    }

    renderAddCIpipeline() {
        return (
            <foreignObject
                className="data-hj-whitelist"
                x={WorkflowCreate.workflow.offsetX}
                y={WorkflowCreate.workflow.offsetY}
                height={WorkflowCreate.staticNodeSizes.nodeHeight}
                width={WorkflowCreate.staticNodeSizes.nodeWidth}
            >
                <button
                    type="button"
                    className="pipeline-select__button"
                    onClick={(event: any) => {
                        const { bottom, left } = event.target.getBoundingClientRect()
                        this.setState({
                            showCIMenu: !this.state.showCIMenu,
                            left,
                            top: bottom,
                        })
                    }}
                >
                    Add CI Pipeline
                </button>
            </foreignObject>
        )
    }

    renderSourceNode(node, ci) {
        return (
            <StaticNode
                x={node.x}
                y={node.y}
                url={node.url}
                branch={node.branch}
                height={node.height}
                width={node.width}
                id={node.id}
                key={`static-${node.id}-${node.x - node.y}`}
                title={node.title}
                downstreams={node.downstreams}
                icon={node.icon}
                sourceType={node.sourceType}
                regex={node.regex}
                primaryBranchAfterRegex={node.primaryBranchAfterRegex}
                to={this.openCIPipeline(ci)} // ci attribites for a git material
                handleGoToWorkFlowEditor={() => {
                    this.goToWorkFlowEditor(node)
                }}
            />
        )
    }

    renderWebhookNode(node) {
        return (
            <WebhookNode
                x={node.x}
                y={node.y}
                height={node.height}
                width={node.width}
                key={`webhook-${node.id}`}
                id={node.id}
                to={this.openWebhookDetails(node)}
                configDiffView={this.props.cdWorkflowList?.length > 0}
                toggleCDMenu={() => {
                    this.props.hideWebhookTippy()
                    this.props.handleCDSelect(this.props.id, node.id, PipelineType.WEBHOOK, node.id, true)
                }}
                hideWebhookTippy={this.props.hideWebhookTippy}
                addNewPipelineBlocked={this.props.addNewPipelineBlocked}
                handleSelectedNodeChange={this.props.handleSelectedNodeChange}
                selectedNode={this.props.selectedNode}
                isLastNode={node.downstreams.length === 0}
                isReadonlyView={this.props.isOffendingPipelineView}
            />
        )
    }

    openCDPipeline(node: CommonNodeAttr, isWebhookCD: boolean) {
        const { appId } = this.props.match.params

        if (this.props.isOffendingPipelineView) {
            return getCDPipelineURL(
                appId,
                this.props.id.toString(),
                String(node.connectingCiPipelineId ?? 0),
                isWebhookCD,
                node.id,
                true,
            )
        }

        return `${this.props.match.url}/${getCDPipelineURL(
            appId,
            this.props.id.toString(),
            String(node.connectingCiPipelineId ?? 0),
            isWebhookCD,
            node.id,
        )}`
    }

    openCIPipeline(node: CommonNodeAttr) {
        if (node.isExternalCI && !node.isLinkedCI) {
            return `${this.props.match.url}/deprecated-warning`
        }
        const { appId } = this.props.match.params
        let url = ''
        if (node.isLinkedCI) {
            url = getLinkedCIPipelineURL(appId, this.props.id.toString(), node.id, this.props.isOffendingPipelineView)
        } else if (node.isExternalCI) {
            url = getExCIPipelineURL(appId, this.props.id.toString(), node.id)
        } else {
            url = getCIPipelineURL(
                appId,
                this.props.id.toString(),
                node.branch === GIT_BRANCH_NOT_CONFIGURED || this.props.isOffendingPipelineView,
                node.id,
                this.props.isJobView,
                node.isJobCI,
            )
        }

        if (this.props.isOffendingPipelineView) {
            return url
        }
        return `${this.props.match.url}/${url}`
    }

    openWebhookDetails(node: CommonNodeAttr) {
        return `${this.props.match.url}/${getWebhookDetailsURL(this.props.id.toString(), node.id)}`
    }

    renderCINodes(node) {
        return (
            <CINode
                x={node.x}
                y={node.y}
                height={node.height}
                width={node.width}
                key={`ci-${node.id}`}
                id={node.id}
                workflowId={this.props.id}
                isTrigger={false}
                type={node.type}
                downstreams={node.downstreams}
                title={node.title}
                triggerType={node.triggerType}
                description={node.description}
                isExternalCI={node.isExternalCI}
                isLinkedCI={node.isLinkedCI}
                isJobCI={node.isJobCI}
                linkedCount={node.linkedCount}
                toggleCDMenu={() => {
                    this.props.hideWebhookTippy()
                    this.props.handleCDSelect(this.props.id, node.id, 'ci-pipeline', node.id)
                }}
                to={this.openCIPipeline(node)}
                configDiffView={this.props.cdWorkflowList?.length > 0}
                hideWebhookTippy={this.props.hideWebhookTippy}
                isJobView={this.props.isJobView}
                showPluginWarning={node.showPluginWarning}
                envList={this.props.envList}
                filteredCIPipelines={this.props.filteredCIPipelines}
                addNewPipelineBlocked={this.props.addNewPipelineBlocked}
                handleSelectedNodeChange={this.props.handleSelectedNodeChange}
                selectedNode={this.props.selectedNode}
                isLastNode={node.downstreams.length === 0}
                history={this.props.history}
                location={this.props.location}
                match={this.props.match}
                isOffendingPipelineView={this.props.isOffendingPipelineView}
            />
        )
    }

    renderLinkedCD(node: CommonNodeAttr) {
        return (
            <LinkedCDNode
                key={`linked-cd-${node.id}`}
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                configDiffView={this.props.cdWorkflowList?.length > 0}
                title={node.title}
                redirectTo={`${URLS.APP}/${this.props.match.params.appId}/${URLS.APP_CONFIG}/${
                    URLS.APP_WORKFLOW_CONFIG
                }/${this.props.id ?? 0}/${URLS.LINKED_CD}?changeCi=0&switchFromCiPipelineId=${
                    node.id
                }&switchFromExternalCiPipelineId=0`}
                blockAddNewPipeline={this.props.addNewPipelineBlocked}
                toggleCDMenu={() => {
                    this.props.handleCDSelect(this.props.id, node.id, 'ci-pipeline', node.id)
                }}
                history={this.props.history}
                handleSelectedNodeChange={this.props.handleSelectedNodeChange}
                selectedNode={this.props.selectedNode}
                id={node.id}
                isLastNode={node.downstreams.length === 0}
                deploymentAppDeleteRequest={node.deploymentAppDeleteRequest}
                readOnly={this.props.isOffendingPipelineView}
            />
        )
    }

    renderCDNodes(node: CommonNodeAttr, ciPipelineId: string | number, isWebhookCD: boolean, cdNamesList?: string[]) {
        if (this.props.cdWorkflowList?.length > 0 && !cdNamesList?.length) {
            return
        }

        return (
            <CDNode
                key={node.id}
                x={node.x}
                y={node.y}
                height={node.height}
                width={node.width}
                id={`cd- ${node.id}`}
                workflowId={this.props.id}
                title={node.title}
                environmentName={node.environmentName}
                environmentId={node.environmentId}
                description={node.description}
                triggerType={node.triggerType}
                deploymentStrategy={node.deploymentStrategy}
                toggleCDMenu={() => {
                    this.props.hideWebhookTippy()
                    this.props.handleCDSelect(this.props.id, ciPipelineId, 'cd-pipeline', node.id, isWebhookCD)
                }}
                to={this.openCDPipeline(node, isWebhookCD)}
                cdNamesList={cdNamesList}
                hideWebhookTippy={this.props.hideWebhookTippy}
                deploymentAppDeleteRequest={node.deploymentAppDeleteRequest}
                match={this.props.match}
                isVirtualEnvironment={node.isVirtualEnvironment}
                addNewPipelineBlocked={this.props.addNewPipelineBlocked}
                handleSelectedNodeChange={this.props.handleSelectedNodeChange}
                selectedNode={this.props.selectedNode}
                appName={this.props.appName ?? ''}
                // Since we only have this correct for CDNodes so using it here only
                isLastNode={node.isLast}
                deploymentAppType={node.deploymentAppType}
                appId={this.props.match.params.appId}
                getWorkflows={this.props.getWorkflows}
                reloadEnvironments={this.props.reloadEnvironments}
                deploymentAppCreated={node.deploymentAppCreated}
                isDeploymentBlocked={node.isDeploymentBlocked}
                handleDisplayLoader={this.props.handleDisplayLoader}
                showPluginWarning={node.showPluginWarning}
                isOffendingPipelineView={this.props.isOffendingPipelineView}
            />
        )
    }

    getEdges({ nodesWithBufferHeight }: { nodesWithBufferHeight: CommonNodeAttr[] }) {
        return nodesWithBufferHeight.reduce((edgeList, node) => {
            node.downstreams.forEach((downStreamNodeId) => {
                const endNode = nodesWithBufferHeight.find((val) => `${val.type}-${val.id}` == downStreamNodeId)
                edgeList.push({
                    startNode: node,
                    endNode,
                })
            })
            return edgeList
        }, [])
    }

    getAddCDButtonTooltipContent = (node: CommonNodeAttr): string => {
        const environments = node.downstreamEnvironments?.map((env) => env.environmentName) ?? []
        const environmentsString = environments.slice(0, 3).join('\n')
        const moreEnvCount = environments.length - 3
        const moreEnvString = moreEnvCount > 0 ? `\n+${moreEnvCount}` : ''
        return `before pipelines\n${environmentsString} ${moreEnvString}`
    }

    onClickNodeEdge = ({
        nodeId,
        nodesWithBufferHeight,
    }: {
        nodeId: number
        nodesWithBufferHeight: CommonNodeAttr[]
    }) => {
        const ciPipeline = nodesWithBufferHeight.find((nd) => nd.type == WorkflowNodeType.CI)
        this.props.history.push(`workflow/${this.props.id}/ci-pipeline/${+ciPipeline?.id}/cd-pipeline/${nodeId}`)
    }

    renderEdgeList({ nodesWithBufferHeight }: { nodesWithBufferHeight: CommonNodeAttr[] }) {
        const edges = this.getEdges({ nodesWithBufferHeight })
        const selectedNodeKey = `${this.props.selectedNode?.nodeType}-${this.props.selectedNode?.id}`
        const selectedNodeEndNodes = edges
            .filter((edgeNode) => `${edgeNode.startNode.type}-${edgeNode.startNode.id}` === selectedNodeKey)
            .map((edgeNode) => edgeNode.endNode)
        // Hoping only one CIPipeline is present in one workflow
        const workflowCIPipelineId = nodesWithBufferHeight.find((node) => node.type == WorkflowNodeType.CI)?.id ?? 0
        const isWebhookCD = !!nodesWithBufferHeight.find((node) => node.type == WorkflowNodeType.WEBHOOK)

        const edgeList = this.getEdges({ nodesWithBufferHeight }).map((edgeNode) => {
            // checking if edgeNode is same as selectedNode
            const currentNodeIdentifier = `${edgeNode.startNode.type}-${edgeNode.startNode.id}`
            const isSelectedEdge = selectedNodeKey === currentNodeIdentifier
            const addCDButtons = isSelectedEdge ? [AddCDPositions.RIGHT] : []

            if (!this.props.isOffendingPipelineView && ApprovalNodeEdge) {
                // The props that will be helpful are showAddCD
                return (
                    <ApprovalNodeEdge
                        key={`trigger-edge-${edgeNode.startNode.id}${edgeNode.startNode.y}-${edgeNode.endNode.id}`}
                        startNode={edgeNode.startNode}
                        endNode={edgeNode.endNode}
                        onClickEdge={() => this.onClickNodeEdge({ nodeId: edgeNode.endNode.id, nodesWithBufferHeight })}
                        edges={edges}
                        addCDButtons={addCDButtons}
                        handleCDSelect={this.props.handleCDSelect}
                        ciPipelineId={workflowCIPipelineId}
                        workflowId={this.props.id}
                        isWebhookCD={isWebhookCD}
                        showApprovalConfigInfoTippy
                    />
                )
            }

            return (
                <Edge
                    key={`trigger-edge-${edgeNode.startNode.id}${edgeNode.startNode.y}-${edgeNode.endNode.id}`}
                    startNode={edgeNode.startNode}
                    endNode={edgeNode.endNode}
                    onClickEdge={noop}
                    deleteEdge={noop}
                    onMouseOverEdge={noop}
                    addCDButtons={addCDButtons}
                    handleCDSelect={this.props.handleCDSelect}
                    ciPipelineId={workflowCIPipelineId}
                    workflowId={this.props.id}
                    isWebhookCD={isWebhookCD}
                />
            )
        })

        if (this.props.selectedNode && selectedNodeEndNodes?.length > 0) {
            // Finding the startNode that as same key as selectedNode
            const selectedNodeKey = `${this.props.selectedNode.nodeType}-${this.props.selectedNode.id}`
            const startNode = nodesWithBufferHeight.find((node) => `${node.type}-${node.id}` === selectedNodeKey)
            // Creating a dummy endNode
            // To create it, we need to find the endNode from startNode that has maximum y value
            // We will use this endNode to create a dummy edge.
            let endNode = null
            let maxY = 0
            startNode.downstreams.forEach((downStreamNodeId) => {
                const node = nodesWithBufferHeight.find((val) => `${val.type}-${val.id}` == downStreamNodeId)
                if (node.y > maxY) {
                    maxY = node.y
                    endNode = node
                }
            })
            endNode = JSON.parse(JSON.stringify(endNode))
            endNode.y += WorkflowCreate.cDNodeSizes.distanceY + WorkflowCreate.cDNodeSizes.nodeHeight

            const addCDButtons =
                selectedNodeEndNodes.length > 1 ? [AddCDPositions.LEFT, AddCDPositions.RIGHT] : [AddCDPositions.RIGHT]

            const leftTooltipContent = this.getAddCDButtonTooltipContent(startNode)
            if (!this.props.isOffendingPipelineView && ApprovalNodeEdge) {
                edgeList.push(
                    <ApprovalNodeEdge
                        key={`trigger-edge-${this.props.selectedNode.id}-dummy-node`}
                        startNode={startNode}
                        edges={edges}
                        endNode={endNode}
                        onClickEdge={noop}
                        addCDButtons={addCDButtons}
                        handleCDSelect={this.props.handleCDSelect}
                        workflowId={this.props.id}
                        ciPipelineId={workflowCIPipelineId}
                        isParallelEdge
                        isWebhookCD={isWebhookCD}
                        leftTooltipContent={leftTooltipContent}
                        showApprovalConfigInfoTippy
                    />,
                )
            } else {
                edgeList.push(
                    <Edge
                        key={`trigger-edge-${this.props.selectedNode.id}-dummy-node`}
                        startNode={startNode}
                        endNode={endNode}
                        onClickEdge={noop}
                        deleteEdge={noop}
                        onMouseOverEdge={noop}
                        addCDButtons={addCDButtons}
                        handleCDSelect={this.props.handleCDSelect}
                        workflowId={this.props.id}
                        ciPipelineId={workflowCIPipelineId}
                        isParallelEdge
                        isWebhookCD={isWebhookCD}
                        leftTooltipContent={leftTooltipContent}
                    />,
                )
            }
        }
        return edgeList
    }

    toggleShowDeleteDialog = () => {
        this.props.showDeleteDialog(this.props.id)
    }

    handleCIChange = ({ nodesWithBufferHeight }: { nodesWithBufferHeight: CommonNodeAttr[] }) => {
        const payload: ChangeCIPayloadType = {
            appWorkflowId: Number(this.props.id),
            appId: Number(this.props.match.params.appId),
        }

        const switchFromCiPipelineId = nodesWithBufferHeight.find((nd) => nd.type == WorkflowNodeType.CI)?.id

        if (switchFromCiPipelineId) {
            payload.switchFromCiPipelineId = Number(switchFromCiPipelineId)
        } else {
            const externalCiPipelineId = nodesWithBufferHeight.find(
                (nd) => nd.isExternalCI && nd.type === WorkflowNodeType.WEBHOOK,
            )?.id
            if (externalCiPipelineId) {
                payload.switchFromExternalCiPipelineId = Number(externalCiPipelineId)
            }
        }
        this.props.handleChangeCI?.(payload)
    }

    renderWebhookTippyContent({ nodesWithBufferHeight }: { nodesWithBufferHeight: CommonNodeAttr[] }) {
        const webhookNode = nodesWithBufferHeight.find((nd) => nd.type == WorkflowNodeType.WEBHOOK)
        return <WebhookTippyCard link={this.openWebhookDetails(webhookNode)} hideTippy={this.props.hideWebhookTippy} />
    }

    handleNewJobRedirection = () => {
        this.props.history.push(
            `${URLS.JOB}/${this.props.match.params.appId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${this.props.id}/${URLS.APP_CI_CONFIG}/0`,
        )
    }

    emptyWorkflow = () => (
        <div className="fs-12 cn-7 pt-16 pb-16 pr-16 pl-16">
            <div
                className="text-center lh-18 bg__secondary flexbox-col dc__align-items-center bw-1 en-2 dashed h-100 dc__content-center br-4 pt-16 pb-16 cursor"
                onClick={this.handleNewJobRedirection}
            >
                <div className="fw-6 mb-4 w-300">Add job pipeline to this workflow</div>
                <div className="fw-4 w-300">
                    Job pipeline enables you to execute a series of tasks manually or automatically
                </div>
            </div>
        </div>
    )

    renderChangeCITooltip = (isChangeCIEnabled: boolean) => {
        if (isChangeCIEnabled) {
            return CHANGE_CI_TOOLTIP.TITLE
        }

        return (
            <div className="flexbox-col dc__gap-4 w-200">
                <p className="m-0 cn-0 fs-12 fw-6 lh-18">{CHANGE_CI_TOOLTIP.TITLE}</p>
                <p className="cn-0 m-0 fs-12 fw-4 lh-18">{CHANGE_CI_TOOLTIP.DISABLED}</p>
            </div>
        )
    }

    getNodesWithBufferHeight = (): CommonNodeAttr[] => {
        if (this.props.workflowPositionState?.selectedWorkflowId !== this.props.id) {
            return this.props.nodes
        }

        const originalNodes = structuredClone(this.props.nodes)
        const bufferHeight = WorkflowCreate.cDNodeSizes.distanceY + WorkflowCreate.cDNodeSizes.nodeHeight
        const bufferNodes = this.props.workflowPositionState?.nodes ?? []
        // would traverse through nodes if type and id matches with bufferNodes then would add bufferHeight to y
        const nodesWithBufferHeight = originalNodes?.map((originalNode) => {
            const bufferNode = bufferNodes.find(
                (bufferNode) => bufferNode.type === originalNode.type && bufferNode.id === originalNode.id,
            )
            if (bufferNode) {
                originalNode.y += bufferHeight
            }
            return originalNode
        })
        return nodesWithBufferHeight
    }

    renderWorkflow() {
        const parallelEdgeMaxY =
            this.props.workflowPositionState?.selectedWorkflowId === this.props.id
                ? this.props.workflowPositionState?.maxY
                : 0
        // This variable can be converted into some sort of manipulatedNodes array
        const nodesWithBufferHeight = this.getNodesWithBufferHeight() ?? []
        let ciPipelineId = 0
        const ciPipeline = nodesWithBufferHeight.find((nd) => nd.type == WorkflowNodeType.CI)
        ciPipelineId = ciPipeline ? +ciPipeline.id : ciPipelineId
        const configDiffView = this.props.cdWorkflowList?.length > 0
        const isExternalCiWorkflow = nodesWithBufferHeight.some(
            (node) => node.isExternalCI && !node.isLinkedCI && node.type === WorkflowNodeType.CI,
        )

        // If no node is present in workflow then disable change CI button
        const isChangeCIEnabled = !this.props.isOffendingPipelineView && nodesWithBufferHeight.length > 0

        return (
            <ConditionalWrap
                condition={!this.props.isOffendingPipelineView && this.props.showWebhookTippy}
                wrap={(children) => (
                    <Tippy
                        placement="top-start"
                        arrow
                        // TODO: Move this Tippy into a separate block/component so we get rid of arrow function
                        render={() => this.renderWebhookTippyContent({ nodesWithBufferHeight })}
                        showOnCreate
                        interactive
                        onClickOutside={this.props.hideWebhookTippy}
                        delay={500}
                        animation="fade"
                    >
                        {children}
                    </Tippy>
                )}
            >
                <div
                    className={
                        configDiffView
                            ? 'mb-20 workflow workflow--create'
                            : 'workflow--create flexbox-col mb-16 dc__gap-6 workflow-action-header'
                    }
                    style={{
                        minWidth: configDiffView
                            ? typeof this.props.width === 'string'
                                ? this.props.width
                                : `${this.props.width}px`
                            : 'auto',
                    }}
                >
                    <div
                        className={
                            configDiffView
                                ? 'workflow__header'
                                : 'flexbox dc__align-items-center dc__align-self_center dc__gap-8'
                        }
                        data-testid="workflow-header"
                    >
                        <span className="m-0 cn-9 fs-13 fw-6 lh-20">{this.props.name}</span>
                        {!this.props.isOffendingPipelineView && !configDiffView && (
                            <div className="flexbox dc__align-items-center dc__gap-8">
                                <ICMoreOption className="icon-dim-16 fcn-6 cursor workflow-header-menu-icon" />

                                {!this.props.isJobView && (
                                    <Tippy
                                        content="Edit workflow name"
                                        placement="top"
                                        arrow={false}
                                        className="default-tt"
                                    >
                                        <Link to={this.props.openEditWorkflow(null, this.props.id)}>
                                            <button
                                                type="button"
                                                className="p-0 dc__no-background dc__no-border dc__outline-none-imp flex workflow-header-action-btn"
                                            >
                                                <ICEdit className="icon-dim-16" />
                                            </button>
                                        </Link>
                                    </Tippy>
                                )}

                                {!!this.props.handleChangeCI && !this.props.isJobView && (
                                    <Tippy
                                        content={this.renderChangeCITooltip(isChangeCIEnabled)}
                                        placement="top"
                                        arrow={false}
                                        className="default-tt"
                                    >
                                        <span>
                                            <button
                                                type="button"
                                                className={`p-0 dc__no-background dc__no-border dc__outline-none-imp flex workflow-header-action-btn ${
                                                    !isChangeCIEnabled ? 'dc__disabled' : ''
                                                }`}
                                                // TODO: Move this Action bar into a separate block/component so we get rid of arrow function
                                                onClick={() => this.handleCIChange({ nodesWithBufferHeight })}
                                                disabled={!isChangeCIEnabled}
                                            >
                                                <ICInput className="icon-dim-16" />
                                            </button>
                                        </span>
                                    </Tippy>
                                )}

                                <Tippy content="Delete workflow" placement="top" arrow={false} className="default-tt">
                                    <button
                                        type="button"
                                        className="p-0 dc__no-background dc__no-border dc__outline-none-imp flex workflow-header-action-btn"
                                        onClick={this.toggleShowDeleteDialog}
                                    >
                                        <ICDelete className="icon-dim-16" />
                                    </button>
                                </Tippy>
                            </div>
                        )}
                    </div>
                    {!this.props.isOffendingPipelineView && isExternalCiWorkflow && <DeprecatedPipelineWarning />}
                    <div
                        className={
                            configDiffView
                                ? 'workflow__body'
                                : 'workflow__body dc__border-n1 bg__secondary dc__overflow-auto br-4'
                        }
                    >
                        {nodesWithBufferHeight.length === 0 && this.props.isJobView ? (
                            this.emptyWorkflow()
                        ) : (
                            <svg
                                x={this.props.startX}
                                y={0}
                                height={Math.max(Number(this.props.height), parallelEdgeMaxY)}
                                width={this.props.width}
                            >
                                {this.renderEdgeList({ nodesWithBufferHeight })}
                                {this.renderNodes({ nodesWithBufferHeight })}
                            </svg>
                        )}
                        {!this.props.isOffendingPipelineView && !configDiffView && (
                            <PipelineSelect
                                workflowId={this.props.id}
                                showMenu={this.state.showCIMenu}
                                styles={{
                                    left: `${this.state.left}px`,
                                    top: `${this.state.top}px`,
                                }}
                                addCIPipeline={this.props.addCIPipeline}
                                addWebhookCD={this.props.addWebhookCD}
                                toggleCIMenu={() => {
                                    this.setState({ showCIMenu: !this.state.showCIMenu })
                                }}
                            />
                        )}
                    </div>
                </div>
            </ConditionalWrap>
        )
    }

    render() {
        return <>{this.renderWorkflow()}</>
    }
}
