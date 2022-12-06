import React, { Component } from 'react'
import branch from '../../../assets/icons/misc/branch.svg'
import Tippy from '@tippyjs/react'
import { CiPipelineSourceConfig } from '../../ciPipeline/CiPipelineSourceConfig'
import { ConditionalWrap } from '../../common'
import { Link } from 'react-router-dom'

export interface StaticNodeProps {
    x: number
    y: number
    branch: string
    icon: string
    id: string
    url: string
    title: string
    height: number
    width: number
    downstreams: any[]
    sourceType: string
    regex?: string
    primaryBranchAfterRegex?: string
    to?: string
    hideWebhookTippy?: ()=>void
}

export class StaticNode extends Component<StaticNodeProps> {
    renderCardContent() {
        return (
            <ConditionalWrap 
                condition={this.props.branch==="Not Configured"}
                wrap={(children)=>(
                    <Link to={this.props.to} onClick={this.props.hideWebhookTippy} className="dc__no-decor">
                        {children}
                    </Link>
                )}
                >
            <div className="workflow-node workflow-node--static">
                <div className={`workflow-node__git-icon`} />
                <div className="workflow-node__title workflow-node__title--static">
                    <span>/{this.props.title}</span>
                    <CiPipelineSourceConfig
                        sourceType={this.props.sourceType}
                        sourceValue={this.props.branch}
                        showTooltip={true}
                        regex={this.props.regex}
                        primaryBranchAfterRegex={this.props.primaryBranchAfterRegex}
                    />
                </div>
            </div>
            </ConditionalWrap>
        )
    }

    render() {
        return (
            <foreignObject
                className="data-hj-whitelist"
                key={`static-${this.props.id}`}
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                style={{ overflow: 'visible' }}
            >
                {this.renderCardContent()}
            </foreignObject>
        )
    }
}
