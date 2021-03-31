import React, { Component } from 'react';
import { CINode } from './nodes/CINode';
import { CDNode } from './nodes/CDNode';
import { StaticNode } from './nodes/StaticNode';
import { RectangularEdge as Edge, getLinkedCIPipelineURL, ConfirmationDialog, getCIPipelineURL, getCDPipelineURL, getExCIPipelineURL } from '../common';
import { RouteComponentProps } from 'react-router';
import { NodeAttr } from '../../components/app/details/triggerView/types';
import { PipelineSelect } from './PipelineSelect';
import { WorkflowCreate } from '../app/details/triggerView/config';
import { Link, NavLink } from 'react-router-dom'
import edit from '../../assets/icons/misc/editBlack.svg';
import trash from '../../assets/icons/misc/delete.svg';
import warn from '../../assets/icons/ic-warning.svg';

export interface WorkflowProps extends RouteComponentProps<{ appId: string, workflowId?: string, ciPipelineId?: string, cdPipelineId?: string }> {
    nodes: NodeAttr[];
    id: number;
    name: string;
    startX: number;
    startY: number;
    width: number;
    height: number;
    isGitOpsConfigAvailable: boolean;
    showDeleteDialog: (workflowId: number) => void;
    handleCDSelect: (workflowId: string | number, cdPipelineId) => void;
    openEditWorkflow: (event, workflowId: number) => string;
    handleCISelect: (workflowId: string | number, type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => void;
    addCIPipeline: (type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => void;
}

interface WorkflowState {
    top: number
    left: number;
    showCIMenu: boolean;
    showGitOpsWarningModal: boolean;
}

export class Workflow extends Component<WorkflowProps, WorkflowState> {

    constructor(props) {
        super(props)
        this.state = {
            showCIMenu: false,
            top: 0,
            left: 0,
            showGitOpsWarningModal: false
        }
    }

    toggleGitOpsWarningModal = () => {
        this.setState({ showGitOpsWarningModal: !this.state.showGitOpsWarningModal });
    }

    setPosition = (top: number, left: number) => {
        this.setState({ top, left });
    }
    renderNodes() {
        let ci = this.props.nodes.find(node => node.type == 'CI');
        if (ci)
            return this.props.nodes.map((node: any) => {
                if (node.type == "GIT") {
                    return this.renderSourceNode(node);
                }
                else if (node.type == "CI") {
                    return this.renderCINodes(node)
                }
                else {
                    return this.renderCDNodes(node);
                }
            })
        else {
            return this.renderAddCIpipeline();
        }
    }

    renderAddCIpipeline() {
        return <foreignObject className="data-hj-whitelist" x={WorkflowCreate.workflow.offsetX} y={WorkflowCreate.workflow.offsetY} height={WorkflowCreate.staticNodeSizes.nodeHeight} width={WorkflowCreate.staticNodeSizes.nodeWidth} >
            <button type="button" className="pipeline-select__button"
                onClick={(event: any) => {
                    let { bottom, left } = event.target.getBoundingClientRect();
                    this.setState({
                        showCIMenu: !this.state.showCIMenu,
                        left: left,
                        top: bottom
                    })
                }}>
                Add  CI Pipeline
                </button>
        </foreignObject>
    }
    renderSourceNode(node) {
        return <StaticNode
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
        />
    }

    openCDPipeline(node) {
        let { appId } = this.props.match.params;
        return this.props.match.url + "/" + getCDPipelineURL(appId, this.props.id.toString(), node.parents[0], node.id);
    }

    openCIPipeline(node: NodeAttr) {
        let { appId } = this.props.match.params;
        let url = ""
        if (node.isLinkedCI) url = getLinkedCIPipelineURL(appId, this.props.id.toString(), node.id)
        else if (node.isExternalCI) url = getExCIPipelineURL(appId, this.props.id.toString(), node.id)
        else url = getCIPipelineURL(appId, this.props.id.toString(), node.id);
        return `${this.props.match.url}/${url}`
    }

    renderCINodes(node) {
        return <CINode
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
            toggleCDMenu={() => { this.props.handleCDSelect(this.props.id, node.id); }}
            to={this.openCIPipeline(node)}
        />
    }

    renderCDNodes(node) {
        return <CDNode key={node.id}
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
            to={this.openCDPipeline(node)}
        />
    }

    getEdges() {
        return this.props.nodes.reduce((edgeList, node) => {
            node.downstreams.forEach(downStreamNodeId => {
                let endNode = this.props.nodes.find(val => val.type + "-" + val.id == downStreamNodeId);
                edgeList.push({
                    startNode: node,
                    endNode: endNode
                });
            });
            return edgeList;
        }, []);
    }

    renderEdgeList() {
        return this.getEdges().map(edgeNode => {
            return <Edge
                key={`trigger-edge-${edgeNode.startNode.id}${edgeNode.startNode.y}-${edgeNode.endNode.id}`}
                startNode={edgeNode.startNode}
                endNode={edgeNode.endNode}
                onClickEdge={() => { }}
                deleteEdge={() => { }}
                onMouseOverEdge={(startNode, endNode) => { }}
            />
        })
    }

    renderWorkflow() {
        let ciPipelineId = 0;
        let ciPipeline = this.props.nodes.find(nd => nd.type == 'CI');
        ciPipelineId = (ciPipeline) ? +ciPipeline.id : ciPipelineId;
        return <div className="mb-20 workflow workflow--create" style={{ minWidth: `${this.props.width}px` }}>
            <div className="workflow__header">
                <span className="workflow__name">{this.props.name}</span>
                <Link to={this.props.openEditWorkflow(null, this.props.id)}>
                    <button type="button" className="transparent">
                        <img src={edit} alt="edit" className="icon-dim-18" />
                    </button>
                </Link>
                <button type="button" className="align-right transparent" onClick={(e) => this.props.showDeleteDialog(this.props.id)}><img src={trash} alt="delete" /></button>
            </div>
            <div className="workflow__body" >
                <svg x={this.props.startX} y={0} height={this.props.height} width={this.props.width}>
                    {this.renderEdgeList()}
                    {this.renderNodes()}
                </svg>
                <PipelineSelect workflowId={this.props.id}
                    showMenu={this.state.showCIMenu}
                    styles={{
                        left: `${this.state.left}px`,
                        top: `${this.state.top}px`
                    }}
                    addCIPipeline={this.props.addCIPipeline}
                    toggleCIMenu={() => { this.setState({ showCIMenu: !this.state.showCIMenu }) }}
                />
            </div>
        </div>
    }

    render() {
        return <React.Fragment>
            {this.renderWorkflow()}
            {this.state.showGitOpsWarningModal ? <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warn} />
                <ConfirmationDialog.Body title="GitOps configuration required">
                    <p className="">GitOps configuration is required to perform this action. Please configure GitOps and try again.</p>
                </ConfirmationDialog.Body>
                <ConfirmationDialog.ButtonGroup>
                    <button type="button" tabIndex={3} className="cta cancel sso__warn-button" onClick={this.toggleGitOpsWarningModal}>Cancel</button>
                    <NavLink className="cta sso__warn-button btn-confirm" to={`/global-config/gitops`}>Configure GitOps</NavLink>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog> : null}
        </React.Fragment>
    }
}