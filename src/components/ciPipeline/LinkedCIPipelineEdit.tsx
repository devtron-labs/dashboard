import React, { Component } from 'react';
import { saveLinkedCIPipeline } from './ciPipeline.service';
import { ViewType } from '../../config';
import { ServerErrors } from '../../modals/commonTypes';
import { CIPipelineProps, LinkedCIPipelineState } from './types';
import { Progressing, OpaqueModal, Typeahead, TypeaheadOption, TypeaheadErrorOption, showError } from '../common';
import { toast } from 'react-toastify';
import { ValidationRules } from './validationRules';
import { ButtonWithLoader } from '../common/formFields/ButtonWithLoader';
import { Info } from '../common/icons/Icons'
import { getAppListMin, getCIConfig } from '../../services/service';
import error from '../../assets/icons/misc/errorInfo.svg'
import './ciPipeline.css';

export default class LinkedCIPipeline extends Component<CIPipelineProps, LinkedCIPipelineState> {
    validationRules;
    urlRef;
    payloadRef;

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            showError: false,
            ciPipelines: [],
            apps: [],
            loadingData: false,
            loadingPipelines: false,
            form: {
                parentAppId: 0,
                parentCIPipelineId: 0,
                name: "",
            },
            isValid: {
                parentAppId: false,
                parentCIPipelineId: false,
                name: false,
            },
        }
        this.savePipeline = this.savePipeline.bind(this);
        this.selectPipeline = this.selectPipeline.bind(this);
        this.selectApp = this.selectApp.bind(this);
        this.handleName = this.handleName.bind(this);
        this.validationRules = new ValidationRules();
    }

    componentDidMount() {
        getAppListMin().then((response) => {
            this.setState({ apps: response.result, view: ViewType.FORM });
        }).catch((errors: ServerErrors) => {
            showError(errors);
        })
    }

    selectApp(selections): void {
        let { form, isValid } = { ...this.state };
        form.parentAppId = selections[0].id;
        form.parentCIPipelineId = 0;
        isValid.parentAppId = true;
        isValid.parentCIPipelineId = false;
        this.setState({ form, isValid, loadingPipelines: true }, () => {
            getCIConfig(this.state.form.parentAppId).then((response) => {
                let pipelines = response.result && response.result.ciPipelines ? response.result.ciPipelines : [];
                pipelines = pipelines.filter(n => n.parentCiPipeline === 0 || n.parentCiPipeline === undefined || n.parentCiPipeline === null);
                this.setState({ ciPipelines: pipelines, loadingPipelines: false });
            }).catch((errors: ServerErrors) => {
                showError(errors);
            })
        });
    }
    
    handleName(event): void {
        let { form, isValid } = { ...this.state };
        form.name = event.target.value;
        let isFound = !!this.state.ciPipelines.find(pipeline => pipeline.name === form.name);
        isValid.name = (+this.props.match.params.appId === this.state.form.parentAppId) ? !isFound : true;
        this.setState({ form, isValid });
    }

    selectPipeline(pipelines): void {
        let pipeline = pipelines[0];
        let { form, isValid } = { ...this.state };
        form.parentCIPipelineId = pipeline.id;
        form.name = pipelines[0].name;
        isValid.parentCIPipelineId = true;
        isValid.name = !(+this.props.match.params.appId === this.state.form.parentAppId);
        this.setState({ form, isValid });
    }

    savePipeline() {
        if (!(this.state.isValid.parentCIPipelineId && this.state.isValid.parentCIPipelineId)) {
            this.setState({ showError: true });
            return;
        }
        this.setState({ loadingData: true });
        let parentCIPipeline = this.state.ciPipelines.find((ci) => ci.id === this.state.form.parentCIPipelineId);
        let params = {
            appId: +this.props.match.params.appId,
            workflowId: +this.props.match.params.workflowId,
            name: this.state.form.name,
        }
        saveLinkedCIPipeline(parentCIPipeline, params).then((response) => {
            if (response) {
                toast.success("Saved Successfully ");
                this.setState({ loadingData: false, showError: false });
                this.props.close();
                this.props.getWorkflows();
            }
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ loadingData: false, showError: false })
        })
    }

    renderHeader() {
        return <>
            <h1 className="form__title">Linked CI Pipeline</h1>
            <p className="form__subtitle"></p>
        </>
    }

    renderInfoDialog() {
        return <div className="info__container info__container--linked-ci">
            <Info />
            <div className="flex column left">
                <div className="info__title">Info</div>
                <div className="info__subtitle">Use Linked CI Pipelines to refer to an existing CI Pipeline.
                    {/* <a href="https://docs.devtron.ai/docs/deployment-template/" target="_blank" className="ml-5">Learn More about</a> */}
                </div>
            </div>
        </div>
    }

    renderCIPipelinesDropdown(app) {
        let pipeline = this.state.ciPipelines.find((pipeline) => pipeline.id === this.state.form.parentCIPipelineId);
        return <div className={`typeahead form__row`}>
            <Typeahead labelKey={'name'} name='source-ci-pipeline' label={'Source CI pipeline'} disabled={false}
                onChange={(event) => { this.selectPipeline(event) }} multi={false} defaultSelections={pipeline ? [pipeline] : []} >
                {this.state.ciPipelines.map((ci) => {
                    return <TypeaheadOption key={ci.id} id={ci.id} item={ci}>{ci.name}</TypeaheadOption>
                })}
                {(() => {
                    if (this.state.loadingPipelines) return <TypeaheadErrorOption className="typeahead__menu-item--blur">Loading... </TypeaheadErrorOption>
                    else if (this.state.ciPipelines.length === 0 && !app) return <TypeaheadErrorOption className="typeahead__menu-item--blur">Please select an app to view available pipelines </TypeaheadErrorOption>
                    else if (this.state.ciPipelines.length === 0) return <TypeaheadErrorOption className="typeahead__menu-item--blur">No CI pipelines found </TypeaheadErrorOption>
                })()}
            </Typeahead>
            {(this.state.showError && !this.state.isValid.parentCIPipelineId) ? <span className="form__error">
                <img src={error} alt="" className="form__icon" />
                This is a required Field
        </span> : null}
        </div>
    }

    render() {
        let app = this.state.apps.find((app) => app.id === this.state.form.parentAppId);
        if (this.state.view === ViewType.LOADING) {
            return <OpaqueModal onHide={this.props.close}>
                <Progressing pageLoader />
            </OpaqueModal>
        }
        else {
            return <OpaqueModal onHide={this.props.close}>
                <div className="modal__body modal__body--ci">
                    {this.renderHeader()}
                    {this.renderInfoDialog()}
                    <div className="typeahead form__row">
                        <Typeahead labelKey={'name'} name='app' label={'Filter By Application'} disabled={false}
                            onChange={(event) => { this.selectApp(event) }} multi={false} defaultSelections={app ? [app] : []} >
                            {this.state.apps.map((app) => {
                                return <TypeaheadOption key={app.id} id={app.id} item={app}>{app.name}</TypeaheadOption>
                            })}
                        </Typeahead>
                        {(this.state.showError && !this.state.isValid.parentAppId) ? <span className="form__error">
                            <img src={error} alt="" className="form__icon" />
                            This is a required Field
                        </span> : null}
                    </div>
                    {this.renderCIPipelinesDropdown(app)}
                    {this.state.form.parentCIPipelineId
                        ? <label className="form__row">
                            <span className="form__label">Name*</span>
                            <input className="form__input" placeholder="Enter pipeline name" type="text" value={this.state.form.name} onChange={this.handleName} />
                            {(!this.state.isValid.name) ? <span className="form__error">
                                <img src={error} alt="" className="form__icon" />
                                You cannot use same name for pipeline within an app.
                        </span> : null}
                        </label>
                        : null}
                    <div className="form__row form__row--flex">
                        <ButtonWithLoader rootClassName="cta flex-1" loaderColor="white"
                            onClick={this.savePipeline}
                            isLoading={this.state.loadingData}>
                            Create Linked CI Pipeline
                        </ButtonWithLoader>
                    </div>
                </div>
            </OpaqueModal >
        }
    }
}