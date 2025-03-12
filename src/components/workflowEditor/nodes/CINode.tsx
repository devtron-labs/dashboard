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

import { Component, ReactElement } from 'react'
import {
    WorkflowNodeType,
    SelectedNode,
    CommonNodeAttr,
    ConditionalWrap,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { Link, RouteComponentProps } from 'react-router-dom'
import ToggleCDSelectButton from '../ToggleCDSelectButton'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as ICLinkedCINode } from '../../../assets/icons/ic-node-build-linked.svg'
import { ReactComponent as IcLink } from '../../../assets/icons/ic-link.svg'
import { DEFAULT_ENV } from '../../app/details/triggerView/Constants'
import { URLS } from '../../../config'
import { getLinkedCITippyContent } from '../../../Pages/Shared/LinkedCIDetailsModal/utils'
import { WorkflowProps } from '../Workflow'

export interface CINodeProps extends RouteComponentProps<{}>, Pick<WorkflowProps, 'isOffendingPipelineView'> {
    x: number
    y: number
    width: number
    height: number
    id: number
    title: string
    type: string
    description: string
    workflowId: number
    triggerType: string
    isLinkedCI: boolean
    isExternalCI: boolean
    isJobCI: boolean
    isTrigger: boolean
    linkedCount: number
    downstreams: CommonNodeAttr[]
    to: string
    toggleCDMenu: () => void
    configDiffView?: boolean
    hideWebhookTippy?: () => void
    isJobView?: boolean
    showPluginWarning?: boolean
    envList?: any[]
    filteredCIPipelines?: any[]
    addNewPipelineBlocked?: boolean
    handleSelectedNodeChange?: (selectedNode: SelectedNode) => void
    selectedNode?: SelectedNode
    isLastNode?: boolean
    appId: string
    getWorkflows: () => void
}

export class CINode extends Component<CINodeProps> {
    handleLinkedCIWorkflowChipClick = (e) => {
        // stopPropagation to stop redirection to ci-details
        e.stopPropagation()
        e.preventDefault()
        this.props.history.push(`${this.props.match.url}/${URLS.LINKED_CI_DETAILS}/${this.props.id}`)
    }

    onClickAddNode = (event: any) => {
        event.preventDefault()
        event.stopPropagation()

        if (this.props.addNewPipelineBlocked) {
            return
        }

        if (this.props.isLastNode) {
            this.props.toggleCDMenu()
        } else {
            this.props.handleSelectedNodeChange?.({
                nodeType: WorkflowNodeType.CI,
                id: String(this.props.id),
            })
        }
    }

    renderNodeIcon = (isJobCard: boolean) => {
        if (this.props.showPluginWarning) {
            return <Warning className="icon-dim-18 warning-icon-y7 mr-12" />
        }

        if (this.props.isLinkedCI) {
            return <ICLinkedCINode className="icon-dim-20 mr-12" />
        }

        return (
            <div className="flex pr-12">
                <Icon name={isJobCard ? 'ic-job-color' : 'ic-build-color'} size={20} color={null} />
            </div>
        )
    }

    renderReadOnlyCard = (isJobCard: boolean) => {
        const _buildText = this.props.isExternalCI ? 'Build: External' : 'Build'
        const nodeText = isJobCard ? 'Job' : _buildText
        return (
            <div className="workflow-node">
                <div className="workflow-node__title flex">
                    <div className="workflow-node__full-width-minus-Icon">
                        <span className="workflow-node__text-light">{nodeText}</span>
                        <div className="dc__ellipsis-left">{this.props.title}</div>
                    </div>
                    {this.renderNodeIcon(isJobCard)}
                </div>
            </div>
        )
    }

    renderWrapWithLink = (children: ReactElement) => (
        <Link
            to={this.props.to}
            onClick={this.props.hideWebhookTippy}
            target={this.props.isOffendingPipelineView ? '_blank' : '_self'}
            className="dc__no-decor"
        >
            {children}
        </Link>
    )

