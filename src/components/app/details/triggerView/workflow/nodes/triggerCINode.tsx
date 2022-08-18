import React, { Component } from 'react'
import { TriggerStatus } from '../../../../config'
import { TriggerViewContext } from '../../TriggerView'
import { RouteComponentProps } from 'react-router'
import { CIMaterialType } from '../../MaterialHistory'
import { Link } from 'react-router-dom'
import { DEFAULT_STATUS, URLS } from '../../../../../../config'
import link from '../../../../../../assets/icons/ic-link.svg'
import Tippy from '@tippyjs/react'

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
        const LINK = this.getCIDetailsURL()
        this.props.history.push(LINK)
    }

    renderStatus() {
        let url = this.getCIDetailsURL()
        let status = this.props.status ? this.props.status.toLowerCase() : ''
        let hideDetails =
            status === DEFAULT_STATUS.toLowerCase() || status === 'not triggered' || status === 'not deployed'
        if (hideDetails)
            return (
                <div className="cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                    {this.props.status}
                </div>
            )
        else
            return (
                <div className="cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                    {this.props.status}
                    <span className="mr-5 ml-5">/</span>
                    <Link to={url} className="workflow-node__details-link">
                        Details
                    </Link>
                </div>
            )
    }

    renderCardContent(context) {
        let status = this.props.status ? this.props.status.toLowerCase() : ''
        let hideDetails =
            status === DEFAULT_STATUS.toLowerCase() || status === 'not triggered' || status === 'not deployed'

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
                        <span className="workflow-node__text-light">Build</span>
                        <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.title}>
                            <div className="ellipsis-left">{this.props.title}</div>
                        </Tippy>
                    </div>
                    <div className="workflow-node__icon-common ml-8 workflow-node__CI-icon" />
                </div>
                {this.renderStatus()}
                <div className="workflow-node__btn-grp">
                    <button
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
