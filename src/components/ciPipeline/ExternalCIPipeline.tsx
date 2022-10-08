import React, { Component } from 'react';
import { getInitDataWithCIPipeline, saveCIPipeline, deleteCIPipeline, getPipelineMetaConfiguration } from './ciPipeline.service';
import { SourceTypeMap, TriggerType, ViewType } from '../../config';
import { ServerErrors } from '../../modals/commonTypes';
import { CIPipelineProps, ExternalCIPipelineState } from './types';
import { Progressing,  CopyButton, showError, ConditionalWrap, DeleteDialog, VisibleModal } from '../common';
import { toast } from 'react-toastify';
import error from '../../assets/icons/misc/errorInfo.svg'
import Tippy from '@tippyjs/react';
import { ValidationRules } from './validationRules';
import { ButtonWithLoader } from '../common';
import { NavLink } from 'react-router-dom';
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg';
import { getHostURLConfiguration } from '../../services/service';
import { URLS } from '../../config';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { SourceMaterials } from './SourceMaterials';
import './ciPipeline.css';


export default class ExternalCIPipeline extends Component<CIPipelineProps, ExternalCIPipelineState> {
    validationRules;
    urlRef;
    payloadRef;

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            showError: false,
            form: {
                name: "",
                args: [{ key: "", value: "" }],
                materials: [],
                triggerType: TriggerType.Auto,
                externalCiConfig: "",
                ciPipelineSourceTypeOptions: []
            },
            ciPipeline: {
                active: true,
                ciMaterial: [],
                dockerArgs: {},
                externalCiConfig: {
                    id: 0,
                    accessKey: "",
                    payload: "",
                    webhookUrl: "",
                },
                id: 0,
                isExternal: true,
                isManual: false,
                name: "",
                linkedCount: 0,
            },
            gitMaterials: [],
            showDeleteModal: false,
            showDockerArgs: false,
            loadingData: true,
            hostURLConfig: undefined,
        }
        this.handlePipelineName = this.handlePipelineName.bind(this);
        this.savePipeline = this.savePipeline.bind(this);
        this.selectSourceType = this.selectSourceType.bind(this);
        this.deletePipeline = this.deletePipeline.bind(this);
        this.closeCIDeleteModal = this.closeCIDeleteModal.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.validationRules = new ValidationRules();
        this.handleSourceChange = this.handleSourceChange.bind(this);
        this.escFunction = this.escFunction.bind(this);
    }

    componentDidMount() {
        this.getHostURLConfig();
        if (this.props.match.params.ciPipelineId) {
             document.addEventListener("keydown", this.escFunction);
            getInitDataWithCIPipeline(this.props.match.params.appId, this.props.match.params.ciPipelineId).then((response) => {
                this.setState({ ...response });
            }).catch((error: ServerErrors) => {
                this.setState({ loadingData: false });
                showError(error);
            })
        }
        else {
            getPipelineMetaConfiguration(this.props.match.params.appId).then((response) => {
                this.setState({
                    view: ViewType.FORM,
                    form: {
                        ...this.state.form,
                        materials: response.result.materials,
                        ciPipelineSourceTypeOptions: response.result.ciPipelineSourceTypeOptions.filter((_option) => _option.value !== SourceTypeMap.BranchRegex)
                    },
                    gitMaterials: response.result.gitMaterials,
                    loadingData: false,
                });
            })
        }
    }

  componentWillUnmount() {
      document.removeEventListener('keydown', this.escFunction)
    }

  escFunction(event) {
    if ((event.keyCode === 27 || event.key === 'Escape') && typeof this.props.close === 'function') {
        this.props.close()
    }
  }

    getHostURLConfig() {
        getHostURLConfiguration().then((response) => {
            this.setState({ hostURLConfig: response.result, })
        }).catch((error) => {

        })
    }

    handlePipelineName(event): void {
        let state = { ...this.state };
        state.form.name = event.target.value;
        this.setState(state);
    }

    selectSourceType(event, gitMaterialId: number): void {
        let { form } = { ...this.state };
        let allMaterials = this.state.form.materials.map((mat) => {
            return {
                ...mat,
                type: (gitMaterialId === mat.gitMaterialId) ? event.value : mat.type,
            }
        })
        form.materials = allMaterials;
        this.setState({ form });
    }

    handleSourceChange(event, gitMaterialId: number): void {
        let { form } = { ...this.state };
        let allMaterials = form.materials.map((mat) => {
            if (mat.gitMaterialId === gitMaterialId) {
                return {
                    ...mat,
                    value: event.target.value
                }
            }
            else return mat;
        })
        form.materials = allMaterials;
        this.setState({ form });
    }

    copyToClipboard(ref: 'urlRef' | 'payloadRef') {
        this[ref].disabled = false;
        this[ref].select();
        document.execCommand("copy");
        this[ref].disabled = true;
    }

    savePipeline() {
        this.setState({ showError: true, loadingData: true });
        let errObj = this.validationRules.name(this.state.form.name);
        let self = this;
        let valid = this.state.form.materials.reduce((isValid, mat) => {
            isValid = isValid && self.validationRules.sourceValue(mat.value).isValid;
            return isValid;
        }, true);
        valid = valid && errObj.isValid;
        if (!valid) {
            this.setState({ loadingData: false })
            toast.error("Some Required Fields are missing");
            return;
        }
        let msg = this.state.ciPipeline.id ? 'Pipeline Updated' : 'Pipeline Created';
        saveCIPipeline(this.state.form, this.state.ciPipeline, this.state.form.materials, +this.props.match.params.appId, +this.props.match.params.workflowId,
            true, undefined, this.state.form.ciPipelineSourceTypeOptions).then((response) => {
            if (response) {
                toast.success(msg);
                let state = { ...this.state };
                this.setState({
                    ...state,
                    ...response,
                    loadingData: false
                });
            }
            this.props.getWorkflows();
            if (!this.props.match.params.ciPipelineId) {
                let url = `external-ci/${response.ciPipeline.id}`;
                this.props.history.push(url);
            }
        }).catch((errors: ServerErrors) => {
            this.setState({ loadingData: false });
            showError(errors)
        })
    }

    deletePipeline() {
        deleteCIPipeline(this.state.form, this.state.ciPipeline, this.state.gitMaterials, +this.props.match.params.appId, +this.props.match.params.workflowId, true, undefined).then((response) => {
            if (response) {
                toast.success("Pipeline Deleted");
                this.props.close();

                if (this.props.deleteWorkflow) {
                    this.props.deleteWorkflow(this.props.match.params.appId, +this.props.match.params.workflowId)
                } else {
                    this.props.getWorkflows()
                }
            }
        }).catch((error: ServerErrors) => {
            this.setState({ loadingData: false });
            if (Array.isArray(error.errors)) {
                error.errors.map((err) => toast.error(err.userMessage))
            }
        })
    }

    closeCIDeleteModal() {
        this.setState({ showDeleteModal: false });
    }

    removeDockerArgs(index: number) {
        let newArgs = [];
        for (let i = 0; i < this.state.form.args.length; i++) {
            if (index !== i) newArgs.push(this.state.form.args[i]);
        }
        let { form } = { ...this.state };
        form.args = newArgs;
        this.setState({ form });
    }


    renderDeleteCIModal() {
        if (this.props.match.params.ciPipelineId && this.state.showDeleteModal) {
            return <DeleteDialog title={`Delete '${this.state.form.name}' ?`}
                description={`Are you sure you want to delete this CI Pipeline from '${this.props.appName}' ?`}
                closeDelete={this.closeCIDeleteModal}
                delete={this.deletePipeline} />
        }
        return null;
    }

    renderMaterials() {
        return <SourceMaterials showError={this.state.showError}
            validationRules={this.validationRules}
            materials={this.state.form.materials}
            selectSourceType={this.selectSourceType}
            handleSourceChange={this.handleSourceChange}
            includeWebhookEvents={false}
            ciPipelineSourceTypeOptions={this.state.form.ciPipelineSourceTypeOptions}
            canEditPipeline={true}
        />
    }

    renderHeader() {
        return <>
            <div className="p-20 flex flex-align-center flex-justify">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">Create external build pipeline</h2>
                <button type="button" className="dc__transparent flex icon-dim-24" onClick={() => {
                              this.props.close();
                          }}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
            <hr className="divider m-0" />
        </>
    }

    renderDeleteCIButton() {
        if (this.props.match.params.ciPipelineId) {
            let canDeletePipeline = this.props.connectCDPipelines === 0 && this.state.ciPipeline.linkedCount === 0;
            let message = this.props.connectCDPipelines > 0 ? "This Pipeline cannot be deleted as it has connected CD pipeline" : "This pipeline has linked CI pipelines";
            return <ConditionalWrap condition={!canDeletePipeline}
                wrap={children => <Tippy className="default-tt"
                    content={message}>
                    <div>{children}</div>
                </Tippy>}>
                <button type="button"
                    className={`cta cta--workflow delete mr-16`}
                    disabled={!canDeletePipeline}
                    onClick={() => { this.setState({ showDeleteModal: true }) }}>
                    Delete Pipeline
                </button>
            </ConditionalWrap>
        }
    }

    renderExternalCIConfig() {
        if (this.props.match.params.ciPipelineId) {
            // let url = `${this.state.ciPipeline.externalCiConfig.webhookUrl}/${this.state.ciPipeline.externalCiConfig.accessKey}`;
            return <div className="ext-ci-config">
                <p className="ext-ci-config__title">Copy and paste the below incoming url in your CI service.</p>
                <div className="ext-ci-config__description">
                    Devtron will automatically receive the build image everytime the CI service is triggered
                </div>
                <label className="form__row">
                    <span className="form__label">Payload Format</span>
                    <textarea ref={node => this.payloadRef = node} className="form__input form__input--textarea" disabled={true}
                        value={(this.state.form.externalCiConfig)} />
                    <CopyButton rootClassName="copy-button--ext-ci" onClick={(e) => this.copyToClipboard('payloadRef')} />
                </label>
                <label className="form__row">
                    <span className="form__label">Webhook URL</span>
                    <input type="text" ref={node => this.urlRef = node} className="form__input" disabled={true} value={`${this.state.ciPipeline.externalCiConfig.webhookUrl}/${this.state.ciPipeline.externalCiConfig.accessKey}`} />
                    <CopyButton rootClassName="copy-button--ext-ci" onClick={(e) => this.copyToClipboard('urlRef')} />
                </label>
            </div>
        }
    }

    renderHostErrorMessage() {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
            return <div className="br-4 bw-1 er-2 pt-10 mt-20 pb-10 pl-16 pr-16 bcr-1 flex left">
                <Error className="icon-dim-20 mr-8" />
                <div className="cn-9 fs-13">Host url is not configured or is incorrect. Reach out to your DevOps team (super-admin) to &nbsp;
                <NavLink className="dc__link-bold" to={URLS.GLOBAL_CONFIG_HOST_URL}>Review and update</NavLink>
                </div>
            </div>
        }
    }

    render() {
        let errorObj = this.validationRules.name(this.state.form.name);
        if (this.state.view === ViewType.LOADING) {
            return <VisibleModal className="">
                <div className="modal__body modal__body--ci br-0 modal__body--p-0">
                    {this.renderHeader()}
                    <div style={{minHeight: "385px"}} className="flex"><Progressing pageLoader /></div>
                </div>
            </VisibleModal>
        }
        else {
            return <VisibleModal className="" >
                <div className="modal__body modal__body--ci br-0 modal__body--p-0">
                    {this.renderHeader()}
                    <div className="pl-20 pr-20">
                        {this.renderHostErrorMessage()}
                        <div className="form__row">
                            <span className="form__label  mt-16">Pipeline Name*</span>
                            <input className="form__input" disabled={!!this.state.ciPipeline.id} placeholder="Name" type="text" value={this.state.form.name}
                                onChange={this.handlePipelineName} />
                            {this.state.showError && !errorObj.isValid ? <span className="form__error">
                                <img src={error} alt="" className="form__icon" />
                                {this.validationRules.name(this.state.form.name).message}
                            </span> : null}
                        </div>
                        {this.renderMaterials()}
                    </div>
                    <div className="ci-button-container bcn-0 mt-20 pt-12 pb-12 pl-20 pr-20 flex flex-justify">
                        {this.renderDeleteCIButton()}
                        <ButtonWithLoader rootClassName="cta cta--workflow flex flex-1"
                            loaderColor="white"
                            onClick={this.savePipeline}
                            // disabled={!!this.props.match.params.ciPipelineId}
                            isLoading={this.state.loadingData}>
                            Save and Generate URL
                        </ButtonWithLoader>
                    </div>
                    {this.renderExternalCIConfig()}
                </div>
                {this.renderDeleteCIModal()}
            </VisibleModal  >
        }
    }
}