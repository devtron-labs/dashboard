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

import React, { Component } from 'react'
import {
    Checkbox,
    CHECKBOX_VALUE,
    DeploymentNodeType,
    noop,
    WorkflowNodeType,
    PipelineType,
    CommonNodeAttr,
} from '@devtron-labs/devtron-fe-common-lib'
import { StaticNode } from './nodes/staticNode'
import { TriggerCINode } from './nodes/triggerCINode'
import { TriggerExternalCINode } from './nodes/TriggerExternalCINode'
import { TriggerLinkedCINode } from './nodes/TriggerLinkedCINode'
import { TriggerCDNode } from './nodes/triggerCDNode'
import { TriggerPrePostCDNode } from './nodes/triggerPrePostCDNode'
import { getCIPipelineURL, importComponentFromFELibrary, RectangularEdge as Edge } from '../../../../common'
import { WorkflowProps, TriggerViewContextType } from '../types'
import { WebhookNode } from '../../../../workflowEditor/nodes/WebhookNode'
import DeprecatedPipelineWarning from '../../../../workflowEditor/DeprecatedPipelineWarning'
import { GIT_BRANCH_NOT_CONFIGURED } from '../../../../../config'
import { TriggerViewContext } from '../config'

const ApprovalNodeEdge = importComponentFromFELibrary('ApprovalNodeEdge')
const LinkedCDNode = importComponentFromFELibrary('LinkedCDNode')
const ImagePromotionLink = importComponentFromFELibrary('ImagePromotionLink', null, 'function')
const BulkDeployLink = importComponentFromFELibrary('BulkDeployLink', null, 'function')

export class Workflow extends Component<WorkflowProps> {
    static contextType?: React.Context<TriggerViewContextType> = TriggerViewContext

    goToWorkFlowEditor = (node: CommonNodeAttr) => {
        if (node.branch === GIT_BRANCH_NOT_CONFIGURED) {
            const ciPipelineURL = getCIPipelineURL(
                this.props.appId?.toString() ?? this.props.match.params.appId,
                this.props.id,
                true,
                node.downstreams[0].split('-')[1],
                this.props.isJobView,
                node.isJobCI,
                false,
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
            }
            if (node.type === WorkflowNodeType.CI) {
                return this.renderCINodes(node)
            }
            if (node.type === PipelineType.WEBHOOK) {
                return this.renderWebhookNode(node)
            }
            if (node.type === WorkflowNodeType.PRE_CD || node.type === WorkflowNodeType.POST_CD) {
                return this.renderPrePostCDNodes(node)
            }
            if (node.type === WorkflowNodeType.CD) {
                return this.renderCDNodes(node)
            }
        })
    }

    renderSourceNode(node: CommonNodeAttr) {
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
                isTemplateView={false}
            />
        )
    }

    renderCINodes(node: CommonNodeAttr) {
        if (node.isLinkedCD && LinkedCDNode) {
            return (
                <LinkedCDNode
                    key={`linked-cd-${node.id}`}
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    configDiffView={false}
                    title={node.title}
                    readOnly
                    isTemplateView={false}
                />
            )
        }

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
                    isCITriggerBlocked={node.isTriggerBlocked}
                />
            )
        }
        if (node.isExternalCI) {
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
        }
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
                isJobCI={node.isJobCI}
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
                isCITriggerBlocked={node.isTriggerBlocked}
                ciBlockState={node.pluginBlockState}
                filteredCIPipelines={this.props.filteredCIPipelines}
                environmentLists={this.props.environmentLists}
            />
        )
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
                isGitOpsRepoNotConfigured={node.isGitOpsRepoNotConfigured}
                deploymentAppType={node.deploymentAppType}
                appId={this.props.appId}
                isDeploymentBlocked={node.isDeploymentBlocked}
                isTriggerBlocked={node.isTriggerBlocked}
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
                environmentName={node.environmentName}
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
                isGitOpsRepoNotConfigured={node.isGitOpsRepoNotConfigured}
                deploymentAppType={node.deploymentAppType}
                appId={this.props.appId}
                isDeploymentBlocked={node.isDeploymentBlocked}
                isTriggerBlocked={node.isTriggerBlocked}
            />
        )
    }

    getEdges() {
        return this.props.nodes.reduce((edgeList, node) => {
            node.downstreams.forEach((downStreamNodeId) => {
                const endNode = this.props.nodes.find((val) => `${val.type}-${val.id}` == downStreamNodeId)
                edgeList.push({
                    startNode: node,
                    endNode,
                })
            })
            return edgeList
        }, [])
    }

    onClickNodeEdge = (nodeId: number) => {
        this.context.onClickCDMaterial(nodeId, DeploymentNodeType.CD, true)
        this.props.history.push({
            search: `approval-node=${nodeId}`,
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

        const numberOfCDNodes = this.props.nodes.reduce((acc, node) => acc + (node.type === 'CD' ? 1 : 0), 0)

        return (
            <div className="workflow--trigger flexbox-col mb-16 dc__gap-6" style={{ minWidth: 'auto' }}>
                <div className="bg__primary cn-9 fs-13 fw-6 lh-20 flexbox dc__align-items-center dc__content-space">
                    {this.props.fromAppGrouping ? (
                        <Checkbox
                            rootClassName="mb-0 app-group-checkbox"
                            isChecked={this.props.isSelected}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={this.handleWorkflowSelection}
                            dataTestId={`app-group-checkbox-${this.props.name}`}
                        >
                            {this.props.name}
                        </Checkbox>
                    ) : (
                        <>
                            <span data-testid="workflow-heading" className="m-0">
                                {this.props.name}
                            </span>

                            <div className="dc__separated-flexbox">
                                {BulkDeployLink && numberOfCDNodes > 1 && (
                                    <BulkDeployLink
                                        workflowId={this.props.id}
                                    />
                                )}

                                {ImagePromotionLink && (
                                    <ImagePromotionLink
                                        isConfigured={this.props.artifactPromotionMetadata?.isConfigured ?? false}
                                        isApprovalPendingForPromotion={
                                            this.props.artifactPromotionMetadata?.isApprovalPendingForPromotion ?? false
                                        }
                                        workflowId={this.props.id}
                                    />
                                )}
                            </div>

                        </>
                    )}
                </div>
                {isExternalCiWorkflow && <DeprecatedPipelineWarning />}
                <div
                    className={`workflow__body bg__secondary dc__overflow-auto dc__border-n1 br-4 ${this.props.isSelected ? 'eb-2' : ''}`}
                >
                    <svg x={this.props.startX} y={0} height={this.props.height} width={this.props.width}>
                        {this.renderEdgeList()}
                        {this.renderNodes()}
                    </svg>
                </div>
            </div>
        )
    }
}
