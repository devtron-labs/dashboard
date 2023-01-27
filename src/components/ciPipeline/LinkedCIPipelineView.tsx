import React, { Component } from 'react';
import { getInitDataWithCIPipeline, deleteCIPipeline } from './ciPipeline.service';
import { TriggerType, ViewType, URLS } from '../../config';
import { ServerErrors } from '../../modals/commonTypes';
import { CIPipelineProps, CIPipelineState } from './types';
import { Progressing, showError, getCIPipelineURL, ConditionalWrap, DeleteDialog, VisibleModal } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Info } from '../common';
import { getWorkflowList } from './../../services/service';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { SourceMaterials } from './SourceMaterials';
import Tippy from '@tippyjs/react';
import './ciPipeline.css';

export default class LinkedCIPipelineView extends Component<CIPipelineProps, CIPipelineState> {

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
                beforeDockerBuildScripts: [],
                afterDockerBuildScripts: [],
                gitHost: undefined,
                webhookEvents: [],
                ciPipelineSourceTypeOptions: [],
                webhookConditionList: [],
                ciPipelineEditable: true
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
                name: "",
                linkedCount: 0,
            },
            showDeleteModal: false,
            showDockerArgs: false,
            loadingData: true,
            sourcePipelineURL: "",
            showPreBuild: false,
            showPostBuild: false,
            showDocker: false,
        }
        this.deletePipeline = this.deletePipeline.bind(this);
        this.closeCIDeleteModal = this.closeCIDeleteModal.bind(this);
        this.escFunction = this.escFunction.bind(this)
    }

    componentDidMount() {
      document.addEventListener('keydown', this.escFunction)
      getInitDataWithCIPipeline(this.props.match.params.appId, this.props.match.params.ciPipelineId, true)
          .then((response) => {
              this.setState({ ...response, loadingData: false }, () => {
                  this.generateSourceUrl()
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
        let parentCiPipelineId = this.state.ciPipeline.parentCiPipeline;
        let { result } = await getWorkflowList(this.state.ciPipeline.parentAppId);
        let wf;
        if (result.workflows) {
            let allWorkflows = result.workflows;
            for (let i = 0; i < allWorkflows.length; i++) {
                if (allWorkflows[i].tree) {
                    wf = allWorkflows[i].tree.find(nd => nd.type === "CI_PIPELINE" && nd.componentId === parentCiPipelineId);
                }
                if (wf) break;
            }
            let url = getCIPipelineURL(this.state.ciPipeline.parentAppId.toString(), wf.appWorkflowId, parentCiPipelineId);
            this.setState({ sourcePipelineURL: `${URLS.APP}/${this.state.ciPipeline.parentAppId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${url}` });
        }
    }

    //invoked on Done, Discard, collapse icon
    toggleCollapse(stageId, stageIndex: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        let stage = this.state.form[key].find(s => s.id == stageId);
        if (stage.name.length && stage.script.length) {
            let { form } = { ...this.state };
            let stages = this.state.form[key];
            stages[stageIndex].isCollapsed = !stages[stageIndex].isCollapsed;
            form[key] = stages;
            this.setState({ form });
        }
        else {
            toast.error("Fill the required fields or cancel changes");
        }
    }

    deletePipeline() {
        deleteCIPipeline(this.state.form, this.state.ciPipeline, this.state.form.materials, +this.props.match.params.appId, +this.props.match.params.workflowId, false, this.state.form.webhookConditionList).then((response) => {
            if (response) {
                toast.success("Pipeline Deleted");
                this.setState({ loadingData: false });
                this.props.close();

                if (this.props.deleteWorkflow) {
                    this.props.deleteWorkflow(this.props.match.params.appId, +this.props.match.params.workflowId)
                } else {
                    this.props.getWorkflows()
                }
            }
        }).catch((error: ServerErrors) => {
            showError(error);
            this.setState({ loadingData: false });
        })
    }

    closeCIDeleteModal() {
        this.setState({ showDeleteModal: false });
    }

    renderInfoDialog() {
        return <div className="dc__info-container info__container--linked-ci mb-16">
            <Info />
            <div className="flex column left">
                <div className="dc__info-title">Configurations(Read Only)</div>
                <div className="dc__info-subtitle">You cannot edit a linked Pipeline. To make changes edit the source Pipeline.
                <Link to={this.state.sourcePipelineURL} target="_blank" className="ml-5">
                        View Source Pipeline
                </Link>
                </div>
            </div>
        </div>
    }

    renderTriggerType() {
        return <div className="form__row">
            <label className="form__label form__label--sentence">When do you want the pipeline to execute?*</label>
            <RadioGroup value={this.state.form.triggerType} name="trigger-type" onChange={() => { }} disabled={true}>
                <RadioGroupItem value={TriggerType.Auto}> Automatic  </RadioGroupItem>
                <RadioGroupItem value={TriggerType.Manual}>  Manual  </RadioGroupItem>
            </RadioGroup>
        </div>
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
        return <SourceMaterials materials={this.state.form.materials}
            showError={this.state.showError}
            includeWebhookEvents={false}
            ciPipelineSourceTypeOptions={this.state.form.ciPipelineSourceTypeOptions}
            canEditPipeline={true} />
    }

    renderHeader() {
        return <>
            <div className="flex left pt-15 pb-15 pl-20 pr-20">
                <h2 className="fs-16 fw-6 m-0">Linked build pipeline</h2>
                <button type="button" className="dc__transparent ml-auto" onClick={() => this.props.close()}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
            <hr className="divider mt-0" />
        </>
    }

    renderSecondaryButtton() {
        if (this.props.match.params.ciPipelineId) {
            let canDeletePipeline = this.props.connectCDPipelines === 0 && this.state.ciPipeline.linkedCount === 0;
            return <ConditionalWrap condition={!canDeletePipeline}
                wrap={children => <Tippy className="default-tt"
                    content="This Pipeline cannot be deleted as it has connected CD pipeline">
                    <div>{children}</div>
                </Tippy>}>
                <button type="button"
                    className='cta cta--workflow delete mr-16'
                    disabled={!canDeletePipeline}
                    onClick={() => { this.setState({ showDeleteModal: true }) }}>
                    Delete Pipeline
                </button>
            </ConditionalWrap>
        }
    }

    renderCIPipelineBody() {
        let l = this.state.ciPipeline.name.lastIndexOf('-');
        let name = this.state.ciPipeline.name.substring(0, l) || this.state.ciPipeline.name;
        if (this.state.view == ViewType.LOADING) {
            return <div style={{ minHeight: "380px" }} className="flex"><Progressing pageLoader /></div>
        }
        else {
            return <>
                <label className="form__row">
                    <span className="form__label">Pipeline Name*</span>
                    <input className="form__input" disabled={!!this.state.ciPipeline.id} placeholder="Name" type="text"
                        value={name} />
                </label>
                {this.renderTriggerType()}
                {this.renderMaterials()}
                {this.renderDeleteCIModal()}
            </>
        }
    }

    render() {
        return <VisibleModal className="" >
            <div className="modal__body p-0 br-0 modal__body--ci">
                {this.renderHeader()}
                <div className="pl-20 pr-20 pb-20">
                    {this.renderInfoDialog()}
                    {this.renderCIPipelineBody()}
                </div>
                {this.state.view !== ViewType.LOADING &&
                    <div className="ci-button-container bcn-0 pt-12 pb-12 pl-20 pr-20 flex flex-justify">
                        {this.renderSecondaryButtton()}
                        <Link to={this.state.sourcePipelineURL}
                            target="_blank"
                            className="cta cta--workflow flex flex-1 dc__no-decor"
                            onClick={(event) => this.generateSourceUrl()}>
                            View Source Pipeline
                        </Link>
                    </div>}
            </div>
        </VisibleModal>
    }
}