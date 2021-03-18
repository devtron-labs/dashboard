import React, { Component } from 'react';
import { saveCIPipeline, deleteCIPipeline, getCIPipelineParsed, getSourceConfigParsed } from './ciPipeline.service';
import { TriggerType, ViewType, TagOptions, SourceTypeReverseMap, SourceTypeMap } from '../../config';
import { ServerErrors } from '../../modals/commonTypes';
import { CIPipelineProps, CIPipelineState, MaterialType } from './types';
import { Progressing, OpaqueModal, Select, ButtonWithLoader, Trash, Page, showError, ConditionalWrap, Toggle, DeleteDialog } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { toast } from 'react-toastify';
import dropdown from '../../assets/icons/appstatus/ic-dropdown.svg';
import trash from '../../assets/icons/misc/delete.svg';
import git from '../../assets/icons/git/git.svg';
import error from '../../assets/icons/misc/errorInfo.svg'
import { ValidationRules } from './validationRules';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import CodeEditor from '../CodeEditor/CodeEditor';
import Tippy from '@tippyjs/react';
import './ciPipeline.css';

export default class CIPipeline extends Component<CIPipelineProps, CIPipelineState> {
    validationRules;
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
                scanEnabled: false,
            },
            ciPipeline: {
                active: true,
                ciMaterial: [],
                dockerArgs: {},
                //required for External CI Pipeline only
                externalCiConfig: {},
                id: 0,
                isExternal: false,
                isManual: false,
                name: "",
                linkedCount: 0,
                scanEnabled: false,
            },
            gitMaterials: [],
            showDeleteModal: false,
            showDockerArgs: false,
            loadingData: true,
        }
        this.handlePipelineName = this.handlePipelineName.bind(this);
        this.handleTriggerChange = this.handleTriggerChange.bind(this);
        this.savePipeline = this.savePipeline.bind(this);
        this.selectSourceType = this.selectSourceType.bind(this);
        this.deletePipeline = this.deletePipeline.bind(this);
        this.closeCIDeleteModal = this.closeCIDeleteModal.bind(this);
        this.handleScanToggle = this.handleScanToggle.bind(this);
        this.validationRules = new ValidationRules();
    }

    componentDidMount() {
        if (this.props.match.params.ciPipelineId) {
            getCIPipelineParsed(this.props.match.params.appId, this.props.match.params.ciPipelineId).then((response) => {
                this.setState({ ...response, loadingData: false });
            }).catch((error: ServerErrors) => {
                showError(error);
                this.setState({ loadingData: false });
            })
        }
        else {
            getSourceConfigParsed(this.props.match.params.appId).then((response) => {
                this.setState({
                    view: ViewType.FORM,
                    form: {
                        ...this.state.form,
                        materials: response.result.materials
                    },
                    gitMaterials: response.result.gitMaterials,
                    loadingData: false,
                });
            })
        }
    }

    handleDockerArgChange(event, index: number, key: 'key' | 'value') {
        let { form } = { ...this.state };
        form.args[index][key] = event.target.value;
        this.setState({ form });
    }

    handleTriggerChange(event): void {
        let { form } = { ...this.state };
        form.triggerType = event.target.value;
        this.setState({ form });
    }

    handlePipelineName(event): void {
        let state = { ...this.state };
        state.form.name = event.target.value;
        this.setState(state);
    }

    addDockerArg(): void {
        let state = { ...this.state };
        state.form.args.push({ key: "", value: "" });
        this.setState(state);
    }

    selectSourceType(event, gitMaterialId: number): void {
        let { form } = { ...this.state };
        let allMaterials = this.state.form.materials.map((mat) => {
            return {
                ...mat,
                type: (gitMaterialId == mat.gitMaterialId) ? event.target.value : mat.type,
            }
        })
        form.materials = allMaterials;
        this.setState({ form });
    }

    handleSourceChange(event, gitMaterialId: number): void {
        let { form } = { ...this.state };
        let allMaterials = this.state.form.materials.map((mat) => {
            if (mat.gitMaterialId == gitMaterialId) {
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

    selectMaterial(material: MaterialType): void {
        let allMaterials = this.state.form.materials.map((mat) => {
            if (mat.gitMaterialId == material.gitMaterialId) {
                return {
                    ...mat,
                    isSelected: !mat.isSelected,
                }
            }
            else return mat;
        })
        let { form } = { ...this.state };
        form.materials = allMaterials;
        this.setState({ form });
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

    addEmptyStage(stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        let { form } = this.state
        let { length, [length - 1]: last } = form[stageType]
        let stage = {
            index: last ? last.index + 1 : 1,
            name: "",
            outputLocation: "",
            script: "",
            isCollapsed: false,
            id: 0,
        }
        form[stageType].push(stage);
        this.setState({ form });
    }

    deleteStage = (stageId: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number) => {
        let stages = this.state.form[key]
        stages.splice(stageIndex, 1)
        this.setState(form => ({ ...form, [key]: stages }))
    }

    discardChanges(stageId: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number) {
        if (stageId) { //saved stage
            let stageData = this.state.ciPipeline[key].find(stage => stage.id == stageId);
            let { form } = { ...this.state };
            let stages = this.state.form[key].map((stage) => {
                if (stage.id == stageId) return {
                    id: stageData.id,
                    outputLocation: stageData.outputLocation,
                    script: stageData.script,
                    name: stageData.name,
                    isCollapsed: true,
                    index: stageData.index
                };
                else return stage;
            })
            form[key] = stages;
            this.setState({ form });
        }
        else { //unsaved stage
            let stages = [];
            for (let i = 0; i < this.state.form[key].length; i++) {
                if (i == stageIndex) {
                }
                else {
                    stages.push(this.state.form[key][i]);
                }
            }
            let { form } = { ...this.state };
            form[key] = stages;
            this.setState({ form });
        }
    }

    checkUniqueness(): boolean {
        let list = this.state.form.beforeDockerBuildScripts.concat(this.state.form.afterDockerBuildScripts);
        let stageNameList = list.map((l) => {
            return l.name;
        })
        let set = new Set();
        for (let i = 0; i < stageNameList.length; i++) {
            if (set.has(stageNameList[i])) return false
            else set.add(stageNameList[i])
        }
        return true;
    }

    handleChange(event, stageId: number, stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number, key: 'name' | 'outputLocation' | 'script') {
        let stages = this.state.form[stageType];
        stages[stageIndex][key] = event.target.value;
        this.setState({ form: { ...this.state.form, [stageType]: stages } });
    }

    handleScanToggle(): void {
        let state = { ...this.state };
        this.setState({
            form: {
                ...state.form,
                scanEnabled: !state.form.scanEnabled,
            },
        })
    }

    savePipeline() {
        let isUnique = this.checkUniqueness();
        if (!isUnique) {
            toast.error("All Stage names must be unique");
            return;
        }
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
        saveCIPipeline(this.state.form, this.state.ciPipeline, this.state.gitMaterials, +this.props.match.params.appId, +this.props.match.params.workflowId, false).then((response) => {
            if (response) {
                toast.success(msg);
                this.setState({ loadingData: false });
                this.props.close();
                this.props.getWorkflows();
            }
        }).catch((error: ServerErrors) => {
            showError(error)
            this.setState({ loadingData: false });
        })
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
            showError(error)
            this.setState({ loadingData: false });
        })
    }

    closeCIDeleteModal() {
        this.setState({ showDeleteModal: false });
    }

    removeDockerArgs(index: number) {
        let newArgs = [];
        for (let i = 0; i < this.state.form.args.length; i++) {
            if (index != i) newArgs.push(this.state.form.args[i]);
        }
        let { form } = { ...this.state };
        form.args = newArgs;
        this.setState({ form });
    }

    renderTriggerType() {
        return <div className="form__row">
            <label className="form__label form__label--sentence">When do you want the pipeline to execute?*</label>
            <RadioGroup value={this.state.form.triggerType} name="trigger-type" onChange={this.handleTriggerChange}>
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
                let errorObj = this.validationRules.sourceValue(mat.value);
                return <div className="ci-artifact" key={mat.gitMaterialId}>
                    <div className="ci-artifact__header">
                        <img src={git} alt="" className="ci-artifact__icon" />
                        {mat.name}
                    </div>
                    <div className="ci-artifact__body">
                        <div className="flex-1 mr-16">
                            <label className="form__label">Source Type*</label>
                            <Select rootClassName="popup-body--source-info"
                                disabled={!!mat.id} onChange={(event) => this.selectSourceType(event, mat.gitMaterialId)} >
                                <Select.Button rootClassName="select-button default" >{SourceTypeReverseMap[mat.type] || "Select Source Type"}</Select.Button>
                                {TagOptions.map((tag) => {
                                    return <Select.Option key={tag.value} value={tag.value}>{tag.label}</Select.Option>
                                })}
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="form__label">
                                {mat.type === SourceTypeMap.BranchFixed ? "Branch Name*" : "Source Value*"}
                            </label>
                            <input className="form__input" autoComplete="off" placeholder="Name" type="text" value={mat.value}
                                onChange={(event) => { this.handleSourceChange(event, mat.gitMaterialId) }} />
                            {this.state.showError && !errorObj.isValid ? <span className="form__error">
                                <img src={error} className="form__icon" />
                                {this.validationRules.sourceValue(this.state.form.materials[index].value).message}
                            </span> : null}
                        </div>
                    </div>
                </div>
            })}
        </div>
    }

    renderAddStage(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        return <div className="white-card flex left cursor mb-16"
            onClick={() => { this.addEmptyStage(key) }}>
            <Add className="icon-dim-24 fcb-5 vertical-align-middle mr-16" />
            <span className="artifact__add">Add Stage</span>
        </div>
    }

    renderStages(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        let description, title;
        if (key == 'beforeDockerBuildScripts') {
            title = "Pre-build";
            description = " These stages are run in sequence before the docker image is built";
        }
        else {
            title = "Post-build";
            description = " These stages are run in sequence after the docker image is built";
        }
        return <>
            <h3 className="ci-stage__title">{title}</h3>
            <p className="ci-stage__description mb-10">{description}</p>
            {this.state.form[key].map((stage, index) => {
                if (stage.isCollapsed) {
                    return <div key={`${key}-${index}-collapsed`} className="white-card white-card--add-new-item mb-16" onClick={(event) => this.toggleCollapse(stage.id, index, key)}>
                        <Page className="ci-file-icon" />
                        <div className="ci-stage-name">{stage.name}</div>
                        <img src={dropdown} className="collapsed__icon" alt="collapsed" />
                    </div>
                }
                else {
                    return <div key={`${key}-${index}`} className="white-card mb-16">
                        <div className="white-card__header" >
                            {stage.id ? "Edit Stage" : "Add Stage"}
                            {stage.id > 0 && <Trash style={{ margin: '0 16px 0 auto' }} className="pointer" onClick={e => this.deleteStage(stage.id, key, index)} />}
                        </div>
                        <label className="form__row">
                            <span className="form__label">Stage Name*</span>
                            <input className="form__input" autoComplete="off" placeholder="Enter stage name" type="text" value={stage.name} onChange={(event) => this.handleChange(event, stage.id, key, index, 'name')} />
                        </label>
                        <label className="form__row">
                            <span className="form__label">Script to execute*</span>
                            <div className="script-container">
                                <CodeEditor
                                    value={stage.script}
                                    mode="shell"
                                    onChange={(value) => this.handleChange({ target: { value } }, stage.id, key, index, 'script')}
                                    shebang="#!/bin/sh"
                                    inline
                                    height={300}
                                >
                                </CodeEditor>
                            </div>
                        </label>
                        <label className="form__row">
                            <span className="form__label">Report Directory</span>
                            <input className="form__input" autoComplete="off" placeholder="Enter directory path" type="text" value={stage.outputLocation} onChange={(event) => this.handleChange(event, stage.id, key, index, 'outputLocation')} />
                        </label>
                        <div className="form__buttons">
                            <button type="button" className="cta tertiary mr-16" onClick={(event) => this.discardChanges(stage.id, key, index)}>Cancel</button>
                            <button type="button" className="cta ghosted" onClick={(event) => this.toggleCollapse(stage.id, index, key)}>Done</button>
                        </div>
                    </div>
                }
            })}
            {this.renderAddStage(key)}
        </>
    }

    renderDockerArgs() {
        return <>
            <h2 className="ci-stage__title">Docker build</h2>
            <p className="ci-stage__description mb-10">Override docker build configurations for this pipeline.</p>
            <div className="docker-build-args">
                <div className="docker-build-args__header"
                    onClick={(event) => { this.setState({ showDockerArgs: !this.state.showDockerArgs }) }}>
                    <span className="docker-build-args__text">Docker Arguments Override</span>
                    <img src={dropdown} alt="dropDown" style={{ "transform": this.state.showDockerArgs ? "rotate(180deg)" : "rotate(0)" }} />
                </div>
                {this.state.showDockerArgs ? <div className="docker-build-args__wrapper">
                    {this.state.form.args.map((arg, index) => {
                        return <div key={index} className="form__key-value-inputs form__key-value-inputs--docker-build docker-build-args__body">
                            <img src={trash} onClick={(event) => { this.removeDockerArgs(index) }} />
                            <div className="form__field">
                                <label className="form__label">Key</label>
                                <input className="form__input w-50" autoComplete="off" placeholder="Name" type="text"
                                    value={arg.key} onChange={(event) => { this.handleDockerArgChange(event, index, 'key'); }} />
                            </div>
                            <div className="form__field">
                                <label className="form__label">Value</label>
                                <textarea value={arg.value} onChange={(event) => { this.handleDockerArgChange(event, index, 'value') }}
                                    placeholder="Enter Your Text here" />
                            </div>
                        </div>
                    })}
                    <button type="button" onClick={(event) => { this.addDockerArg() }}
                        className="form__add-parameter form__add-parameter--docker-build">
                        <span className="fa fa-plus"></span>
                        Add parameter
                    </button>
                </div> : null}
            </div>
        </>
    }

    renderHeader() {
        return <>
            <h1 className="form__title">CI Pipeline</h1>
            <p className="form__subtitle"></p>
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
                    className={`cta delete mr-16`}
                    disabled={!canDeletePipeline}
                    onClick={() => { this.setState({ showDeleteModal: true }) }}>Delete Pipeline
                </button>
            </ConditionalWrap>
        }
    }

    render() {
        let text = this.props.match.params.ciPipelineId ? "Update Pipeline" : "Create Pipeline";
        let errorObj = this.validationRules.name(this.state.form.name);
        if (this.state.view == ViewType.LOADING) {
            return <OpaqueModal onHide={this.props.close}>
                <Progressing pageLoader />
            </OpaqueModal>
        }
        else {
            return <OpaqueModal onHide={this.props.close}>
                <div className="modal__body modal__body--ci">
                    {this.renderHeader()}
                    <label className="form__row">
                        <span className="form__label">Pipeline Name*</span>
                        <input className="form__input" autoComplete="off" disabled={!!this.state.ciPipeline.id} placeholder="Name" type="text" value={this.state.form.name}
                            onChange={this.handlePipelineName} />
                        {this.state.showError && !errorObj.isValid ? <span className="form__error">
                            <img src={error} className="form__icon" />
                            {this.validationRules.name(this.state.form.name).message}
                        </span> : null}
                    </label>
                    {this.renderTriggerType()}
                    {this.renderMaterials()}
                    <h2 className="form__section mt-20 mb-16">Stages</h2>
                    {this.renderStages('beforeDockerBuildScripts')}
                    {this.renderDockerArgs()}
                    {this.renderStages('afterDockerBuildScripts')}
                    <div className="white-card flexbox flex-justify mb-40">
                        <div>
                            <p className="ci-stage__title">Scan for vulnerabilities</p>
                            <p className="ci-stage__description mb-0">Perform security scan after docker image is built.</p>
                        </div>
                        <div className="" style={{ width: "32px", height: "20px" }}>
                            <Toggle selected={this.state.form.scanEnabled} onSelect={this.handleScanToggle} />
                        </div>
                    </div>
                    {this.renderDeleteCI()}
                    <div className="form__row form__row--flex">
                        {this.renderDeleteCIButton()}
                        <ButtonWithLoader rootClassName="cta flex-1" loaderColor="white"
                            onClick={this.savePipeline}
                            isLoading={this.state.loadingData}>
                            {text}
                        </ButtonWithLoader>
                    </div>
                </div>
            </OpaqueModal >
        }
    }
}