import React from 'react'
import { toast } from 'react-toastify'
import { VisibleModal, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
// TODO: Change this image
import workflowModal from '../../assets/img/guide-onboard.png'
import {
    NO_ENV_FOUND,
    SOURCE_TYPE_CARD_VARIANTS,
    WORKFLOW_OPTIONS_MODAL,
    WORKFLOW_OPTIONS_MODAL_TYPES,
} from './workflowEditor.constants'
import SourceTypeCard from './SourceTypeCard'
import { WorkflowOptionsModalProps } from './types'
import { CIPipelineNodeType, PipelineType } from '../app/details/triggerView/types'
import { importComponentFromFELibrary } from '../common'

export default function WorkflowOptionsModal({
    handleCloseWorkflowOptionsModal,
    addCIPipeline,
    addWebhookCD,
    addLinkedCD,
    showLinkedCDSource,
    changeCIPayload,
}: WorkflowOptionsModalProps) {
    const LINKED_CD_SOURCE_VARIANT = importComponentFromFELibrary('LINKED_CD_SOURCE_VARIANT', null, 'function')

    const handleCardAction = (e: React.MouseEvent) => {
        if (!(e.currentTarget instanceof HTMLDivElement)) {
            return
        }

        e.stopPropagation()
        const pipelineType = e.currentTarget.dataset.pipelineType

        if (pipelineType === PipelineType.WEBHOOK) {
            addWebhookCD(changeCIPayload?.appWorkflowId ?? 0)
            handleCloseWorkflowOptionsModal()
            return
        }

        if (LINKED_CD_SOURCE_VARIANT && pipelineType === LINKED_CD_SOURCE_VARIANT.type) {
            if (!showLinkedCDSource) {
                toast.error(NO_ENV_FOUND)
                return
            }

            addLinkedCD(changeCIPayload?.appWorkflowId ?? 0)
            handleCloseWorkflowOptionsModal()
            return
        }

        addCIPipeline(pipelineType as CIPipelineNodeType, changeCIPayload?.appWorkflowId ?? 0)
        handleCloseWorkflowOptionsModal()
    }

    return (
        <VisibleModal className="" onEscape={handleCloseWorkflowOptionsModal} close={handleCloseWorkflowOptionsModal}>
            <div className="workflow-options-modal br-8 flexbox h-500 dc__overflow-scroll" onClick={stopPropagation}>
                {/* Sidebar */}
                <div className="flexbox-col w-236 pt-32 dc__window-bg">
                    {/* Info */}
                    <div className="flexbox-col dc__gap-6 dc__align-self-stretch pt-0 pb-0 pl-24 pr-24">
                        <p className="cn-9 fs-16 fw-6 lh-24">{WORKFLOW_OPTIONS_MODAL.ACTION_TEXT}</p>

                        <p className="m-0 cn-7 fs-13 fw-4 lh-20">{WORKFLOW_OPTIONS_MODAL.ACTION_NOTE}</p>
                    </div>

                    <img src={workflowModal} alt="workflow-action" />
                </div>

                {/* Content */}
                <div className="flexbox-col p-20 dc__gap-12 dc__overflow-scroll">
                    <section className="flexbox-col dc__gap-8 dc__align-self-stretch">
                        <p className="m-0 cn-7 fs-11 fw-6 lh-16">{WORKFLOW_OPTIONS_MODAL_TYPES.DEFAULT}</p>

                        <SourceTypeCard
                            title={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.title}
                            subtitle={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.subtitle}
                            image={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.image}
                            alt={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.alt}
                            dataTestId={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.dataTestId}
                            type={SOURCE_TYPE_CARD_VARIANTS.SOURCE_CODE.type}
                            handleCardAction={handleCardAction}
                        />

                        <SourceTypeCard
                            title={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.title}
                            subtitle={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.subtitle}
                            image={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.image}
                            alt={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.alt}
                            dataTestId={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.dataTestId}
                            type={SOURCE_TYPE_CARD_VARIANTS.LINKED_PIPELINE.type}
                            handleCardAction={handleCardAction}
                        />
                    </section>

                    <section className="flexbox-col dc__gap-8 dc__align-self-stretch">
                        <p className="m-0 cn-7 fs-11 fw-6 lh-16">{WORKFLOW_OPTIONS_MODAL_TYPES.RECIEVE}</p>

                        <SourceTypeCard
                            title={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.title}
                            subtitle={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.subtitle}
                            image={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.image}
                            alt={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.alt}
                            dataTestId={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.dataTestId}
                            type={SOURCE_TYPE_CARD_VARIANTS.EXTERNAL_SERVICE.type}
                            handleCardAction={handleCardAction}
                        />

                        {!!LINKED_CD_SOURCE_VARIANT && (
                            <SourceTypeCard
                                title={LINKED_CD_SOURCE_VARIANT.title}
                                subtitle={LINKED_CD_SOURCE_VARIANT.subtitle}
                                image={LINKED_CD_SOURCE_VARIANT.image}
                                alt={LINKED_CD_SOURCE_VARIANT.alt}
                                dataTestId={LINKED_CD_SOURCE_VARIANT.dataTestId}
                                type={LINKED_CD_SOURCE_VARIANT.type}
                                handleCardAction={handleCardAction}
                            />
                        )}
                    </section>

                    {window._env_.ENABLE_CI_JOB && (
                        <section className="flexbox-col dc__gap-8 dc__align-self-stretch">
                            <p className="m-0 cn-7 fs-11 fw-6 lh-16">{WORKFLOW_OPTIONS_MODAL_TYPES.JOB}</p>

                            <SourceTypeCard
                                title={SOURCE_TYPE_CARD_VARIANTS.JOB.title}
                                subtitle={SOURCE_TYPE_CARD_VARIANTS.JOB.subtitle}
                                image={SOURCE_TYPE_CARD_VARIANTS.JOB.image}
                                alt={SOURCE_TYPE_CARD_VARIANTS.JOB.alt}
                                dataTestId={SOURCE_TYPE_CARD_VARIANTS.JOB.dataTestId}
                                type={SOURCE_TYPE_CARD_VARIANTS.JOB.type}
                                handleCardAction={handleCardAction}
                            />
                        </section>
                    )}
                </div>
            </div>
        </VisibleModal>
    )
}
