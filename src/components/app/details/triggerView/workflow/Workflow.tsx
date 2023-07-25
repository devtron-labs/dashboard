import React, { Component } from 'react'
import { StaticNode } from './nodes/staticNode'
import { TriggerCINode } from './nodes/triggerCINode'
import { TriggerExternalCINode } from './nodes/TriggerExternalCINode'
import { TriggerLinkedCINode } from './nodes/TriggerLinkedCINode'
import { TriggerCDNode } from './nodes/triggerCDNode'
import { TriggerPrePostCDNode } from './nodes/triggerPrePostCDNode'
import { getCIPipelineURL, importComponentFromFELibrary, RectangularEdge as Edge } from '../../../../common'
import { WorkflowProps, NodeAttr, PipelineType, WorkflowNodeType, TriggerViewContextType } from '../types'
import { WebhookNode } from '../../../../workflowEditor/nodes/WebhookNode'
import DeprecatedPipelineWarning from '../../../../workflowEditor/DeprecatedPipelineWarning'
import { GIT_BRANCH_NOT_CONFIGURED } from '../../../../../config'
import { Checkbox, CHECKBOX_VALUE, DeploymentNodeType, noop } from '@devtron-labs/devtron-fe-common-lib'
import { TriggerViewContext } from '../config'

const ApprovalNodeEdge = importComponentFromFELibrary('ApprovalNodeEdge')

export class Workflow extends Component<WorkflowProps> {
    static contextType?: React.Context<TriggerViewContextType> = TriggerViewContext

    goToWorkFlowEditor = (node: NodeAttr) => {
        if (node.branch === GIT_BRANCH_NOT_CONFIGURED) {
            const ciPipelineURL = getCIPipelineURL(
                this.props.appId?.toString() ?? this.props.match.params.appId,
                this.props.id,
                true,
                node.downstreams[0].split('-')[1],
                this.props.isJobView,
            )
            if (this.props.fromAppGrouping) {
                window.open(
                    window.location.href.replace(this.props.location.pathname, ciPipelineURL),
                    '_blank',
                    'noreferrer',
                )
            } else {
                this.props.history.push(ciPipelineURL)
            }
        }
    }

    renderNodes() {
        return this.props.nodes.map((node: any) => {
            if (node.type === WorkflowNodeType.GIT) {
                return this.renderSourceNode(node)
            } else if (node.type === WorkflowNodeType.CI) {
                return this.renderCINodes(node)
            } else if (node.type === PipelineType.WEBHOOK) {
                return this.renderWebhookNode(node)
            } else if (node.type === WorkflowNodeType.PRE_CD || node.type === WorkflowNodeType.POST_CD) {
                return this.renderPrePostCDNodes(node)
            } else if (node.type === WorkflowNodeType.CD) {
                return this.renderCDNodes(node)
            }
        })
    }

