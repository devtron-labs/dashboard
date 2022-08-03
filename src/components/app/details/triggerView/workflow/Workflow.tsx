import React, { Component } from 'react'
import { StaticNode } from './nodes/staticNode'
import { TriggerCINode } from './nodes/triggerCINode'
import { TriggerExternalCINode } from './nodes/TriggerExternalCINode'
import { TriggerLinkedCINode } from './nodes/TriggerLinkedCINode'
import { TriggerCDNode } from './nodes/triggerCDNode'
import { TriggerPrePostCDNode } from './nodes/triggerPrePostCDNode'
import { RectangularEdge as Edge } from '../../../../common'
import { WorkflowProps, NodeAttr } from '../types'

export class Workflow extends Component<WorkflowProps> {
    renderNodes() {
        return this.props.nodes.map((node: any) => {
            if (node.type === 'GIT') {
                return this.renderSourceNode(node)
            } else if (node.type === 'CI') {
                return this.renderCINodes(node)
            } else if (node.type === 'PRECD' || node.type === 'POSTCD') {
                return this.renderPrePostCDNodes(node)
            } else if (node.type === 'CD') {
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

    renderEdgeList() {
        return this.getEdges().map((edgeNode) => {
            return (
                <Edge
                    key={`trigger-edge-${edgeNode.startNode.id}-${edgeNode.endNode.id}(${edgeNode.endNode.type})`}
                    startNode={edgeNode.startNode}
                    endNode={edgeNode.endNode}
                    onClickEdge={() => {}}
                    deleteEdge={() => {}}
                    onMouseOverEdge={() => {}}
                />
            )
        })
    }

    render() {
        return (
            <div className="workflow workflow--trigger mb-20" style={{ minWidth: `${this.props.width}px` }}>
                <div className="workflow__header">
                    <span className="workflow__name">{this.props.name}</span>
                </div>
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
