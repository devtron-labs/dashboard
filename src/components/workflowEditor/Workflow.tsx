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
} from '../common'
import { RouteComponentProps } from 'react-router'
import { NodeAttr } from '../../components/app/details/triggerView/types'
import { PipelineSelect } from './PipelineSelect'
import { WorkflowCreate } from '../app/details/triggerView/config'
import { Link } from 'react-router-dom'
import edit from '../../assets/icons/misc/editBlack.svg'
import trash from '../../assets/icons/misc/delete.svg'

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
    ) => void
    openEditWorkflow: (event, workflowId: number) => string
    handleCISelect: (workflowId: string | number, type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => void
    addCIPipeline: (type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => void
    cdWorkflowList?: any[]
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
        const ci = this.props.nodes.find((node) => node.type == 'CI')
        const _nodesData = this.getNodesData(ci?.id || '')
        const _nodes = _nodesData.nodes

        if (ci) {
            return _nodes.map((node: NodeAttr) => {
                if (node.type == 'GIT') {
                    return this.renderSourceNode(node)
                } else if (node.type == 'CI') {
                    return this.renderCINodes(node)
                } else if (_nodesData.cdNamesList.length > 0) {
                    return (
                        <>
                            {this.renderAdditionalEdge()}
                            {this.renderCDNodes(node, ci.id, _nodesData.cdNamesList)}
                        </>
                    )
                }

                return this.renderCDNodes(node, ci.id)
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
    renderSourceNode(node) {
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
            />
        )
    }

    openCDPipeline(node: NodeAttr) {
        let { appId } = this.props.match.params
        return (
            this.props.match.url +
            '/' +
            getCDPipelineURL(appId, this.props.id.toString(), String(node.connectingCiPipelineId ?? 0), node.id)
        )
    }

    openCIPipeline(node: NodeAttr) {
        let { appId } = this.props.match.params
        let url = ''
        if (node.isLinkedCI) url = getLinkedCIPipelineURL(appId, this.props.id.toString(), node.id)
        else if (node.isExternalCI) url = getExCIPipelineURL(appId, this.props.id.toString(), node.id)
        else url = getCIPipelineURL(appId, this.props.id.toString(), node.id)
        return `${this.props.match.url}/${url}`
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
                    this.props.handleCDSelect(this.props.id, node.id, 'ci-pipeline', node.id)
                }}
                to={this.openCIPipeline(node)}
                configDiffView={this.props.cdWorkflowList?.length > 0}
            />
        )
    }

    renderCDNodes(node: NodeAttr, ciPipelineId: string | number, cdNamesList?: string[]) {
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
                triggerType={node.triggerType}
                deploymentStrategy={node.deploymentStrategy}
                toggleCDMenu={() => {
                    this.props.handleCDSelect(this.props.id, ciPipelineId, 'cd-pipeline', node.id)
                }}
                to={this.openCDPipeline(node)}
                cdNamesList={cdNamesList}
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

    renderEdgeList() {
        return this.getEdges().map((edgeNode) => {
            return (
                <Edge
                    key={`trigger-edge-${edgeNode.startNode.id}${edgeNode.startNode.y}-${edgeNode.endNode.id}`}
                    startNode={edgeNode.startNode}
                    endNode={edgeNode.endNode}
                    onClickEdge={() => {}}
                    deleteEdge={() => {}}
                    onMouseOverEdge={(startNode, endNode) => {}}
                />
            )
        })
    }

    toggleShowDeleteDialog = () => {
        this.props.showDeleteDialog(this.props.id)
    }

    renderWorkflow() {
        let ciPipelineId = 0
        let ciPipeline = this.props.nodes.find((nd) => nd.type == 'CI')
        ciPipelineId = ciPipeline ? +ciPipeline.id : ciPipelineId
        const configDiffView = this.props.cdWorkflowList?.length > 0

        return (
            <div
                className="mb-20 workflow workflow--create"
                style={{ minWidth: typeof this.props.width === 'string' ? this.props.width : `${this.props.width}px` }}
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
                                <img src={trash} alt="delete" />
                            </button>
                        </>
                    )}
                </div>
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
                            toggleCIMenu={() => {
                                this.setState({ showCIMenu: !this.state.showCIMenu })
                            }}
                        />
                    )}
                </div>
            </div>
        )
    }

    render() {
        return <React.Fragment>{this.renderWorkflow()}</React.Fragment>
    }
}
