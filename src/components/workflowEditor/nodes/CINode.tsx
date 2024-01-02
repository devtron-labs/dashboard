import React, { Component } from 'react'
import { WorkflowNodeType, SelectedNode } from '@devtron-labs/devtron-fe-common-lib'
import ToggleCDSelectButton from '../ToggleCDSelectButton'
import { NodeAttr } from '../../app/details/triggerView/types'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as ICLinkedCINode } from '../../../assets/icons/ic-node-build-linked.svg'
import link from '../../../assets/icons/ic-link.svg'
import Tippy from '@tippyjs/react'
import { Link } from 'react-router-dom'
import { DEFAULT_ENV } from '../../app/details/triggerView/Constants'

export interface CINodeProps {
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
    downstreams: NodeAttr[]
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
}

export class CINode extends Component<CINodeProps> {
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
            <div
                className={`workflow-node__icon-common mr-12 ${
                    isJobCard ? 'workflow-node__job-icon' : 'workflow-node__CI-icon'
                }`}
            />
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
            <Link to={this.props.to} onClick={this.props.hideWebhookTippy} className="dc__no-decor">
                <div data-testid={`workflow-editor-ci-node-${this.props.title}`} className="workflow-node cursor">
                    {this.props.linkedCount > 0 && (
                        <Tippy className="default-tt" arrow placement="bottom" content={this.props.linkedCount}>
                            <span
                                className={`link-count ${
                                    !this.props.isJobView && selectedNodeKey !== currentNodeKey
                                        ? 'link-count--include-add-cd'
                                        : ''
                                }`}
                                data-testid="linked-symbol"
                            >
                                <img src={link} className="icon-dim-12 mr-5" alt="" />
                                {this.props.linkedCount}
                            </span>
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
                            <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.title}>
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

                        {!this.props.isJobView && selectedNodeKey !== currentNodeKey && (
                            <ToggleCDSelectButton
                                addNewPipelineBlocked={this.props.addNewPipelineBlocked}
                                onClickAddNode={this.onClickAddNode}
                                testId={`ci-add-deployment-pipeline-button-${this.props.title}`}
                            />
                        )}
                    </div>
                </div>
            </Link>
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
