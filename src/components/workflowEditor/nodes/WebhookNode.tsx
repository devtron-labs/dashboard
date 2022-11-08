import Tippy from '@tippyjs/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ConditionalWrap } from '../../common'
import { WebhookNodeProps } from '../types'

export function WebhookNode({ x, y, width, height, id, to, configDiffView, toggleCDMenu }: WebhookNodeProps) {
    const renderWebhookCard = (): JSX.Element => {
        return (
            <div className={`workflow-node pl-10 ${to ? 'cursor' : ''}`}>
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

                {toggleCDMenu && (
                    <button className="workflow-node__add-cd-btn">
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content={
                                <span style={{ display: 'block', width: '145px' }}> Add deployment pipeline </span>
                            }
                        >
                            <Add
                                className="icon-dim-18 fcb-5"
                                onClick={(event: any) => {
                                    event.stopPropagation()
                                    let { top, left } = event.target.getBoundingClientRect()
                                    top = top + 25
                                    toggleCDMenu()
                                }}
                            />
                        </Tippy>
                    </button>
                )}
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
