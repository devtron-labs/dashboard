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
import edit from '../../assets/icons/misc/editBlack.svg'
import trash from '../../assets/icons/misc/delete.svg'
import { WebhookNode } from './nodes/WebhookNode'
import Tippy from '@tippyjs/react'
import WebhookTippyCard from './nodes/WebhookTippyCard'
import DeprecatedPipelineWarning from './DeprecatedPipelineWarning'
import { GIT_BRANCH_NOT_CONFIGURED } from '../../config'
import { noop } from '@devtron-labs/devtron-fe-common-lib'

const ApprovalNodeEdge = importComponentFromFELibrary('ApprovalNodeEdge')

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
        workflowId: string | number,
        ciPipelineId: number | string,
        parentPipelineType: string,
        parentPipelineId: number | string,
        isWebhookCD?: boolean,
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
    addNewBlocked?: boolean
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
                    stroke-width="2"
                ></path>
                <path d="M575 56 L 555 46 L 565 56 L 555 66 Z" fill="rgba(100,100,100)"></path>
            </g>
        )
    }

    renderNodes() {
        const ci = this.props.nodes.find((node) => node.type == WorkflowNodeType.CI)
        const webhook = this.props.nodes.find((node) => node.type == WorkflowNodeType.WEBHOOK)
        const _nodesData = this.getNodesData(ci?.id || webhook?.id || '')
        const _nodes = _nodesData.nodes

        if (ci) {
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
                addNewBlocked={this.props.addNewBlocked}
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
                addNewBlocked={this.props.addNewBlocked}
            />
        )
    }

    renderCDNodes(node: NodeAttr, ciPipelineId: string | number, isWebhookCD: boolean, cdNamesList?: string[]) {
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
                addNewBlocked={this.props.addNewBlocked}
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
        return this.getEdges().map((edgeNode) => {
            if (ApprovalNodeEdge) {
                return (
                    <ApprovalNodeEdge
                        key={`trigger-edge-${edgeNode.startNode.id}${edgeNode.startNode.y}-${edgeNode.endNode.id}`}
                        startNode={edgeNode.startNode}
                        endNode={edgeNode.endNode}
                        onClickEdge={() => this.onClickNodeEdge(edgeNode.endNode.id)}
                        edges={edges}
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
                />
            )
        })
    }

    toggleShowDeleteDialog = () => {
        this.props.showDeleteDialog(this.props.id)
    }

    renderWebhookTippyContent() {
        const webhookNode = this.props.nodes.find((nd) => nd.type == WorkflowNodeType.WEBHOOK)
        return <WebhookTippyCard link={this.openWebhookDetails(webhookNode)} hideTippy={this.props.hideWebhookTippy} />
    }

    renderWorkflow() {
        let ciPipelineId = 0
        let ciPipeline = this.props.nodes.find((nd) => nd.type == WorkflowNodeType.CI)
        ciPipelineId = ciPipeline ? +ciPipeline.id : ciPipelineId
        const configDiffView = this.props.cdWorkflowList?.length > 0
        const isExternalCiWorkflow = this.props.nodes.some(
            (node) => node.isExternalCI && !node.isLinkedCI && node.type === WorkflowNodeType.CI,
        )
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
                    className="mb-20 workflow workflow--create"
                    style={{
                        minWidth: typeof this.props.width === 'string' ? this.props.width : `${this.props.width}px`,
                    }}
                >
                    <div className="workflow__header">
                        <span className="workflow__name">{this.props.name}</span>
                        {!configDiffView && (
                            <>
                                <Link to={this.props.openEditWorkflow(null, this.props.id)}>
                                    <button type="button" className="dc__transparent">
                                        <img src={edit} alt="edit" className="icon-dim-18" />
                                    </button>
                                </Link>
                                <button
                                    type="button"
                                    className="dc__align-right dc__transparent"
                                    onClick={this.toggleShowDeleteDialog}
                                >
                                    <img src={trash} alt="delete" className="h-20" />
                                </button>
                            </>
                        )}
                    </div>
                    {isExternalCiWorkflow && <DeprecatedPipelineWarning />}
                    <div className="workflow__body">
                        <svg x={this.props.startX} y={0} height={this.props.height} width={this.props.width}>
                            {this.renderEdgeList()}
                            {this.renderNodes()}
                        </svg>
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
