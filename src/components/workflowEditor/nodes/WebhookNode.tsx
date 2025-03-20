/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ReactElement } from 'react'
import { WorkflowNodeType, ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import ToggleCDSelectButton from '../ToggleCDSelectButton'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg'
import { WebhookNodeProps } from '../types'

export const WebhookNode = ({
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
    isReadonlyView = false,
}: WebhookNodeProps) => {
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

    const renderWrapWithLink = (children: ReactElement) => (
        <Link to={to} onClick={hideWebhookTippy} className="dc__no-decor">
            {children}
        </Link>
    )

    const renderWebhookCard = (): JSX.Element => {
        return (
            <ConditionalWrap condition={!!to} wrap={renderWrapWithLink}>
                <div className={`workflow-node pl-10 ${to ? 'cursor' : ''}`}>
                    <div className="workflow-node__title flex workflow-node__title--no-margin h-100">
                        <div className="workflow-node__full-width-minus-Icon p-12">
                            <span className="workflow-node__text-light">Webhook</span>
                            <div className="dc__ellipsis-left">External source</div>
                        </div>

                        <Webhook className="icon-dim-20 mr-12" />

                        {!isReadonlyView && toggleCDMenu && selectedNodeKey !== currentNodeKey && (
                            <ToggleCDSelectButton
                                addNewPipelineBlocked={addNewPipelineBlocked}
                                onClickAddNode={addNewCD}
                                testId={`webhook-deployment-pipeline-button-${id}`}
                                hideDeleteButton
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
