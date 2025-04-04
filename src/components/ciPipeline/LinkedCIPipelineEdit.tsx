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

import { Component } from 'react'
import {
    ServerErrors,
    VisibleModal,
    showError,
    Progressing,
    multiSelectStyles,
    CustomInput,
    ButtonWithLoader,
    ToastManager,
    ToastVariantType,
    AppSelectorNoOptionsMessage
} from '@devtron-labs/devtron-fe-common-lib'
import AsyncSelect from 'react-select/async'
import { saveLinkedCIPipeline } from './ciPipeline.service'
import { ViewType } from '../../config'
import { CIPipelineBuildType, CIPipelineProps, LinkedCIPipelineState } from './types'
import { Typeahead, TypeaheadOption, TypeaheadErrorOption } from '../common'
import { ValidationRules } from './validationRules'
import { Info } from '../common/icons/Icons'
import { getCIConfig } from '../../services/service'
import error from '../../assets/icons/misc/errorInfo.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import './ciPipeline.scss'
import { appListOptions } from '../AppSelector/AppSelectorUtil'
import { ReactComponent as Warning } from '../../assets/icons/ic-warning.svg'
import { DUPLICATE_PIPELINE_NAME_VALIDATION, REQUIRED_FIELD_MSG } from '../../config/constantMessaging'

export default class LinkedCIPipeline extends Component<CIPipelineProps, LinkedCIPipelineState> {
    validationRules

    urlRef

