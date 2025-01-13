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

import React, { Component } from 'react'
import {
    showError,
    Progressing,
    ConditionalWrap,
    VisibleModal,
    DeleteDialog,
    ServerErrors,
    RadioGroup,
    RadioGroupItem,
    CustomInput,
    noop,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { getInitDataWithCIPipeline, deleteCIPipeline } from './ciPipeline.service'
import { TriggerType, ViewType, URLS } from '../../config'
import { CIPipelineProps, CIPipelineState } from './types'
import { getCIPipelineURL, Info } from '../common'
import { getWorkflowList } from '../../services/service'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Warning } from '../../assets/icons/ic-warning.svg'
import { SourceMaterials } from './SourceMaterials'
import './ciPipeline.scss'

export default class LinkedCIPipelineView extends Component<CIPipelineProps, CIPipelineState> {
    constructor(props) {
        super(props)
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            showError: false,
            form: {
                name: '',
                args: [{ key: '', value: '' }],
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
            },
            ciPipeline: {
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
            },
            showDeleteModal: false,
            showDockerArgs: false,
            loadingData: true,
            sourcePipelineURL: '',
            showPreBuild: false,
            showPostBuild: false,
            showDocker: false,
        }
        this.deletePipeline = this.deletePipeline.bind(this)
        this.closeCIDeleteModal = this.closeCIDeleteModal.bind(this)
        this.escFunction = this.escFunction.bind(this)
    }

    componentDidMount() {
        document.addEventListener('keydown', this.escFunction)
        getInitDataWithCIPipeline(this.props.match.params.appId, this.props.match.params.ciPipelineId, true)
            .then((response) => {
                this.setState({ ...response, loadingData: false }, () => {
                    this.generateSourceUrl().catch(() => {
                        this.setState({
                            sourcePipelineURL: `${URLS.APP}/${this.state.ciPipeline.parentAppId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}`,
                        })
                    })
                })
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({ loadingData: false })
            })
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escFunction)
    }

    escFunction(event) {
        if ((event.keyCode === 27 || event.key === 'Escape') && typeof this.props.close === 'function') {
            this.props.close()
        }
    }

    async generateSourceUrl() {
        const parentCiPipelineId = this.state.ciPipeline.parentCiPipeline
        const { result } = await getWorkflowList(this.state.ciPipeline.parentAppId)
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
                this.state.ciPipeline.parentAppId.toString(),
                wf.appWorkflowId,
                false,
                parentCiPipelineId,
                false,
                false,
            )
            this.setState({
                sourcePipelineURL: `${URLS.APP}/${this.state.ciPipeline.parentAppId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${url}`,
            })
        }
    }

    // invoked on Done, Discard, collapse icon
    toggleCollapse(stageId, stageIndex: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        const stage = this.state.form[key].find((s) => s.id == stageId)
        if (stage.name.length && stage.script.length) {
            const { form } = { ...this.state }
            const stages = this.state.form[key]
            stages[stageIndex].isCollapsed = !stages[stageIndex].isCollapsed
            form[key] = stages
            this.setState({ form })
        } else {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Fill the required fields or cancel changes',
            })
        }
    }

    deletePipeline() {
        deleteCIPipeline(
            this.state.form,
            this.state.ciPipeline,
            this.state.form.materials,
            +this.props.match.params.appId,
            +this.props.match.params.workflowId,
            this.state.ciPipeline.isExternal,
            this.state.form.webhookConditionList,
        )
            .then((response) => {
                if (response) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Pipeline Deleted',
                    })
                    this.setState({ loadingData: false })
                    this.props.close()

                    if (this.props.deleteWorkflow) {
                        this.props.deleteWorkflow(this.props.match.params.appId, +this.props.match.params.workflowId)
                    } else {
                        this.props.getWorkflows()
                    }
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({ loadingData: false })
            })
    }

    closeCIDeleteModal() {
        this.setState({ showDeleteModal: false })
    }

    renderInfoDialog() {
        return (
            <div className="dc__info-container info__container--linked-ci mb-16">
                <Info />
                <div className="flex column left">
                    <div className="dc__info-title">Configurations(Read Only)</div>
                    <div className="dc__info-subtitle">
                        You cannot edit a linked Pipeline. To make changes edit the source Pipeline.
                        <Link to={this.state.sourcePipelineURL} target="_blank" className="ml-5">
                            View Source Pipeline
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    renderTriggerType() {
        return (
            <div className="form__row">
                <label className="form__label form__label--sentence dc__required-field">
                    When do you want the pipeline to execute?
                </label>
                <RadioGroup value={this.state.form.triggerType} name="trigger-type" onChange={() => {}} disabled>
                    <RadioGroupItem value={TriggerType.Auto}> Automatic </RadioGroupItem>
                    <RadioGroupItem value={TriggerType.Manual}> Manual </RadioGroupItem>
                </RadioGroup>
            </div>
        )
    }

    renderDeleteCIModal() {
        if (this.props.match.params.ciPipelineId && this.state.showDeleteModal) {
            return (
                <DeleteDialog
                    title={`Delete '${this.state.form.name}' ?`}
                    description={`Are you sure you want to delete this CI Pipeline from '${this.props.appName}' ?`}
                    closeDelete={this.closeCIDeleteModal}
                    delete={this.deletePipeline}
                />
            )
        }
        return null
    }

    renderMaterials() {
        return (
            <SourceMaterials
                materials={this.state.form.materials}
                showError={this.state.showError}
                includeWebhookEvents={false}
                ciPipelineSourceTypeOptions={this.state.form.ciPipelineSourceTypeOptions}
                canEditPipeline
            />
        )
    }

    renderHeader() {
        return (
            <>
                <div className="flex left pt-15 pb-15 pl-20 pr-20">
                    <h2 className="fs-16 fw-6 m-0">Linked build pipeline</h2>
                    <button type="button" className="dc__transparent ml-auto" onClick={() => this.props.close()}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <hr className="divider mt-0" />
            </>
        )
    }

    renderSecondaryButtton() {
        if (this.props.match.params.ciPipelineId) {
            const canDeletePipeline = this.props.connectCDPipelines === 0 && this.state.ciPipeline.linkedCount === 0
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
                    <button
                        type="button"
                        className="cta cta--workflow delete mr-16"
                        disabled={!canDeletePipeline}
                        onClick={() => {
                            this.setState({ showDeleteModal: true })
                        }}
                        data-testid="delete-linked-pipeline"
                    >
                        Delete Pipeline
                    </button>
                </ConditionalWrap>
            )
        }
    }

    renderCIPipelineBody() {
        if (this.state.view == ViewType.LOADING) {
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
                        disabled={!!this.state.ciPipeline.id}
                        placeholder="Name"
                        value={this.state.ciPipeline.name}
                        onChange={noop}
                        isRequiredField
                    />
                </label>
                {this.renderTriggerType()}
                {this.renderMaterials()}
                {this.renderDeleteCIModal()}
            </>
        )
    }

    render() {
        return (
            <VisibleModal className="">
                <div className="modal__body p-0 br-0 modal__body--ci">
                    {this.renderHeader()}
                    <div className="pl-20 pr-20 pb-20">
                        {this.renderInfoDialog()}
                        {this.renderCIPipelineBody()}
                    </div>
                    {this.state.view !== ViewType.LOADING && (
                        <div className="ci-button-container bg__primary pt-12 pb-12 pl-20 pr-20 flex flex-justify">
                            {this.renderSecondaryButtton()}
                            <Link
                                to={this.state.sourcePipelineURL}
                                target="_blank"
                                className="cta cta--workflow flex flex-1 dc__no-decor"
                            >
                                {this.state.form.isOffendingMandatoryPlugin && (
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
}
