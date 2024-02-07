import React from 'react'
import { WorkflowNodeType, ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import ToggleCDSelectButton from '../ToggleCDSelectButton'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg'
import { WebhookNodeProps } from '../types'

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
                            <ToggleCDSelectButton
                                addNewPipelineBlocked={addNewPipelineBlocked}
                                onClickAddNode={addNewCD}
                                testId={`webhook-add-deployment-pipeline-button-${id}`}
                            />
                        )}
                    </div>
                </div>
            </ConditionalWrap>
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
