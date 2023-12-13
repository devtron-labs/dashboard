import React, { Component } from 'react'
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
    ConditionalWrap,
    importComponentFromFELibrary,
} from '../common'
import { RouteComponentProps } from 'react-router'
import {
    CIPipelineNodeType,
    NodeAttr,
    PipelineType,
    WorkflowNodeType,
} from '../../components/app/details/triggerView/types'
import { PipelineSelect } from './PipelineSelect'
import { WorkflowCreate } from '../app/details/triggerView/config'
import { Link } from 'react-router-dom'
import { WebhookNode } from './nodes/WebhookNode'
import Tippy from '@tippyjs/react'
import WebhookTippyCard from './nodes/WebhookTippyCard'
import DeprecatedPipelineWarning from './DeprecatedPipelineWarning'
import { GIT_BRANCH_NOT_CONFIGURED, URLS } from '../../config'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICInput } from '../../assets/icons/ic-input.svg'
import { ReactComponent as ICMoreOption } from '../../assets/icons/ic-more-option.svg'
import { ReactComponent as ICDelete } from '../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as ICEdit } from '../../assets/icons/ic-pencil.svg'
import { AddPipelineType, ChangeCIPayloadType, SelectedNode } from './types'
import { CHANGE_CI_TOOLTIP } from './workflowEditor.constants'
import { AddCDPositions } from '../common/edge/rectangularEdge'

const ApprovalNodeEdge = importComponentFromFELibrary('ApprovalNodeEdge')
const LinkedCDNode = importComponentFromFELibrary('LinkedCDNode')