    payloadRef

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.FORM,
            showError: false,
            ciPipelines: [],
            loadingData: false,
            loadingPipelines: false,
            showPluginWarning: false,
            form: {
                parentAppId: 0,
                parentCIPipelineId: 0,
                name: '',
            },
            isValid: {
                parentAppId: false,
                parentCIPipelineId: false,
                name: false,
            },
        }
        this.savePipeline = this.savePipeline.bind(this)
        this.selectPipeline = this.selectPipeline.bind(this)
        this.selectApp = this.selectApp.bind(this)
        this.handleName = this.handleName.bind(this)
        this.validationRules = new ValidationRules()
        this.escFunction = this.escFunction.bind(this)
    }

    componentDidMount() {
        document.addEventListener('keydown', this.escFunction)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escFunction)
    }

    escFunction(event) {
        if (event.keyCode === 27 || event.key === 'Escape') {
            this.props.close()
        }
    }

    getIsChangingToSamePipeline = () =>
        this.props.changeCIPayload?.switchFromCiPipelineId &&
        this.state.form.parentCIPipelineId === this.props.changeCIPayload.switchFromCiPipelineId

    selectApp({ value }): void {
        const { form, isValid } = { ...this.state }
        form.parentAppId = value
        form.parentCIPipelineId = 0
        isValid.parentAppId = true
        isValid.parentCIPipelineId = false
        this.setState({ form, isValid, loadingPipelines: true }, () => {
            // Explicitly setting isTemplateView false to use the pipelines from app
            getCIConfig(this.state.form.parentAppId, false)
                .then((response) => {
                    let pipelines = response.result && response.result.ciPipelines ? response.result.ciPipelines : []
                    pipelines = pipelines.filter(
                        (n) =>
                            n.parentCiPipeline === 0 || n.parentCiPipeline === undefined || n.parentCiPipeline === null,
                    )
                    this.setState({ ciPipelines: pipelines, loadingPipelines: false })
                })
                .catch((errors: ServerErrors) => {
                    showError(errors)
                })
        })
    }

    handleName(event): void {
        const { form, isValid } = { ...this.state }
        form.name = event.target.value
        const isFound = !!this.state.ciPipelines.find((pipeline) => pipeline.name === form.name)
        isValid.name = +this.props.match.params.appId === this.state.form.parentAppId ? !isFound : true
        this.setState({ form, isValid })
    }

    selectPipeline(pipelines): void {
        const pipeline = pipelines[0]
        const { form, isValid } = { ...this.state }
        form.parentCIPipelineId = pipeline.id
        form.name = pipelines[0].name
        isValid.parentCIPipelineId = true
        isValid.name = !(+this.props.match.params.appId === this.state.form.parentAppId)
        this.setState({ form, isValid, showPluginWarning: pipeline.isOffendingMandatoryPlugin })
    }

    savePipeline() {
        if (!(this.state.isValid.parentCIPipelineId && this.state.isValid.parentCIPipelineId)) {
            this.setState({ showError: true })
            return
        }
        this.setState({ loadingData: true })
        const parentCIPipeline = this.state.ciPipelines.find((ci) => ci.id === this.state.form.parentCIPipelineId)
        parentCIPipeline.pipelineType = CIPipelineBuildType.CI_LINKED
        const params = {
            appId: +this.props.match.params.appId,
            workflowId: +this.props.match.params.workflowId,
            name: this.state.form.name,
            isTemplateView: this.props.isTemplateView,
        }
        saveLinkedCIPipeline(parentCIPipeline, params, this.props.changeCIPayload)
            .then((response) => {
                if (response) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Saved Successfully',
                    })
                    this.setState({ loadingData: false, showError: false })
                    this.props.close()
                    this.props.getWorkflows()
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                this.setState({ loadingData: false, showError: false })
            })
    }

    _multiSelectStyles = {
        ...multiSelectStyles,
        control: (base, state) => ({
            ...multiSelectStyles.control(base, state),
            cursor: 'pointer',
        }),
        menu: (base, state) => ({
            ...multiSelectStyles.menu(base, state),
            marginTop: 'auto',
            zIndex: 4,
        }),
        menuList: (base) => {
            return {
                ...base,
                position: 'relative',
                paddingBottom: '0px',
                maxHeight: '180px',
            }
        },
        valueContainer: (base, state) => ({
            ...multiSelectStyles.valueContainer(base, state),
            color: 'var(--N900)',
            background: state.isDisabled ? 'var(--N100) !important' : 'var(--N50) !important',
        }),
        indicatorsContainer: (base, state) => ({
            ...base,
            background: state.isDisabled ? 'var(--N100) !important' : 'var(--N50) !important',
        }),
    }

    renderHeader() {
        return (
            <div className="p-20 flex flex-align-center flex-justify">
                <h2 className="fs-16 fw-6 lh-1-43 m-0" data-testid="create-linked-build-pipeline">
                    Create linked build pipeline
                </h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    onClick={() => {
                        this.props.close()
                    }}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    renderInfoDialog() {
        return (
            <div className="dc__info-container mb-16 fs-13 pt-12 pb-12 pl-16 pr-16 info__container--linked-ci">
                <Info className="icon-dim-20" />
                <div className="flex column left">
                    <div className="dc__info-title">
                        Info: &nbsp;
                        <span className="dc__info-subtitle">
                            Use Linked CI Pipelines to refer to an existing CI Pipeline.
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    renderCIPipelinesDropdown(app) {
        const pipeline = this.state.ciPipelines.find((pipeline) => pipeline.id === this.state.form.parentCIPipelineId)
        return (
            <div className="typeahead form__row">
                <Typeahead
                    dataTestIdContainer="source-ci-pipeline-container"
                    dataTestIdInput="source-ci-pipeline-input"
                    labelKey="name"
                    name="source-ci-pipeline"
                    label="Source CI pipeline"
                    disabled={false}
                    onChange={(event) => {
                        this.selectPipeline(event)
                    }}
                    multi={false}
                    defaultSelections={pipeline ? [pipeline] : []}
                >
                    {this.state.ciPipelines.map((ci) => {
                        return (
                            <TypeaheadOption
                                dataTestIdMenuList={`source-ci-pipeline-menu-list-${ci.name}`}
                                key={ci.id}
                                id={ci.id}
                                item={ci}
                            >
                                {ci.name}
                            </TypeaheadOption>
                        )
                    })}
                    {(() => {
                        if (this.state.loadingPipelines) {
                            return (
                                <TypeaheadErrorOption className="typeahead__menu-item--blur">
                                    Loading...
                                </TypeaheadErrorOption>
                            )
                        }
                        if (this.state.ciPipelines.length === 0 && !app) {
                            return (
                                <TypeaheadErrorOption className="typeahead__menu-item--blur">
                                    Please select an app to view available pipelines
                                </TypeaheadErrorOption>
                            )
                        }
                        if (this.state.ciPipelines.length === 0) {
                            return (
                                <TypeaheadErrorOption className="typeahead__menu-item--blur">
                                    No CI pipelines found
                                </TypeaheadErrorOption>
                            )
                        }
                    })()}
                </Typeahead>
                {this.getIsChangingToSamePipeline() && (
                    <span className="flex left form__error">
                        <Warning className="icon-dim-14 mr-4 form__icon form__icon--error" />
                        Source CI Pipeline cannot belong to the same workflow
                    </span>
                )}

                {this.state.showError && !this.state.isValid.parentCIPipelineId ? (
                    <span className="form__error">
                        <img src={error} alt="" className="form__icon" />
                        This is a required Field
                    </span>
                ) : null}
                {this.state.showPluginWarning && (
                    <span className="flex left">
                        <Warning className="icon-dim-14 warning-icon-y7 mr-4" />
                        Some mandatory plugins are not configured for selected CI pipeline. CI trigger might get
                        blocked.
                    </span>
                )}
            </div>
        )
    }

    loadAppListOptions = (inputValue: string) => appListOptions({inputValue})

    getErrorMessage = () => {
        if (!this.state.form.name) {
            return REQUIRED_FIELD_MSG
        }
        if (!this.state.isValid.name) {
            return DUPLICATE_PIPELINE_NAME_VALIDATION
        }
        return ''
    }

    renderCIPipelineBody() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div style={{ minHeight: '250px' }} className="flex">
                    <Progressing pageLoader />
                </div>
            )
        }
        return (
            <>
                <div className="typeahead form__row">
                    <span className="form__label">Filter By Application</span>
                    <AsyncSelect
                        loadOptions={this.loadAppListOptions}
                        noOptionsMessage={AppSelectorNoOptionsMessage}
                        classNamePrefix="link-pipeline-filter-application"
                        onChange={this.selectApp}
                        styles={this._multiSelectStyles}
                        components={{
                            IndicatorSeparator: null,
                            LoadingIndicator: null,
                        }}
                        placeholder="Select app"
                    />
                    {this.state.showError && !this.state.isValid.parentAppId ? (
                        <span className="form__error">
                            <img src={error} alt="" className="form__icon" />
                            This is a required Field
                        </span>
                    ) : null}
                </div>
                {this.renderCIPipelinesDropdown(null)}
                {this.state.form.parentCIPipelineId ? (
                    <label className="form__row">
                        <CustomInput
                            name="name"
                            label="Name"
                            placeholder="Enter pipeline name"
                            value={this.state.form.name}
                            onChange={this.handleName}
                            data-testid="pipeline-name-for-linked"
                            required
                            error={this.getErrorMessage()}
                        />
                    </label>
                ) : null}
            </>
        )
    }

    render() {
        return (
            <VisibleModal className="">
                <div className="modal__body modal__body--ci-mt-0 modal__body--p-0 dc__no-top-radius">
                    {this.renderHeader()}
                    <hr className="divider m-0" />
                    <div className="pl-20 pr-20 pt-20">
                        {this.renderInfoDialog()}
                        {this.renderCIPipelineBody()}
                    </div>
                    {this.state.view !== ViewType.LOADING && (
                        <div className="ci-button-container pt-12 pb-12 pl-20 pr-20 flex flex-justify">
                            <button
                                type="button"
                                className="cta cta--workflow cancel mr-16"
                                onClick={() => {
                                    this.props.close()
                                }}
                            >
                                Cancel
                            </button>
                            <ButtonWithLoader
                                dataTestId="create-linked-ci-button"
                                rootClassName="cta cta--workflow flex-1"
                                onClick={this.savePipeline}
                                isLoading={this.state.loadingData}
                                disabled={this.state.loadingData || this.getIsChangingToSamePipeline()}
                            >
                                Create Linked CI Pipeline
                            </ButtonWithLoader>
                        </div>
                    )}
                </div>
            </VisibleModal>
        )
    }
}
