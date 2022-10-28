import React, { Component } from 'react'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg';

export interface WebhookNodeProps {
  x: number
  y: number
  width: number
  height: number
  id: number
  title: string
  type: string
  description: string
  workflowId?: number
  triggerType: string
  isLinkedCI: boolean
  isExternalCI: boolean
  isTrigger: boolean
  linkedCount: number
  to?: string
  configDiffView?: boolean
}

export class WebhookNode extends Component<WebhookNodeProps> {
  renderWebhookCard() {
    return (
        <div className="workflow-node pl-10">
            <div className="workflow-node__title flex">
                <div className="workflow-node__full-width-minus-Icon">
                    <span className="workflow-node__text-light">
                       Webhook
                    </span>
                    <div className="dc__ellipsis-left">External source</div>
                </div>
                <Webhook className="icon-dim-20"/>
            </div>
        </div>
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
                {this.renderWebhookCard()}
            </foreignObject>
        )
    }
}