    renderSourceNode(node: NodeAttr) {
        return (
            <StaticNode
                key={`${node.type}-${node.id}`}
                type={node.type}
                x={node.x}
                y={node.y}
                branch={node.branch}
                icon={node.icon}
                height={node.height}
                width={node.width}
                id={node.id}
                title={node.title}
                url={node.url}
                downstreams={node.downstreams}
                sourceType={node.sourceType}
                regex={node.regex}
                isRegex={node.isRegex}
                primaryBranchAfterRegex={node.primaryBranchAfterRegex}
                handleGoToWorkFlowEditor={(e) => {
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
            />
        )
    }

    renderCINodes(node: NodeAttr) {
        if (node.isLinkedCI) {
            return (
                <TriggerLinkedCINode
                    key={`${node.type}-${node.id}`}
                    x={node.x}
                    y={node.y}
                    height={node.height}
                    width={node.width}
                    status={node.status}
                    id={node.id}
                    workflowId={+this.props.id}
                    title={node.title}
                    type={node.type}
                    description={node.description}
                    downstreams={node.downstreams}
                    triggerType={node.triggerType}
                    colorCode={node.colorCode}
                    isExternalCI={node.isExternalCI}
                    isLinkedCI={node.isLinkedCI}
                    linkedCount={node.linkedCount}
                    inputMaterialsNew={[]}
                    history={this.props.history}
                    location={this.props.location}
                    match={this.props.match}
                    fromAppGrouping={this.props.fromAppGrouping}
                    isCITriggerBlocked={node.isCITriggerBlocked}
                />
            )
        } else if (node.isExternalCI) {
            return (
                <TriggerExternalCINode
                    key={`${node.type}-${node.id}`}
                    x={node.x}
                    y={node.y}
                    height={node.height}
                    width={node.width}
                    status={node.status}
                    id={node.id}
                    workflowId={+this.props.id}
                    title={node.title}
                    type={node.type}
                    description={node.description}
                    downstreams={node.downstreams}
                    triggerType={node.triggerType}
                    colorCode={node.colorCode}
                    isExternalCI={node.isExternalCI}
                    isLinkedCI={node.isLinkedCI}
                    linkedCount={node.linkedCount}
                    inputMaterialsNew={[]}
                />
            )
        } else {
            return (
                <TriggerCINode
                    workflowId={this.props.id}
                    key={`${node.type}-${node.id}`}
                    x={node.x}
                    y={node.y}
                    status={node.status}
                    height={node.height}
                    width={node.width}
                    id={node.id}
                    type={node.type}
                    downstreams={node.downstreams}
                    title={node.title}
                    triggerType={node.triggerType}
                    colorCode={node.colorCode}
                    isExternalCI={node.isExternalCI}
                    isLinkedCI={node.isLinkedCI}
                    description={node.description}
                    linkedCount={node.linkedCount}
                    inputMaterialsNew={[]}
                    history={this.props.history}
                    location={this.props.location}
                    match={this.props.match}
                    branch={node.branch}
                    fromAppGrouping={this.props.fromAppGrouping}
                    isJobView={this.props.isJobView}
                    index={this.props.index}
                    isCITriggerBlocked={node.isCITriggerBlocked}
                    ciBlockState={node.ciBlockState}
                    filteredCIPipelines={this.props.filteredCIPipelines}
                    environmentLists={this.props.environmentLists}
                />
            )
        }
    }

    renderCDNodes(node) {
        return (
            <TriggerCDNode
                key={`${node.type}-${node.id}`}
                x={node.x}
                y={node.y}
                stageIndex={node.stageIndex}
                status={node.status}
                height={node.height}
                width={node.width}
                type={node.type}
                id={node.id}
                title={node.title}
                environmentName={node.environmentName}
                description={node.description}
                environmentId={node.environmentId}
                triggerType={node.triggerType}
                colourCode={node.colourCode}
                inputMaterialList={node.inputMaterialList}
                rollbackMaterialList={node.rollbackMaterialList}
                deploymentStrategy={node.deploymentStrategy}
                history={this.props.history}
                location={this.props.location}
                match={this.props.match}
                parentPipelineId={node.parentPipelineId}
                parentPipelineType={node.parentPipelineType}
                parentEnvironmentName={node.parentEnvironmentName}
                fromAppGrouping={this.props.fromAppGrouping}
                index={this.props.index}
                isVirtualEnvironment={node.isVirtualEnvironment}
            />
        )
    }

    renderPrePostCDNodes(node) {
        return (
            <TriggerPrePostCDNode
                key={`${node.type}-${node.id}`}
                x={node.x}
                y={node.y}
                environmentId={node.environmentId}
                description={node.description}
                type={node.type}
                stageIndex={node.stageIndex}
                status={node.status}
                height={node.height}
                width={node.width}
                id={node.id}
                triggerType={node.triggerType}
                title={node.title}
                colourCode={node.colourCode}
                inputMaterialList={node.inputMaterialList}
                rollbackMaterialList={node.rollbackMaterialList}
                history={this.props.history}
                location={this.props.location}
                match={this.props.match}
                fromAppGrouping={this.props.fromAppGrouping}
                index={this.props.index}
            />
        )
    }

    getEdges() {
        return this.props.nodes.reduce((edgeList, node) => {
            node.downstreams.forEach((downStreamNodeId) => {
                let endNode = this.props.nodes.find((val) => val.type + '-' + val.id == downStreamNodeId)
                edgeList.push({
                    startNode: node,
                    endNode: endNode,
                })
            })
            return edgeList
        }, [])
    }

    onClickNodeEdge = (nodeId: number) => {
        this.context.onClickCDMaterial(nodeId, DeploymentNodeType.CD, true)
        this.props.history.push({
            search: `approval-node=${nodeId}`
        })
    }

    renderEdgeList() {
        const edges = this.getEdges()
        return edges.map((edgeNode) => {
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
                    key={`trigger-edge-${edgeNode.startNode.id}-${edgeNode.endNode.id}(${edgeNode.endNode.type})`}
                    startNode={edgeNode.startNode}
                    endNode={edgeNode.endNode}
                    onClickEdge={noop}
                    deleteEdge={noop}
                    onMouseOverEdge={noop}
                />
            )
        })
    }

    handleWorkflowSelection = () => {
        this.props.handleSelectionChange(this.props.appId)
    }

    render() {
        const isExternalCiWorkflow = this.props.nodes.some(
            (node) => node.isExternalCI && !node.isLinkedCI && node.type === WorkflowNodeType.CI,
        )
        return (
            <div
                className={`workflow workflow--trigger mb-20 ${this.props.isSelected ? 'eb-5' : ''}`}
                style={{ minWidth: `${this.props.width}px` }}
            >
                <div className="workflow__header">
                    {this.props.fromAppGrouping ? (
                        <Checkbox
                            rootClassName="fs-13 fw-6 mb-0 app-group-checkbox"
                            isChecked={this.props.isSelected}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={this.handleWorkflowSelection}
                            dataTestId={`app-group-checkbox-${this.props.name}`}
                        >
                            {this.props.name}
                        </Checkbox>
                    ) : (
                        <span data-testid="workflow-heading" className="workflow__name">
                            {this.props.name}
                        </span>
                    )}
                </div>
                {isExternalCiWorkflow && <DeprecatedPipelineWarning />}
                <div className="workflow__body">
                    <svg x={this.props.startX} y={0} height={this.props.height} width={this.props.width}>
                        {this.renderEdgeList()}
                        {this.renderNodes()}
                    </svg>
                </div>
            </div>
        )
    }
}
