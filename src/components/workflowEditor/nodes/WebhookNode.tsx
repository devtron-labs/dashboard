import Tippy from '@tippyjs/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ConditionalWrap } from '../../common'
import { WebhookNodeProps } from '../types'
import { WorkflowNodeType } from '../../app/details/triggerView/types'

export function WebhookNode({
    x,
    y,
    width,
    height,
    id,
    to,
    toggleCDMenu,
    hideWebhookTippy,
    addNewPipelineBlocked,
    handleSelectedNodeChange,
    selectedNode,
    isLastNode,
}: WebhookNodeProps) {
    const selectedNodeKey = `${selectedNode?.nodeType}-${selectedNode?.id}`
    const currentNodeKey = `${WorkflowNodeType.WEBHOOK}-${id ?? ''}`

    const addNewCD = (event): void => {
        event.preventDefault()
        event.stopPropagation()

        if (addNewPipelineBlocked) {
            return
        }

        if (isLastNode) {
            toggleCDMenu()
        } else {
            handleSelectedNodeChange?.({
                nodeType: WorkflowNodeType.WEBHOOK,
                id: String(id),
            })
        }
    }
    

    const renderWebhookCard = (): JSX.Element => {
        return (
            <>
                <ConditionalWrap
                    condition={!!to}
                    wrap={(children) => (
                        <Link to={to} onClick={hideWebhookTippy} className="dc__no-decor">
                            {children}
                        </Link>
                    )}
                >
                    <div className={`workflow-node pl-10 ${to ? 'cursor' : ''}`}>
                        <div className="workflow-node__title flex workflow-node__title--no-margin h-100">
                            <div className="workflow-node__full-width-minus-Icon p-12">
                                <span className="workflow-node__text-light">Webhook</span>
                                <div className="dc__ellipsis-left">External source</div>
                            </div>

                            <Webhook className="icon-dim-20 mr-12" />

                            {toggleCDMenu && selectedNodeKey !== currentNodeKey && (
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="top"
                                    content={
                                        <span style={{ display: 'block', width: '145px' }}>
                                            {addNewPipelineBlocked
                                                ? 'Cannot add new workflow or deployment pipelines when environment filter is applied.'
                                                : 'Add deployment pipeline'}
                                        </span>
                                    }
                                >
                                    <button className="flex h-100 pl-6 pr-6 pt-0 pb-0 dc__outline-none-imp bcn-0 dc__no-border dc__hover-b500 pt-4 pb-4 pl-6 pr-6 dc__border-left-n1--important workflow-node__title--top-right-rad-8 workflow-node__title--bottom-right-rad-8 workflow-node__title--add-cd-icon" type="button" onClick={addNewCD}>
                                        <Add
                                            className={`icon-dim-12 fcn-6 ${addNewPipelineBlocked ? 'dc__disabled' : ''}`}
                                        />
                                    </button>
                                </Tippy>
                            )}
                        </div>
                    </div>
                </ConditionalWrap>
            </>
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
