import React, { Component } from 'react'
import { NodeAttr } from '../../app/details/triggerView/types'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
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
}

export class CINode extends Component<CINodeProps> {
    onClickAddNode = (event: any) => {
      if (this.props.addNewPipelineBlocked) {
          return
      }
      event.stopPropagation()
      let { top, left } = event.target.getBoundingClientRect()
      top = top + 25
      this.props.toggleCDMenu()
    }

    renderNodeIcon = (isJobCard: boolean) => {
        if (this.props.showPluginWarning) {
            return <Warning className="icon-dim-18 warning-icon-y7" />
        }
        return (
            <div
                className={`workflow-node__icon-common ${
                    (isJobCard) ? 'workflow-node__job-icon' : 'workflow-node__CI-icon'
                }`}
            />
        )
    }

    renderReadOnlyCard = (isJobCard: boolean) => {
        const _buildText = this.props.isExternalCI ? 'Build: External' : 'Build'
        const nodeText =  (isJobCard) ? 'Job' : _buildText
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
        const env = currPipeline?.environmentId ? this.props.envList.find((env) => +env.id === +currPipeline.environmentId) : undefined
        const _buildText = this.props.isExternalCI ? 'Build: External' : 'Build'
        const _linkedBuildText = this.props.isLinkedCI ? 'Build: Linked' : _buildText
        const pipeline =  isJobCard ? 'Job' : _linkedBuildText

        return (
            <>
                <Link to={this.props.to} onClick={this.props.hideWebhookTippy} className="dc__no-decor">
                    <div data-testid={`workflow-editor-ci-node-${this.props.title}`} className="workflow-node cursor">
                        {this.props.linkedCount > 0 && (
                            <Tippy
                                className="default-tt"
                                arrow={true}
                                placement="bottom"
                                content={this.props.linkedCount}
                            >
                                <span className="link-count" data-testid="linked-symbol">
                                    <img src={link} className="icon-dim-12 mr-5" alt="" />
                                    {this.props.linkedCount}
                                </span>
                            </Tippy>
                        )}
                        <div className="workflow-node__trigger-type workflow-node__trigger-type--create">
                            {this.props.triggerType}
                        </div>
                        <div className="workflow-node__title flex">
                            <div className="workflow-node__full-width-minus-Icon">
                                <span className="workflow-node__text-light" data-testid="linked-indication-name">
                                    {!this.props.isJobView && pipeline}
                                </span>
                                <Tippy
                                    className="default-tt"
                                    arrow={true}
                                    placement="bottom"
                                    content={this.props.title}
                                >
                                    <div className="dc__ellipsis-left">{this.props.title}</div>
                                </Tippy>
                                {this.props.isJobView && (
                                    <>
                                        <span className="fw-4 fs-11">
                                            Env: {env ? env.environment_name : DEFAULT_ENV}
                                        </span>
                                        <span className="fw-4 fs-11 ml-4 dc__italic-font-style">
                                            {!env && '(Default)'}
                                        </span>
                                    </>
                                )}
                            </div>
                            {this.renderNodeIcon(isJobCard)}
                        </div>
                    </div>
                </Link>
                {!this.props.isJobView && (
                    <button
                        className="workflow-node__add-cd-btn"
                        data-testid={`ci-add-deployment-pipeline-button-${this.props.title}`}
                    >
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content={
                                <span style={{ display: 'block', width: '145px' }}>
                                    {this.props.addNewPipelineBlocked
                                        ? 'Cannot add new workflow or deployment pipelines when environment filter is applied.'
                                        : 'Add deployment pipeline'}
                                </span>
                            }
                        >
                            <Add
                                className={`icon-dim-18 fcb-5 ${this.props.addNewPipelineBlocked ? 'dc__disabled' : ''}`}
                                onClick={this.onClickAddNode}
                            />
                        </Tippy>
                    </button>
                )}
            </>
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
