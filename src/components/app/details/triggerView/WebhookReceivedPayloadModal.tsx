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

import { useContext, useEffect } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    GenericEmptyState,
    stopPropagation,
    VisibleModal,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as LeftIcon } from '@Icons/ic-arrow-backward.svg'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { URLS } from '@Config/routes'

import { CiWebhookModal } from './CiWebhookDebuggingModal'
import { TriggerViewContext } from './config'
import { WebhookReceivedPayloadModalType } from './types'

export const WebhookReceivedPayloadModal = ({
    title,
    webhookPayloads,
    material,
    pipelineId,
    isWebhookPayloadLoading,
    workflowId,
    isJobView = false,
    getWebhookPayload,
    appId,
}: WebhookReceivedPayloadModalType) => {
    const { push } = useHistory()
    const { url } = useRouteMatch()
    const triggerViewContext = useContext(TriggerViewContext)
    const onClickBackButton = (): void => {
        push(url.split(`/${URLS.WEBHOOK_MODAL}`)[0])
    }
    const webhookRepoName = (webhookPayloads?.repositoryUrl ?? material[0].gitMaterialUrl)
        ?.replace('.git', '')
        .split('/')
        .pop()

    useEffect(() => {
        // Sometime the workflow id and material's actual id differs
        if (material[0]?.id) {
            getWebhookPayload(material[0]?.id)
        }
    }, [JSON.stringify(material)])

    const onClickCloseButton = (): void => {
        triggerViewContext.closeCIModal()
    }

    function renderWebhookMaterialHeader() {
        return (
            <div className="ci-webhook-header flex dc__content-space px-20 py-12 dc__border-bottom">
                <h2
                    data-testid="build-deploy-pipeline-name-heading"
                    className="modal__title flex left fs-16 dc__gap-12"
                >
                    <Button
                        dataTestId="webhook-back-button"
                        ariaLabel="Back"
                        icon={<LeftIcon />}
                        variant={ButtonVariantType.borderLess}
                        size={ComponentSizeType.xs}
                        showAriaLabelInTippy={false}
                        style={ButtonStyleType.neutral}
                        onClick={onClickBackButton}
                    />

                    <div className="flex left">
                        <span className="dc__mxw-250 dc__truncate">{title}</span>
                        <span className="fs-16">&nbsp;/ All received webhooks </span>
                    </div>
                </h2>

                <Button
                    dataTestId="webhook-close-button"
                    ariaLabel="Cancel"
                    icon={<Close />}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.xs}
                    showAriaLabelInTippy={false}
                    style={ButtonStyleType.negativeGrey}
                    onClick={onClickCloseButton}
                />
            </div>
        )
    }

    const renderNoWebhook = () => (
        <div className="flex column w-100">
            <span className="fs-16">No webhook received from</span>
            <a
                href={webhookPayloads?.repositoryUrl}
                rel="noreferrer noopener"
                target="_blank"
                className="dc__link dc__word-break w-100"
            >
                /{webhookRepoName}
            </a>
        </div>
    )

    const renderWebhookModal = () => {
        if (!webhookPayloads?.payloads?.length) {
            return (
                <GenericEmptyState
                    title={renderNoWebhook()}
                    subTitle="All webhook payloads received from the repository will be available here"
                    classname="h-100"
                />
            )
        }
        return (
            <div className="flexbox-col flex-grow-1">
                <CiWebhookModal
                    webhookPayloads={webhookPayloads}
                    ciPipelineMaterialId={+material[0].id}
                    ciPipelineId={+pipelineId}
                    isWebhookPayloadLoading={isWebhookPayloadLoading}
                    workflowId={workflowId}
                    fromAppGrouping={false}
                    isJobView={isJobView}
                    appId={appId}
                />
            </div>
        )
    }

    return (
        <VisibleModal>
            <div
                className="modal-body--ci-material h-100 w-100 flexbox-col border__primary--left dc__overflow-hidden"
                onClick={stopPropagation}
            >
                {renderWebhookMaterialHeader()}
                {renderWebhookModal()}
            </div>
        </VisibleModal>
    )
}
