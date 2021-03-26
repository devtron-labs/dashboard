import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { TriggerType, TagOptions, SourceTypeReverseMap, SourceTypeMap } from '../../config';
import { Select, ButtonWithLoader, Trash, Page, ConditionalWrap, Toggle, DeleteDialog } from '../common';
import PreBuild from '../../assets/img/preBuildStage.png';
import CodeEditor from '../CodeEditor/CodeEditor';
import git from '../../assets/icons/git/git.svg';
import error from '../../assets/icons/misc/errorInfo.svg'
import dropdown from '../../assets/icons/appstatus/ic-dropdown.svg';
import { ReactComponent as Docker } from '../../assets/icons/misc/docker.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import Tippy from '@tippyjs/react';
import trash from '../../assets/icons/misc/delete.svg';

interface AdvancedCIPipelineProps extends RouteComponentProps<{ ciPipelineId }> {

}

export class AdvancedCIPipeline extends Component<any, {}> {

    renderDeleteCI() {
        if (this.props.match.params.ciPipelineId && this.props.showDeleteModal) {
            return <DeleteDialog title={`Delete '${this.props.form.name}' ?`}
                description={`Are you sure you want to delete this CI Pipeline from '${this.props.appName}' ?`}
                closeDelete={this.props.closeCIDeleteModal}
                delete={this.props.deletePipeline} />
        }
        return null;
    }

    renderAddStage(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        return <div className="white-card flex left cursor mt-20 mb-16 "
            onClick={() => { this.props.addEmptyStage(key) }}>
            <Add className="icon-dim-24 fcb-5 vertical-align-middle mr-16" />
            <span className="artifact__add">Add Stage</span>
        </div>
    }

    renderStages(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
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
            <div className="flex left cursor" onClick={(e) => this.props.handlePreBuild()}>
                <div className="sqr-44"><img className="icon-dim-24" src={PreBuild} /></div>
                <div>
                    <div className="ci-stage__title">{title}</div>
                    <div className="ci-stage__description">{description}</div>
                </div>
                <img className="icon-dim-32 m-auto-mr-0" src={dropdown} alt="dropDown" style={{ "transform": this.props.showPreBuild ? "rotate(180deg)" : "rotate(0)" }} />
            </div>

            {this.props.form[key].map((stage, index) => {
                if (stage.isCollapsed) {
                    return <div key={`${key}-${index}-collapsed`} className="white-card white-card--add-new-item mb-16" onClick={(event) => this.props.toggleCollapse(stage.id, index, key)}>
                        <Page className="ci-file-icon" />
                        <div className="ci-stage-name">{stage.name}</div>
                        <img src={dropdown} className="collapsed__icon" alt="collapsed" />
                    </div>
                }
                else {
                    return <div key={`${key}-${index}`} className="white-card mb-16">
                        <div className="white-card__header" >
                            {stage.id ? "Edit Stage" : "Add Stage"}
                            {stage.id > 0 && <Trash style={{ margin: '0 16px 0 auto' }} className="pointer" onClick={e => this.props.deleteStage(stage.id, key, index)} />}
                        </div>
                        <label className="form__row">
                            <span className="form__label">Stage Name*</span>
                            <input className="form__input" autoComplete="off" placeholder="Enter stage name" type="text" value={stage.name} onChange={(event) => this.props.handleChange(event, stage.id, key, index, 'name')} />
                        </label>
                        <label className="form__row">
                            <span className="form__label">Script to execute*</span>
                            <div className="script-container">
                                <CodeEditor
                                    value={stage.script}
                                    mode="shell"
                                    onChange={(value) => this.props.handleChange({ target: { value } }, stage.id, key, index, 'script')}
                                    shebang="#!/bin/sh"
                                    inline
                                    height={300}>
                                </CodeEditor>
                            </div>
                        </label>
                        <label className="form__row">
                            <span className="form__label">Report Directory</span>
                            <input className="form__input" autoComplete="off" placeholder="Enter directory path" type="text" value={stage.outputLocation} onChange={(event) => this.props.handleChange(event, stage.id, key, index, 'outputLocation')} />
                        </label>
                        <div className="form__buttons">
                            <button type="button" className="cta tertiary mr-16" onClick={(event) => this.props.discardChanges(stage.id, key, index)}>Cancel</button>
                            <button type="button" className="cta ghosted" onClick={(event) => this.props.toggleCollapse(stage.id, index, key)}>Done</button>
                        </div>
                    </div>
                }
            })}
            {this.props.showPreBuild ? <> {this.renderAddStage(key)} </> : ""}
        </>
    }

    renderTriggerType() {
        return <div className="form__row">
            <label className="form__label form__label--sentence">When do you want the pipeline to execute?*</label>
            <RadioGroup value={this.props.form.triggerType} name="trigger-type" onChange={this.props.handleTriggerChange}>
                <RadioGroupItem value={TriggerType.Auto}> Automatic  </RadioGroupItem>
                <RadioGroupItem value={TriggerType.Manual}>  Manual  </RadioGroupItem>
            </RadioGroup>
        </div>
    }

