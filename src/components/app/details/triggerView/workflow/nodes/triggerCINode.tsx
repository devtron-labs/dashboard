import React, { Component } from 'react'
import { TriggerStatus } from '../../../../config'
import { RouteComponentProps } from 'react-router'
import { CIMaterialType } from '../../MaterialHistory'
import { Link } from 'react-router-dom'
import { BUILD_STATUS, DEFAULT_STATUS, URLS } from '../../../../../../config'
import link from '../../../../../../assets/icons/ic-link.svg'
import Tippy from '@tippyjs/react'
import { TriggerViewContext } from '../../config'

export interface TriggerCINodeProps extends RouteComponentProps<{ appId: string }> {
    x: number
    y: number
    height: number
    width: number
    id: string
    title: string
    type: string
    triggerType: string
    isExternalCI: boolean
    isLinkedCI: boolean
    description: string
    status: string
    linkedCount: number
    downstreams?: string[]
    colorCode: string
    inputMaterialsNew: CIMaterialType[]
    workflowId: string
    branch: string
    fromAppGrouping: boolean
    isJobView?: boolean
    index?: number
}

export class TriggerCINode extends Component<TriggerCINodeProps> {
    constructor(props) {
        super(props)
        this.redirectToCIDetails = this.redirectToCIDetails.bind(this)
    }

    getCIDetailsURL(): string {
        return `${this.props.match.url.replace(URLS.APP_TRIGGER, URLS.APP_CI_DETAILS)}/${this.props.id}`
    }

    redirectToCIDetails() {
        if (this.props.fromAppGrouping) {
            return
        }
        this.props.history.push(this.getCIDetailsURL())
    }

    hideDetails(status: string = '') {
        return (
            status === DEFAULT_STATUS.toLowerCase() ||
            status === BUILD_STATUS.NOT_TRIGGERED ||
            status === BUILD_STATUS.NOT_DEPLOYED ||
            status === ''
        )
    }

    renderStatus() {
        const url = this.getCIDetailsURL()
        const status = this.props.status ? this.props.status.toLowerCase() : ''
        if (this.hideDetails(status))
            return (
                <div
                    data-testid="ci-trigger-status-not-triggered"
                    className="dc__cd-trigger-status"
                    style={{ color: TriggerStatus[status] }}
                >
                    {this.props.status ? this.props.status : BUILD_STATUS.NOT_TRIGGERED}
                </div>
            )
        else
            return (
                <div
                    data-testid={`ci-trigger-status-${this.props.index}`}
                    className="dc__cd-trigger-status"
                    style={{ color: TriggerStatus[status] }}
                >
                    {this.props.status && this.props.status.toLowerCase() === 'cancelled'
                        ? 'ABORTED'
                        : this.props.status}
                    {this.props.status && <span className="mr-5 ml-5">/</span>}
                    <Link
                        data-testid={`ci-trigger-select-details-button-${this.props.title}`}
                        to={url}
                        className="workflow-node__details-link"
                    >
                        Details
                    </Link>
                </div>
            )
    }

    renderCardContent(context) {
        const hideDetails = this.hideDetails(this.props.status?.toLowerCase())

        return (
            <div
                className={`${hideDetails ? 'workflow-node' : 'workflow-node cursor'}`}
                onClick={(e) => {
                    if (!hideDetails) this.redirectToCIDetails()
                }}
            >
                {this.props.linkedCount ? (
                    <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.linkedCount}>
                        <span className="link-count">
                            {' '}
                            <img src={link} className="icon-dim-12 mr-5" alt="" />
                            {this.props.linkedCount}
                        </span>
                    </Tippy>
                ) : null}
                <div className="workflow-node__trigger-type workflow-node__trigger-type--ci">
                    {this.props.triggerType}
                </div>
                <div className="workflow-node__title flex">
                    {/* <img src={build} className="icon-dim-24 mr-16" /> */}
                    <div className="workflow-node__full-width-minus-Icon">
                        <span className="workflow-node__text-light">{this.props.isJobView ? 'Job' : 'Build'}</span>
                        <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.title}>
                            <div className="dc__ellipsis-left">{this.props.title}</div>
                        </Tippy>
                    </div>
                    <div
                        className={`workflow-node__icon-common ml-8 ${
                            this.props.isJobView ? 'workflow-node__job-icon' : 'workflow-node__CI-icon'
                        }`}
                    />
                </div>
                {this.renderStatus()}
                <div className="workflow-node__btn-grp">
                    <button
                        data-testid={`workflow-build-select-material-button-${this.props.index}`}
                        className="workflow-node__deploy-btn workflow-node__deploy-btn--ci"
                        onClick={(event) => {
                            event.stopPropagation()
                            context.onClickCIMaterial(this.props.id, this.props.title)
                        }}
                    >
                        Select Material
                    </button>
                </div>
            </div>
        )
    }

    render() {
        return (
            <foreignObject
                className="data-hj-whitelist"
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                style={{ overflow: 'visible' }}
            >
                <TriggerViewContext.Consumer>
                    {(context) => {
                        return this.renderCardContent(context)
                    }}
                </TriggerViewContext.Consumer>
            </foreignObject>
        )
    }
}
