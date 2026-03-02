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

import { useEffect, useState, useCallback } from 'react'
import {
    showError,
    Progressing,
    ConditionalWrap,
    VisibleModal,
    ServerErrors,
    RadioGroup,
    RadioGroupItem,
    CustomInput,
    noop,
    TriggerType,
    URLS as CommonURLS,
    Button,
    ButtonVariantType,
    ButtonStyleType,
    DeleteCINodeButton,
    ROUTER_URLS,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useParams } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { getInitDataWithCIPipeline } from './ciPipeline.service'
import { ViewType, URLS } from '../../config'
import { LinkedCIPipelineViewProps, CIPipelineState } from './types'
import { getCIPipelineURL, Info } from '../common'
import { getWorkflowList } from '../../services/service'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Warning } from '../../assets/icons/ic-warning.svg'
import { SourceMaterials } from './SourceMaterials'
import './ciPipeline.scss'

const LinkedCIPipelineView = ({
    close,
    connectCDPipelines,
    getWorkflows,
    isTemplateView,
}: LinkedCIPipelineViewProps) => {
    const { appId, ciPipelineId, workflowId } = useParams<{ appId: string; ciPipelineId: string; workflowId: string }>()
    const [view, setView] = useState(ViewType.LOADING)
    const [form, setForm] = useState<CIPipelineState['form']>({
        name: '',
        args: [{ key: '', value: '', id: 0 }],
        materials: [],
        triggerType: TriggerType.Auto,
        beforeDockerBuildScripts: [],
        afterDockerBuildScripts: [],
        gitHost: undefined,
        webhookEvents: [],
        ciPipelineSourceTypeOptions: [],
        webhookConditionList: [],
        ciPipelineEditable: true,
        isOffendingMandatoryPlugin: false,
    })
    const [ciPipeline, setCiPipeline] = useState<CIPipelineState['ciPipeline']>({
        parentCiPipeline: 0,
        parentAppId: 0,
        active: true,
        ciMaterial: [],
        dockerArgs: {},
        externalCiConfig: {},
        id: 0,
        isExternal: false,
        isManual: false,
        name: '',
        linkedCount: 0,
    })
    const [sourcePipelineURL, setSourcePipelineURL] = useState('')

    const generateSourceUrl = useCallback(
        async (pipeline: CIPipelineState['ciPipeline']) => {
            try {
                const parentCiPipelineId = pipeline.parentCiPipeline
                const { result } = await getWorkflowList(pipeline.parentAppId, null, isTemplateView)
                let wf
                if (result.workflows) {
                    const allWorkflows = result.workflows
                    for (let i = 0; i < allWorkflows.length; i++) {
                        if (allWorkflows[i].tree) {
                            wf = allWorkflows[i].tree.find(
                                (nd) => nd.type === 'CI_PIPELINE' && nd.componentId === parentCiPipelineId,
                            )
                        }
                        if (wf) {
                            break
                        }
                    }
                    const url = getCIPipelineURL(
                        pipeline.parentAppId.toString(),
                        wf.appWorkflowId,
                        false,
                        parentCiPipelineId,
                        false,
                        false,
                        isTemplateView,
                    )
                    setSourcePipelineURL(
                        `${ROUTER_URLS.DEVTRON_APP}/${pipeline.parentAppId}/${CommonURLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${url}`,
                    )
                }
            } catch {
                setSourcePipelineURL(
                    `${ROUTER_URLS.DEVTRON_APP}/${pipeline.parentAppId}/${CommonURLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}`,
                )
            }
        },
        [isTemplateView],
    )

    useEffect(() => {
        getInitDataWithCIPipeline(appId, ciPipelineId, true, isTemplateView)
            .then((response) => {
                setView(response.view)
                setForm(response.form)
                setCiPipeline(response.ciPipeline)
                generateSourceUrl(response.ciPipeline)
            })
            .catch((error: ServerErrors) => {
                showError(error)
                setView(ViewType.FORM)
            })
    }, [appId, ciPipelineId, isTemplateView, close, generateSourceUrl])

    const renderInfoDialog = () => (
        <div className="dc__info-container info__container--linked-ci mb-16">
            <Info />
            <div className="flex column left">
                <div className="dc__info-title">Configurations(Read Only)</div>
                <div className="dc__info-subtitle">
                    You cannot edit a linked Pipeline. To make changes edit the source Pipeline.
                    <Link to={sourcePipelineURL} target="_blank" className="ml-5">
                        View Source Pipeline
                    </Link>
                </div>
            </div>
        </div>
    )

    const renderTriggerType = () => (
        <div className="form__row">
            <label className="form__label form__label--sentence dc__required-field">
                When do you want the pipeline to execute?
            </label>
            <RadioGroup value={form.triggerType} name="trigger-type" onChange={noop} disabled>
                <RadioGroupItem value={TriggerType.Auto}> Automatic </RadioGroupItem>
                <RadioGroupItem value={TriggerType.Manual}> Manual </RadioGroupItem>
            </RadioGroup>
        </div>
    )

    const renderMaterials = () => (
        <SourceMaterials
            materials={form.materials}
            includeWebhookEvents={false}
            ciPipelineSourceTypeOptions={form.ciPipelineSourceTypeOptions}
            canEditPipeline
        />
    )

    const renderHeader = () => (
        <div className="flex left py-16 px-20 dc__content-space dc__border-bottom">
            <h2 className="fs-16 fw-6 m-0">Linked build pipeline</h2>
            <Button
                dataTestId="linked-ci-pipeline-close-button"
                icon={<Close />}
                ariaLabel="Close"
                showAriaLabelInTippy={false}
                onClick={close}
                variant={ButtonVariantType.borderLess}
                style={ButtonStyleType.negativeGrey}
            />
        </div>
    )

    const renderDeleteButton = () => {
        const canDeletePipeline = connectCDPipelines === 0 && ciPipeline.linkedCount === 0

        const deleteConfig = {
            appId,
            pipelineId: ciPipeline.id,
            pipelineName: ciPipeline.name,
            appWorkflowId: Number(workflowId),
        }

        if (ciPipelineId) {
            return (
                <ConditionalWrap
                    condition={!canDeletePipeline}
                    wrap={(children) => (
                        <Tippy
                            className="default-tt"
                            content="This Pipeline cannot be deleted as it has connected CD pipeline"
                        >
                            <div>{children}</div>
                        </Tippy>
                    )}
                >
                    <DeleteCINodeButton
                        testId="delete-linked-pipeline"
                        disabled={!canDeletePipeline}
                        deletePayloadConfig={deleteConfig}
                        title={form.name}
                        getWorkflows={getWorkflows}
                        showIconOnly={false}
                        onDelete={close}
                        isTemplateView={isTemplateView}
                    />
                </ConditionalWrap>
            )
        }
        return null
    }

    const renderCIPipelineBody = () => {
        if (view === ViewType.LOADING) {
            return (
                <div style={{ minHeight: '380px' }} className="flex">
                    <Progressing pageLoader />
                </div>
            )
        }

        return (
            <>
                <label className="form__row">
                    <CustomInput
                        name="name"
                        label="Pipeline Name"
                        disabled={!!ciPipeline.id}
                        placeholder="Name"
                        value={ciPipeline.name}
                        onChange={noop}
                        required
                    />
                </label>
                {renderTriggerType()}
                {renderMaterials()}
            </>
        )
    }

    return (
        <VisibleModal className="" onEscape={close} >
            <div className="modal__body p-0 br-0 modal__body--ci">
                {renderHeader()}
                <div className="px-20 py-16">
                    {renderInfoDialog()}
                    {renderCIPipelineBody()}
                </div>
                {view !== ViewType.LOADING && (
                    <div className="ci-button-container py-12 px-20 flex flex-justify dc__gap-16">
                        {renderDeleteButton()}
                        <Link
                            to={sourcePipelineURL}
                            target="_blank"
                            className="cta cta--workflow flex flex-1 dc__no-decor"
                        >
                            {form.isOffendingMandatoryPlugin && (
                                <Warning className="icon-dim-14 warning-icon-y5-imp mr-4" />
                            )}
                            View Source Pipeline
                        </Link>
                    </div>
                )}
            </div>
        </VisibleModal>
    )
}

export default LinkedCIPipelineView