    deleteConfig = {
        appId: this.props.appId,
        appWorkflowId: this.props.workflowId,
        pipelineId: this.props.id,
        pipelineName: this.props.title,
    }

    renderCardContent = (isJobCard: boolean) => {
        const currPipeline = this.props.filteredCIPipelines.find((pipeline) => +pipeline.id === +this.props.id)
        const env = currPipeline?.environmentId
            ? this.props.envList.find((env) => +env.id === +currPipeline.environmentId)
            : undefined
        const _buildText = this.props.isExternalCI ? 'Build: External' : 'Build'
        const _linkedBuildText = this.props.isLinkedCI ? 'Build: Linked' : _buildText
        const pipeline = isJobCard ? 'Job' : _linkedBuildText
        const selectedNodeKey = `${this.props.selectedNode?.nodeType}-${this.props.selectedNode?.id}`
        const currentNodeKey = `${WorkflowNodeType.CI}-${this.props.id ?? ''}`

        return (
            <ConditionalWrap
                condition={!!this.props.to && (!this.props.isOffendingPipelineView || this.props.showPluginWarning)}
                wrap={this.renderWrapWithLink}
            >
                <div data-testid={`workflow-editor-ci-node-${this.props.title}`} className="workflow-node cursor">
                    {this.props.linkedCount > 0 && (
                        <Tippy
                            className="default-tt w-200"
                            arrow={false}
                            placement="top"
                            content={getLinkedCITippyContent(this.props.linkedCount)}
                        >
                            <button
                                type="button"
                                className={`link-count cursor dc__hover-border-n300 flex dc__gap-4 ${
                                    !this.props.isJobView && selectedNodeKey !== currentNodeKey
                                        ? 'link-count--include-add-cd'
                                        : ''
                                }`}
                                data-testid="linked-symbol"
                                onClick={
                                    this.props.isOffendingPipelineView ? null : this.handleLinkedCIWorkflowChipClick
                                }
                            >
                                <IcLink className="icon-dim-12 dc__no-shrink icon-color-n7" />
                                <span>{this.props.linkedCount}</span>
                            </button>
                        </Tippy>
                    )}
                    <div className="workflow-node__trigger-type workflow-node__trigger-type--create">
                        {this.props.triggerType}
                    </div>
                    {/* TODO: Recheck style */}
                    <div className="workflow-node__title flex workflow-node__title--no-margin h-100">
                        <div className="workflow-node__full-width-minus-Icon p-12">
                            <span className="workflow-node__text-light" data-testid="linked-indication-name">
                                {!this.props.isJobView && pipeline}
                            </span>
                            <Tippy className="default-tt" arrow placement="bottom" content={this.props.title}>
                                <div className="dc__ellipsis-left">{this.props.title}</div>
                            </Tippy>
                            {this.props.isJobView && (
                                <>
                                    <span className="fw-4 fs-11">Env: {env ? env.environment_name : DEFAULT_ENV}</span>
                                    <span className="fw-4 fs-11 ml-4 dc__italic-font-style">{!env && '(Default)'}</span>
                                </>
                            )}
                        </div>
                        {this.renderNodeIcon(isJobCard)}

                        {!this.props.isOffendingPipelineView &&
                            !this.props.isJobView &&
                            selectedNodeKey !== currentNodeKey && (
                                <ToggleCDSelectButton
                                    addNewPipelineBlocked={this.props.addNewPipelineBlocked}
                                    onClickAddNode={this.onClickAddNode}
                                    testId={`ci-deployment-pipeline-button-${this.props.title}`}
                                    deleteConfig={this.deleteConfig}
                                    getWorkflows={this.props.getWorkflows}
                                />
                            )}
                    </div>
                </div>
            </ConditionalWrap>
        )
    }

    render() {
        const isJobCard: boolean = this.props.isJobView || this.props.isJobCI
        return (
            <foreignObject
                className="data-hj-whitelist"
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                style={{ overflow: 'visible' }}
            >
                {this.props.configDiffView ? this.renderReadOnlyCard(isJobCard) : this.renderCardContent(isJobCard)}
            </foreignObject>
        )
    }
}