    renderDockerArgs() {
        return <>
            <div className=" flex left " onClick={() => this.props.handleDocker()}>
                <div className="sqr-44"><Docker /></div>
                <div>
                    <div className="ci-stage__title">Docker build</div>
                    <div className="ci-stage__description ">Override docker build configurations for this pipeline.</div>
                </div>
                <img className="icon-dim-32 m-auto-mr-0" src={dropdown} alt="dropDown" style={{ "transform": this.props.showDocker ? "rotate(180deg)" : "rotate(0)" }} />

            </div>
            {this.props.showDocker ?
                <div className="docker-build-args  mt-20">
                    <div className="docker-build-args__header"
                        onClick={(event) => { this.setState({ showDockerArgs: !this.props.showDockerArgs }) }}>
                        <span className="docker-build-args__text">Docker Arguments Override</span>
                        <img src={dropdown} alt="dropDown" style={{ "transform": this.props.showDockerArgs ? "rotate(180deg)" : "rotate(0)" }} />
                    </div>
                    {this.props.showDockerArgs ? <div className="docker-build-args__wrapper">
                        {this.props.form.args.map((arg, index) => {
                            return <div key={index} className="form__key-value-inputs form__key-value-inputs--docker-build docker-build-args__body">
                                <img src={trash} onClick={(event) => { this.props.removeDockerArgs(index) }} />
                                <div className="form__field">
                                    <label className="form__label">Key</label>
                                    <input className="form__input w-50" autoComplete="off" placeholder="Name" type="text"
                                        value={arg.key} onChange={(event) => { this.props.handleDockerArgChange(event, index, 'key'); }} />
                                </div>
                                <div className="form__field">
                                    <label className="form__label">Value</label>
                                    <textarea value={arg.value} onChange={(event) => { this.props.handleDockerArgChange(event, index, 'value') }}
                                        placeholder="Enter Your Text here" />
                                </div>
                            </div>
                        })}
                        <button type="button" onClick={(event) => { this.props.addDockerArg() }}
                            className="form__add-parameter form__add-parameter--docker-build">
                            <span className="fa fa-plus"></span>Add parameter
                    </button>
                    </div> : null}
                </div> : null}
        </>
    }

    renderDeleteCIButton() {
        if (this.props.match.params.ciPipelineId) {
            let canDeletePipeline = this.props.connectCDPipelines === 0 && this.props.ciPipeline.linkedCount === 0;
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

    renderMaterials() {
        return <div className="form__row">
            {this.props.form.materials.map((mat, index) => {
                let errorObj = this.props.validationRules.sourceValue(mat.value);
                return <div className="" key={mat.gitMaterialId}>
                    <div className="mb-10">
                        <img src={git} alt="" className="ci-artifact__icon" />
                        {mat.name}
                    </div>
                    <div className="flex mt-10">
                        <div className="flex-1 mr-16 ">
                            <label className="form__label">Source Type*</label>
                            <Select rootClassName="popup-body--source-info"
                                disabled={!!mat.id} onChange={(event) => this.props.selectSourceType(event, mat.gitMaterialId)} >
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
                                onChange={(event) => { this.props.handleSourceChange(event, mat.gitMaterialId) }} />
                            {this.props.showError && !errorObj.isValid ? <span className="form__error">
                                <img src={error} className="form__icon" />
                                {this.props.validationRules.sourceValue(this.props.form.materials[index].value).message}
                            </span> : null}
                        </div>
                    </div>
                </div>
            })}
        </div>
    }

    render() {
        let text = this.props.match.params.ciPipelineId ? "Update Pipeline" : "Create Pipeline";
        let errorObj = this.props.validationRules.name(this.props.form.name);
        return <div className="p-20">
            <label className="form__row">
                <span className="form__label">Pipeline Name*</span>
                <input className="form__input" autoComplete="off" disabled={!!this.props.ciPipeline.id} placeholder="e.g. my-first-pipeline" type="text" value={this.props.form.name}
                    onChange={this.props.handlePipelineName} />
                {this.props.showError && !errorObj.isValid ? <span className="form__error">
                    <img src={error} className="form__icon" />
                    {this.props.validationRules.name(this.props.form.name).message}
                </span> : null}
            </label>
            {this.renderTriggerType()}
            <div className="">
                <div className="cn-9 fw-6 fs-14 mb-18">Select code source</div>
                {this.renderMaterials()}
            </div>
            <hr className="divider" />
            {this.renderStages('beforeDockerBuildScripts')}
            <hr className="divider" />
            {this.renderDockerArgs()}
            <hr className="divider" />
            {this.renderStages('afterDockerBuildScripts')}
            <hr className="divider" />
            <div className="white-card flexbox flex-justify mb-40">
                <div>
                    <p className="ci-stage__title">Scan for vulnerabilities</p>
                    <p className="ci-stage__description mb-0">Perform security scan after docker image is built.</p>
                </div>
                <div className="" style={{ width: "32px", height: "20px" }}>
                    <Toggle selected={this.props.form.scanEnabled} onSelect={this.props.handleScanToggle} />
                </div>
            </div>
            {this.renderDeleteCI()}
            <div className="form__row form__row--flex">
                {this.renderDeleteCIButton()}
                <ButtonWithLoader rootClassName="cta flex-1" loaderColor="white"
                    onClick={this.props.savePipeline}
                    isLoading={this.props.loadingData}>
                    {text}
                </ButtonWithLoader>
            </div>
        </div>
    }
}