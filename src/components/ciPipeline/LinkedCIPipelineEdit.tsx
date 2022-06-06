import React, { Component } from 'react'
import { saveLinkedCIPipeline } from './ciPipeline.service'
import { ViewType } from '../../config'
import { ServerErrors } from '../../modals/commonTypes'
import { CIPipelineProps, LinkedCIPipelineState } from './types'
import {
    Progressing,
    Typeahead,
    TypeaheadOption,
    TypeaheadErrorOption,
    showError,
    VisibleModal,
    multiSelectStyles,
} from '../common'
import { toast } from 'react-toastify'
import { ValidationRules } from './validationRules'
import { ButtonWithLoader } from '../common/formFields/ButtonWithLoader'
import { Info } from '../common/icons/Icons'
import { getAppListMin, getCIConfig } from '../../services/service'
import error from '../../assets/icons/misc/errorInfo.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import './ciPipeline.css'
import { appListOptions, noOptionsMessage } from '../AppSelector/AppSelectorUtil'
import AsyncSelect from 'react-select/async'

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
    }

    selectApp({ value }): void {
        let { form, isValid } = { ...this.state }
        form.parentAppId = value
        form.parentCIPipelineId = 0
        isValid.parentAppId = true
        isValid.parentCIPipelineId = false
        this.setState({ form, isValid, loadingPipelines: true }, () => {
            getCIConfig(this.state.form.parentAppId)
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
        let { form, isValid } = { ...this.state }
        form.name = event.target.value
        let isFound = !!this.state.ciPipelines.find((pipeline) => pipeline.name === form.name)
        isValid.name = +this.props.match.params.appId === this.state.form.parentAppId ? !isFound : true
        this.setState({ form, isValid })
    }

    selectPipeline(pipelines): void {
        let pipeline = pipelines[0]
        let { form, isValid } = { ...this.state }
        form.parentCIPipelineId = pipeline.id
        form.name = pipelines[0].name
        isValid.parentCIPipelineId = true
        isValid.name = !(+this.props.match.params.appId === this.state.form.parentAppId)
        this.setState({ form, isValid })
    }

    savePipeline() {
        if (!(this.state.isValid.parentCIPipelineId && this.state.isValid.parentCIPipelineId)) {
            this.setState({ showError: true })
            return
        }
        this.setState({ loadingData: true })
        let parentCIPipeline = this.state.ciPipelines.find((ci) => ci.id === this.state.form.parentCIPipelineId)
        let params = {
            appId: +this.props.match.params.appId,
            workflowId: +this.props.match.params.workflowId,
            name: this.state.form.name,
        }
        saveLinkedCIPipeline(parentCIPipeline, params)
            .then((response) => {
                if (response) {
                    toast.success('Saved Successfully ')
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
            ...base,
            cursor: 'pointer',
        }),
        menu: (base, state) => ({
            ...base,
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
    }

    renderHeader() {
        return (
            <div className="p-20 flex flex-align-center flex-justify">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">Create linked build pipeline</h2>
                <button
                    type="button"
                    className="transparent flex icon-dim-24"
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
            <div className="info__container fs-13 pt-12 pb-12 pl-16 pr-16 info__container--linked-ci">
                <Info className="icon-dim-20" />
                <div className="flex column left">
                    <div className="info__title">
                        Info: &nbsp;
                        <span className="info__subtitle">
                            Use Linked CI Pipelines to refer to an existing CI Pipeline.
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    renderCIPipelinesDropdown(app) {
        let pipeline = this.state.ciPipelines.find((pipeline) => pipeline.id === this.state.form.parentCIPipelineId)
        return (
            <div className={`typeahead form__row`}>
                <Typeahead
                    labelKey={'name'}
                    name="source-ci-pipeline"
                    label={'Source CI pipeline'}
                    disabled={false}
                    onChange={(event) => {
                        this.selectPipeline(event)
                    }}
                    multi={false}
                    defaultSelections={pipeline ? [pipeline] : []}
                >
                    {this.state.ciPipelines.map((ci) => {
                        return (
                            <TypeaheadOption key={ci.id} id={ci.id} item={ci}>
                                {ci.name}
                            </TypeaheadOption>
                        )
                    })}
                    {(() => {
                        if (this.state.loadingPipelines)
                            return (
                                <TypeaheadErrorOption className="typeahead__menu-item--blur">
                                    Loading...{' '}
                                </TypeaheadErrorOption>
                            )
                        else if (this.state.ciPipelines.length === 0 && !app)
                            return (
                                <TypeaheadErrorOption className="typeahead__menu-item--blur">
                                    Please select an app to view available pipelines{' '}
                                </TypeaheadErrorOption>
                            )
                        else if (this.state.ciPipelines.length === 0)
                            return (
                                <TypeaheadErrorOption className="typeahead__menu-item--blur">
                                    No CI pipelines found{' '}
                                </TypeaheadErrorOption>
                            )
                    })()}
                </Typeahead>
                {this.state.showError && !this.state.isValid.parentCIPipelineId ? (
                    <span className="form__error">
                        <img src={error} alt="" className="form__icon" />
                        This is a required Field
                    </span>
                ) : null}
            </div>
        )
    }

    renderCIPipelineBody() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div style={{ minHeight: '250px' }} className="flex">
                    <Progressing pageLoader />
                </div>
            )
        } else {
            return (
                <>
                    <div className="typeahead form__row">
                        <span className="form__label">Filter By Application</span>
                        <AsyncSelect
                            loadOptions={appListOptions}
                            noOptionsMessage={noOptionsMessage}
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
                            <span className="form__label">Name*</span>
                            <input
                                className="form__input"
                                placeholder="Enter pipeline name"
                                type="text"
                                value={this.state.form.name}
                                onChange={this.handleName}
                            />
                            {!this.state.isValid.name ? (
                                <span className="form__error">
                                    <img src={error} alt="" className="form__icon" />
                                    You cannot use same name for pipeline within an app.
                                </span>
                            ) : null}
                        </label>
                    ) : null}
                </>
            )
        }
    }

    render() {
        return (
            <VisibleModal className="">
                <div className="modal__body modal__body--ci br-0 modal__body--p-0">
                    {this.renderHeader()}
                    <hr className="divider m-0" />
                    <div className="pl-20 pr-20 pt-20">
                        {this.renderInfoDialog()}
                        {this.renderCIPipelineBody()}
                    </div>
                    {this.state.view !== ViewType.LOADING && (
                        <div className="ci-button-container bcn-0 pt-12 pb-12 pl-20 pr-20 flex flex-justify">
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
                                rootClassName="cta cta--workflow flex-1"
                                loaderColor="white"
                                onClick={this.savePipeline}
                                isLoading={this.state.loadingData}
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
