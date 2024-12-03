import { URLS } from '@Config/routes'
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
import { useContext, useEffect } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { TriggerViewContext } from './config'
import { WebhookReceivedPayloadModalType } from './types'
import { CiWebhookModal } from './CiWebhookDebuggingModal'

export const WebhookReceivedPayloadModal = ({
    fromBulkCITrigger = false,
    title,
    webhookPayloads,
    material,
    pipelineId,
    isWebhookPayloadLoading,
    workflowId,
    fromAppGrouping = false,
    isJobView = false,
    getWebhookPayload,
    appId,
    isBulkCIWebhook = false,
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
            <div
                className={`ci-webhook-header flex dc__content-space px-20 py-12 dc__border-bottom ${fromBulkCITrigger ? 'bcn-0' : ''}`}
            >
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
            <div className={`h-100 ${fromBulkCITrigger ? 'dc__position-fixed bcn-0 env-modal-width full-height' : ''}`}>
                <CiWebhookModal
                    webhookPayloads={webhookPayloads}
                    ciPipelineMaterialId={+material[0].id}
                    ciPipelineId={+pipelineId}
                    isWebhookPayloadLoading={isWebhookPayloadLoading}
                    workflowId={workflowId}
                    fromAppGrouping={fromAppGrouping}
                    isJobView={isJobView}
                    appId={appId}
                />
            </div>
        )
    }

    if (isBulkCIWebhook) {
        // For bulk CI webhook, we don't need to show the modal as a child of the trigger view
        return null
    }

    return (
        <VisibleModal>
            <div
                className="modal-body--ci-material h-100 w-100 flexbox-col dc__overflow-hidden"
                onClick={stopPropagation}
            >
                {renderWebhookMaterialHeader()}
                {renderWebhookModal()}
            </div>
        </VisibleModal>
    )
}
