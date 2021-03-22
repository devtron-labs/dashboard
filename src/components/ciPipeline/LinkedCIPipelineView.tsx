import React, { Component } from 'react';
import { getCIPipelineParsed, deleteCIPipeline } from './ciPipeline.service';
import { TriggerType, ViewType, TagOptions, SourceTypeReverseMap, URLS } from '../../config';
import { ServerErrors } from '../../modals/commonTypes';
import { CIPipelineProps, CIPipelineState } from './types';
import { Progressing, OpaqueModal, Select, Page, showError, getCIPipelineURL, ConditionalWrap, DeleteDialog } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Info } from '../common/icons/Icons'
import { getWorkflowList } from './../../services/service';
import dropdown from '../../assets/icons/appstatus/ic-dropdown.svg';
import git from '../../assets/icons/git/git.svg';
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
            gitMaterials: [],
            showDeleteModal: false,
            showDockerArgs: false,
            loadingData: true,
            sourcePipelineURL: "",
        }
        this.deletePipeline = this.deletePipeline.bind(this);
        this.closeCIDeleteModal = this.closeCIDeleteModal.bind(this);
    }

    componentDidMount() {
        getCIPipelineParsed(this.props.match.params.appId, this.props.match.params.ciPipelineId).then((response) => {
            this.setState({ ...response, loadingData: false }, () => {
                this.generateSourceUrl();
            });
        }).catch((error: ServerErrors) => {
            showError(error);
            this.setState({ loadingData: false });
        })
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
        deleteCIPipeline(this.state.form, this.state.ciPipeline, this.state.gitMaterials, +this.props.match.params.appId, +this.props.match.params.workflowId, false).then((response) => {
            if (response) {
                toast.success("Pipeline Deleted");
                this.setState({ loadingData: false });
                this.props.close();
                this.props.getWorkflows();
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
        return <div className="info__container info__container--linked-ci">
            <Info />
            <div className="flex column left">
                <div className="info__title">Configurations(Read Only)</div>
                <div className="info__subtitle">You cannot edit a linked Pipeline. To make changes edit the source Pipeline.
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

    renderDeleteCI() {
        if (this.props.match.params.ciPipelineId && this.state.showDeleteModal) {
            return <DeleteDialog title={`Delete '${this.state.form.name}' ?`}
                description={`Are you sure you want to delete this CI Pipeline from '${this.props.appName}' ?`}
                closeDelete={this.closeCIDeleteModal}
                delete={this.deletePipeline} />
        }
        return null;
    }

    renderMaterials() {
        return <div className="form__row">
            <span className="form__label">Materials*</span>
            {this.state.form.materials.map((mat, index) => {
                return <div className="ci-artifact" key={mat.gitMaterialId}>
                    <div className="ci-artifact__header">
                        <img src={git} alt="" className="ci-artifact__icon" />
                        {mat.name}
                    </div>
                    {mat.isSelected ? <div className="ci-artifact__body">
                        <div className="flex-1 mr-16">
                            <label className="form__label">Source Type*</label>
                            <Select rootClassName="popup-body--source-info" disabled={!!this.props.match.params.ciPipelineId} onChange={(event) => { }} >
                                <Select.Button rootClassName="select-button default">{SourceTypeReverseMap[mat.type] || "Select Source Type"}</Select.Button>
                                {TagOptions.map((tag) => {
                                    return <Select.Option key={tag.value} value={tag.value}>{tag.label}</Select.Option>
                                })}
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="form__label">Branch Name*</label>
                            <input className="form__input" placeholder="Name" type="text" value={mat.value} disabled={true}
                                onChange={(event) => { }} />
                        </div>
                    </div> : null}
                </div>
            })}
        </div>
    }

    renderStages(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        if (!(this.state.form[key] && this.state.form[key].length)) return null;

        let description, title;
        if (key == 'beforeDockerBuildScripts') {
            title = "Pre-build Stages";
            description = " These stages are run in sequence before the docker image is built";
        }
        else {
            title = "Post-build Stages";
            description = " These stages are run in sequence after the docker image is built";
        }
        return <>
            <h3 className="ci-stage__title">{title}</h3>
            <p className="ci-stage__description">{description}</p>
            {this.state.form[key].map((stage, index) => {
                if (stage.isCollapsed) {
                    return <div key={`${key}-${index}-collapsed`} className="white-card white-card--add-new-item" onClick={(event) => this.toggleCollapse(stage.id, index, key)}>
                        <Page className="ci-file-icon" />
                        <div className="ci-stage-name">{stage.name}</div>
                        <img src={dropdown} className="collapsed__icon" alt="collapsed" />
                    </div>
                }
                else {
                    return <div key={`${key}-${index}`} className="white-card">
                        <div className="white-card__header white-card__header--artifact" >
                            Stage
                            <button type="button" className="transparent collapse-button" >
                                <img src={dropdown} className="collapsed__icon" style={{ transform: 'rotateX(180deg)' }} alt="collapsed" onClick={(event) => this.toggleCollapse(stage.id, index, key)} />
                            </button>
                        </div>
                        <label className="form__row">
                            <span className="form__label">Stage Name*</span>
                            <input className="form__input" placeholder="Enter stage name" type="text" value={stage.name} disabled={true} />
                        </label>
                        <label className="form__row">
                            <span className="form__label">Script to execute*</span>
                            <textarea className="code-textarea code-textarea--cd-pipeline" value={stage.script} disabled={true} />
                        </label>
                        <label className="form__row">
                            <span className="form__label">Report Directory</span>
                            <input className="form__input" placeholder="Enter directory path" type="text" disabled={true} value={stage.outputLocation} />
                        </label>
                        <div className="form__buttons">
                            <button type="button" className="cta ghosted" onClick={(event) => this.toggleCollapse(stage.id, index, key)}>Done</button>
                        </div>
                    </div>
                }
            })}
        </>
    }

    renderDockerArgs() {
        if (!this.state.form.args.length) return null
        return <>
            <div className="form__label">Advanced Configuration</div>
            <div className="docker-build-args">
                <div className="docker-build-args__header"
                    onClick={(event) => { this.setState({ showDockerArgs: !this.state.showDockerArgs }) }}>
                    <span className="docker-build-args__text">Docker Build Arguments</span>
                    <img src={dropdown} alt="dropDown" style={{ "transform": this.state.showDockerArgs ? "rotate(180deg)" : "rotate(0)" }} />
                </div>
                <div className="docker-build-args__wrapper">
                    {this.state.form.args.map((arg, index) => {
                        return <div key={index} className="form__key-value-inputs form__key-value-inputs--docker-build docker-build-args__body">
                            <div className="form__field">
                                <label className="form__label">Key</label>
                                <input className="form__input w-50" placeholder="Name" type="text" disabled={true}
                                    value={arg.key} onChange={(event) => { }} />
                            </div>
                            <div className="form__field">
                                <label className="form__label">Value</label>
                                <textarea value={arg.value} onChange={(event) => { }} disabled={true}
                                    placeholder="Enter Your Text here" />
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </>
    }

    renderHeader() {
        return <>
            <h1 className="form__title">Linked CI Pipeline</h1>
            <p className="form__subtitle"></p>
        </>
    }

    renderDeleteCIButton() {
        if (this.props.match.params.ciPipelineId) {
            let canDeletePipeline = this.props.connectCDPipelines === 0 && this.state.ciPipeline.linkedCount === 0;
            return <ConditionalWrap condition={!canDeletePipeline}
                wrap={children => <Tippy className="default-tt"
                    content="This Pipeline cannot be deleted as it has connected CD pipeline">
                    <div>{children}</div>
                </Tippy>}>
                <button type="button"
                    className={`cta delete mr-16`}
                    disabled={!canDeletePipeline}
                    onClick={() => { this.setState({ showDeleteModal: true }) }}>
                    Delete Pipeline
                    </button>
            </ConditionalWrap>
        }
    }

    render() {
        let l = this.state.ciPipeline.name.lastIndexOf('-');
        let name = this.state.ciPipeline.name.substring(0, l);
        if (this.state.view == ViewType.LOADING) {
            return <OpaqueModal onHide={this.props.close}>
                <Progressing pageLoader />
            </OpaqueModal>
        }
        else {
            return <OpaqueModal onHide={this.props.close}>
                <div className="modal__body modal__body--ci">
                    {this.renderHeader()}
                    {this.renderInfoDialog()}
                    <label className="form__row">
                        <span className="form__label">Pipeline Name*</span>
                        <input className="form__input" disabled={!!this.state.ciPipeline.id} placeholder="Name" type="text" value={name} />
                    </label>
                    {this.renderTriggerType()}
                    {this.renderMaterials()}
                    {this.renderDockerArgs()}
                    {this.renderStages('beforeDockerBuildScripts')}
                    {this.renderStages('afterDockerBuildScripts')}
                    {this.renderDeleteCI()}
                    <div className="form__row form__row--flex">
                        {this.renderDeleteCIButton()}
                        <Link to={this.state.sourcePipelineURL} target="_blank" className="cta flex-1 no-decor" onClick={(event) => this.generateSourceUrl()}>
                            View Source Pipeline
                        </Link>
                    </div>
                </div>
            </OpaqueModal >
        }
    }
}