export interface WorkflowProps
    extends RouteComponentProps<{ appId: string; workflowId?: string; ciPipelineId?: string; cdPipelineId?: string }> {
    nodes: NodeAttr[]
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

    getNodesData = (nodeId: string) => {
        const _nodes = [...this.props.nodes]
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
            })
        }

        return {
            nodes: _nodes,
            cdNamesList: _cdNamesList || [],
        }
    }

    goToWorkFlowEditor = (node: NodeAttr) => {
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
                    stroke="rgba(150,150,150)"
                    strokeWidth="2"
                />
                <path d="M575 56 L 555 46 L 565 56 L 555 66 Z" fill="rgba(100,100,100)" />
            </g>
        )
    }

    // The logic for rendering edges are: if there are few child nodes, then show parallel edge as well.
    // In case of approval we have a special edge.
    // In case there are more than one child nodes, then we will show add cd button thrice.
    // AND renderAdditionalEdge would only work for cdWorkflowList that is CIConfigDiffView
    renderNodes() {
        const ci = this.props.nodes.find((node) => node.type == WorkflowNodeType.CI && !node.isLinkedCD)
        const webhook = this.props.nodes.find((node) => node.type == WorkflowNodeType.WEBHOOK)
        const linkedCD = this.props.nodes.find((node) => node.isLinkedCD)
        const _nodesData = this.getNodesData(ci?.id || webhook?.id || linkedCD?.id || '')
        const _nodes = _nodesData.nodes

        if (linkedCD) {
            return _nodes.map((node: NodeAttr) => {
                if (node.isLinkedCD && LinkedCDNode) {
                    return this.renderLinkedCD(node)
                } else if (_nodesData.cdNamesList.length > 0) {
                    return (
                        <>
                            {this.renderAdditionalEdge()}
                            {this.renderCDNodes(node, linkedCD.id, false, _nodesData.cdNamesList)}
                        </>
                    )
                }

                return this.renderCDNodes(node, linkedCD.id, false)
            })
        } else if (ci) {
            return _nodes.map((node: NodeAttr) => {
                if (node.type == WorkflowNodeType.GIT) {
                    return this.renderSourceNode(node, ci)
                } else if (node.type == WorkflowNodeType.CI) {
                    return this.renderCINodes(node)
                } else if (_nodesData.cdNamesList.length > 0) {
                    return (
                        <>
                            {this.renderAdditionalEdge()}
                            {this.renderCDNodes(node, ci.id, false, _nodesData.cdNamesList)}
                        </>
                    )
                }

                return this.renderCDNodes(node, ci.id, false)
            })
        } else if (webhook) {
            return _nodes.map((node: NodeAttr) => {
                if (node.type == WorkflowNodeType.WEBHOOK) {
                    return this.renderWebhookNode(node)
                } else if (_nodesData.cdNamesList.length > 0) {
                    return (
                        <>
                            {this.renderAdditionalEdge()}
                            {this.renderCDNodes(node, webhook.id, true, _nodesData.cdNamesList)}
                        </>
                    )
                }

                return this.renderCDNodes(node, webhook.id, true)
            })
        } else {
            return this.renderAddCIpipeline()
        }
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
                        let { bottom, left } = event.target.getBoundingClientRect()
                        this.setState({
                            showCIMenu: !this.state.showCIMenu,
                            left: left,
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
                to={this.openCIPipeline(ci)} //ci attribites for a git material
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
            />
        )
    }

    openCDPipeline(node: NodeAttr, isWebhookCD: boolean) {
        let { appId } = this.props.match.params
        return (
            this.props.match.url +
            '/' +
            getCDPipelineURL(
                appId,
                this.props.id.toString(),
                String(node.connectingCiPipelineId ?? 0),
                isWebhookCD,
                node.id,
            )
        )
    }

    openCIPipeline(node: NodeAttr) {
        if (node.isExternalCI && !node.isLinkedCI) {
            return `${this.props.match.url}/deprecated-warning`
        }
        let { appId } = this.props.match.params
        let url = ''
        if (node.isLinkedCI) {
            url = getLinkedCIPipelineURL(appId, this.props.id.toString(), node.id)
        } else if (node.isExternalCI) {
            url = getExCIPipelineURL(appId, this.props.id.toString(), node.id)
        } else {
            url = getCIPipelineURL(
                appId,
                this.props.id.toString(),
                node.branch === GIT_BRANCH_NOT_CONFIGURED,
                node.id,
                this.props.isJobView,
                node.isJobCI,
            )
        }
        return `${this.props.match.url}/${url}`
    }

    openWebhookDetails(node: NodeAttr) {
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
            />
        )
    }

    renderLinkedCD(node: NodeAttr) {
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
            />
        )
    }

    renderCDNodes(node: NodeAttr, ciPipelineId: string | number, isWebhookCD: boolean, cdNamesList?: string[]) {
        if (this.props.cdWorkflowList?.length > 0 && !cdNamesList?.length) {
            return
        }

        return (
            // Check if addType sequential is needed here?
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
                appName={this.props.appName ?? ''}
                // TODO: Check this logic
                isLastNode={node.downstreams.length === 0}
                deploymentAppType={node.deploymentAppType}
                appId={this.props.match.params.appId}
            />
        )
    }

    getEdges() {
        return this.props.nodes.reduce((edgeList, node) => {
            node.downstreams.forEach((downStreamNodeId) => {
                const endNode = this.props.nodes.find((val) => val.type + '-' + val.id == downStreamNodeId)
                edgeList.push({
                    startNode: node,
                    endNode: endNode,
                })
            })
            return edgeList
        }, [])
    }

    onClickNodeEdge = (nodeId: number) => {
        const ciPipeline = this.props.nodes.find((nd) => nd.type == WorkflowNodeType.CI)
        this.props.history.push(`workflow/${this.props.id}/ci-pipeline/${+ciPipeline?.id}/cd-pipeline/${nodeId}`)
    }

    renderEdgeList() {
        const edges = this.getEdges()
        // TODO: Check if on prop change, the selectedNode is getting updated or not.
        const selectedNodeKey = `${this.props.selectedNode?.nodeType}-${this.props.selectedNode?.id}`
        const selectedNodeEndNodes = edges
            .filter((edgeNode) => `${edgeNode.startNode.type}-${edgeNode.startNode.id}` === selectedNodeKey)
            .map((edgeNode) => edgeNode.endNode)
        // Hoping only one CIPipeline is present in one workflow
        const workflowCIPipelineId = this.props.nodes.find((node) => node.type == WorkflowNodeType.CI)?.id ?? 0
        const isWebhookCD = !!this.props.nodes.find((node) => node.type == WorkflowNodeType.WEBHOOK)

        const edgeList = this.getEdges().map((edgeNode) => {
            // checking if edgeNode is same as selectedNode
            const currentNodeIdentifier = `${edgeNode.startNode.type}-${edgeNode.startNode.id}`
            const isSelectedEdge = selectedNodeKey === currentNodeIdentifier
            const addCDButtons = isSelectedEdge ? [AddCDPositions.RIGHT] : []

            if (ApprovalNodeEdge) {
                // The props that will be helpful are showAddCD
                return (
                    <ApprovalNodeEdge
                        key={`trigger-edge-${edgeNode.startNode.id}${edgeNode.startNode.y}-${edgeNode.endNode.id}`}
                        startNode={edgeNode.startNode}
                        endNode={edgeNode.endNode}
                        onClickEdge={() => this.onClickNodeEdge(edgeNode.endNode.id)}
                        edges={edges}
                        shouldRenderAddRightCDButton={isSelectedEdge}
                        handleCDSelect={this.props.handleCDSelect}
                        ciPipelineId={workflowCIPipelineId}
                        workflowId={this.props.id}
                        isWebhookCD={isWebhookCD}
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
        // TODO: Add null checks for selectedNode and selectedNodeEndNodes
        if (this.props.selectedNode && selectedNodeEndNodes?.length > 0) {
            // Finding the startNode that as same key as selectedNode
            const selectedNodeKey = `${this.props.selectedNode?.nodeType}-${this.props.selectedNode?.id}`
            const startNode = this.props.nodes.find((node) => `${node.type}-${node.id}` === selectedNodeKey)
            // Creating a dummy endNode
            // To create it, we need to find the endNode from startNode that has maximum y value
            // We will use this endNode to create a dummy edge.
            let endNode = null
            let maxY = 0
            startNode.downstreams.forEach((downStreamNodeId) => {
                const node = this.props.nodes.find((val) => val.type + '-' + val.id == downStreamNodeId)
                if (node.y > maxY) {
                    maxY = node.y
                    endNode = node
                }
            })
            endNode = JSON.parse(JSON.stringify(endNode))
            endNode.y += WorkflowCreate.cDNodeSizes.distanceY + WorkflowCreate.cDNodeSizes.nodeHeight

            const addCDButtons =
                selectedNodeEndNodes.length > 1 ? [AddCDPositions.LEFT, AddCDPositions.RIGHT] : [AddCDPositions.RIGHT]

            // TODO: Add approval edge if present
            edgeList.push(
                <Edge
                    key={`trigger-edge-${this.props.selectedNode.id}`}
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
                />,
            )
        }
        return edgeList
    }

    toggleShowDeleteDialog = () => {
        this.props.showDeleteDialog(this.props.id)
    }

    handleCIChange = () => {
        const payload: ChangeCIPayloadType = {
            appWorkflowId: Number(this.props.id),
            appId: Number(this.props.match.params.appId),
        }

        const switchFromCiPipelineId = this.props.nodes.find((nd) => nd.type == WorkflowNodeType.CI)?.id

        if (switchFromCiPipelineId) {
            payload.switchFromCiPipelineId = Number(switchFromCiPipelineId)
        } else {
            const externalCiPipelineId = this.props.nodes.find(
                (nd) => nd.isExternalCI && nd.type === WorkflowNodeType.WEBHOOK,
            )?.id
            if (externalCiPipelineId) {
                payload.switchFromExternalCiPipelineId = Number(externalCiPipelineId)
            }
        }
        this.props.handleChangeCI?.(payload)
    }

    renderWebhookTippyContent() {
        const webhookNode = this.props.nodes.find((nd) => nd.type == WorkflowNodeType.WEBHOOK)
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
                className="text-center lh-18 bc-n50 flexbox-col dc__align-items-center bw-1 en-2 dashed h-100 dc__content-center br-4 pt-16 pb-16 cursor"
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

    renderWorkflow() {
        let ciPipelineId = 0
        let ciPipeline = this.props.nodes.find((nd) => nd.type == WorkflowNodeType.CI)
        ciPipelineId = ciPipeline ? +ciPipeline.id : ciPipelineId
        const configDiffView = this.props.cdWorkflowList?.length > 0
        const isExternalCiWorkflow = this.props.nodes.some(
            (node) => node.isExternalCI && !node.isLinkedCI && node.type === WorkflowNodeType.CI,
        )

        // We are only enabling change CI when CI is linkedCD or normal CI
        const isChangeCIEnabled =
            ciPipeline?.isLinkedCD || (ciPipeline && !ciPipeline?.isJobCI && !ciPipeline?.isLinkedCI)

        return (
            <ConditionalWrap
                condition={this.props.showWebhookTippy}
                wrap={(children) => (
                    <Tippy
                        placement="top-start"
                        arrow={true}
                        render={this.renderWebhookTippyContent}
                        showOnCreate={true}
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
                    >
                        <span className="m-0 cn-9 fs-13 fw-6 lh-20">{this.props.name}</span>
                        {!configDiffView && (
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

                                {!!this.props.handleChangeCI && LinkedCDNode && !this.props.isJobView && (
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
                                                onClick={this.handleCIChange}
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
                    {isExternalCiWorkflow && <DeprecatedPipelineWarning />}
                    <div
                        className={
                            configDiffView
                                ? 'workflow__body'
                                : 'workflow__body dc__border-n1 bc-n50 dc__overflow-scroll br-4'
                        }
                    >
                        {this.props.nodes.length === 0 && this.props.isJobView ? (
                            this.emptyWorkflow()
                        ) : (
                            // TODO: Handle height in case of edit mode
                            <svg x={this.props.startX} y={0} height={this.props.height} width={this.props.width}>
                                {this.renderEdgeList()}
                                {this.renderNodes()}
                            </svg>
                        )}
                        {!configDiffView && (
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
        return <React.Fragment>{this.renderWorkflow()}</React.Fragment>
    }
}
