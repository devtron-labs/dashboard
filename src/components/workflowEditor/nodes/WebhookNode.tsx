import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg'
import { ConditionalWrap } from '../../common'
import { WebhookNodeProps } from '../types'
import WebhookTippyCard from './WebhookTippyCard'
import Tippy from '@tippyjs/react/headless'

export function WebhookNode({ x, y, width, height, id, to, configDiffView, showWebhookTippy }: WebhookNodeProps) {
    const renderWebhookCard = (): JSX.Element => {
      console.log(showWebhookTippy)
        return (
            <div className={`workflow-node pl-10 ${to ? 'cursor' : ''}`}>
                <ConditionalWrap
                    condition={showWebhookTippy}
                    wrap={(children) => (
                        <Tippy
                            placement="top"
                            arrow={true}
                            showOnCreate={true}
                            render={() => <WebhookTippyCard />}
                        >
                            {children}
                        </Tippy>
                    )}
                >
                    <ConditionalWrap
                        condition={!!to}
                        wrap={(children) => (
                            <Link to={to} className="dc__no-decor">
                                {children}
                            </Link>
                        )}
                    >
                        <div className="workflow-node__title flex">
                            <div className="workflow-node__full-width-minus-Icon">
                                <span className="workflow-node__text-light">Webhook</span>
                                <div className="dc__ellipsis-left">External source</div>
                            </div>
                            <Webhook className="icon-dim-20" />
                        </div>
                    </ConditionalWrap>
                </ConditionalWrap>
            </div>
        )
    }

    return (
        <foreignObject
            className="data-hj-whitelist"
            key={`static-${id}`}
            x={x}
            y={y}
            width={width}
            height={height}
            style={{ overflow: 'visible' }}
        >
            {renderWebhookCard()}
        </foreignObject>
    )
}
