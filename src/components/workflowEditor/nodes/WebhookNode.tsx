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

import { ReactElement, useState } from 'react'
import {
    WorkflowNodeType,
    ConditionalWrap,
    TARGET_IDS,
    TippyTheme,
    TippyCustomized,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import ToggleCDSelectButton from '../ToggleCDSelectButton'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg'
import { WebhookNodeProps } from '../types'
import { ReactComponent as ICCIWebhook } from '@Icons/ic-CIWebhook.svg'
import { DOCUMENTATION } from '@Config/constants'
import { importComponentFromFELibrary } from '@Components/common'

const WebhookAddImageButton = importComponentFromFELibrary('WebhookAddImageButton', null, 'function')

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
    isTemplateView,
    showAddImageButton = false,
}: WebhookNodeProps) => {
    const [isWebhookTippyOpen, setIsWebhookTippyOpen] = useState(false)

    const selectedNodeKey = `${selectedNode?.nodeType}-${selectedNode?.id}`
    const currentNodeKey = `${WorkflowNodeType.WEBHOOK}-${id ?? ''}`

    const showWebhookAddImageButton = WebhookAddImageButton && showAddImageButton

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

    const toggleIsWebhookTippyOpen = () => {
        setIsWebhookTippyOpen((prev) => !prev)
    }

    const renderWrapWithLinkOrTippy = (children: ReactElement) =>
        isTemplateView ? (
            <TippyCustomized
                theme={TippyTheme.white}
                className="default-tt w-300 h-100"
                placement="bottom"
                Icon={ICCIWebhook}
                heading="External Image Source"
                infoText="When an application is created from this template, a webhook URL is generated for the pipeline. Users can send container images to this URL to deploy them from external services."
                showCloseButton
                onClose={toggleIsWebhookTippyOpen}
                interactive
                appendTo={document.getElementById(TARGET_IDS.WORKFLOW_EDITOR_CONTAINER)}
                documentationLink={DOCUMENTATION.CONFIGURING_WEBHOOK}
                documentationLinkText="Documentation"
                visible={isWebhookTippyOpen}
            >
                {children}
            </TippyCustomized>
        ) : (
            <Link to={to} onClick={hideWebhookTippy} className="dc__no-decor">
                {children}
            </Link>
        )

    const handleCardClick = () => {
        if (isTemplateView) {
            toggleIsWebhookTippyOpen()
        }
    }

    const renderWebhookCard = (): JSX.Element => {
        const shouldWrap = isTemplateView || !!to

        return (
            <ConditionalWrap condition={shouldWrap} wrap={renderWrapWithLinkOrTippy}>
                <div
                    className={`workflow-node ${showWebhookAddImageButton ? 'flexbox-col dc__gap-10 p-12' : 'pl-10'} ${shouldWrap ? 'cursor' : ''}`}
                    onClick={handleCardClick}
                >
                    <div className="workflow-node__title flex workflow-node__title--no-margin h-100">
                        <div
                            className={`workflow-node__full-width-minus-Icon ${!showWebhookAddImageButton ? 'p-12' : ''}`}
                        >
                            <span className="workflow-node__text-light">Webhook</span>
                            <div className="dc__ellipsis-left lh-16">External source</div>
                        </div>

                        <Webhook className="icon-dim-20 mr-12" />

                        {!isReadonlyView && toggleCDMenu && selectedNodeKey !== currentNodeKey && (
                            <ToggleCDSelectButton
                                addNewPipelineBlocked={addNewPipelineBlocked}
                                onClickAddNode={addNewCD}
                                testId={`webhook-deployment-pipeline-button-${id}`}
                                hideDeleteButton
                                isTemplateView={isTemplateView}
                            />
                        )}
                    </div>
                    {showWebhookAddImageButton && <WebhookAddImageButton dataTestId={id} onClick={() => {}} />}
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
