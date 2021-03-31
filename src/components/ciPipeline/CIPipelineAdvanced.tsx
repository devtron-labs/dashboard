import React, { Component } from 'react'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { TriggerType } from '../../config';
import { Trash, Page, Toggle } from '../common';
import { ReactComponent as Docker } from '../../assets/icons/misc/docker.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as PreBuild } from '../../assets/icons/ic-cd-stage.svg';
import CodeEditor from '../CodeEditor/CodeEditor';
import error from '../../assets/icons/misc/errorInfo.svg'
import dropdown from '../../assets/icons/appstatus/ic-dropdown.svg';
import trash from '../../assets/icons/misc/delete.svg';
import { SourceMaterials } from './SourceMaterials';
import { CIPipelineState } from './types';

interface CIPipelineAdvancedProps extends CIPipelineState {
    validationRules: any;
    closeCIDeleteModal: () => void;
    deletePipeline: () => void;
    handlePreBuild: () => void;
    handlePostBuild: () => void;
    handleDockerArgs: () => void;
    addEmptyStage: (stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') => void;
    toggleCollapse: (stageId, stageIndex: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') => void;
    deleteStage: (stageId: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number) => void;
    handleChange: (event, stageId: number, stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number, key: 'name' | 'outputLocation' | 'script') => void;
    discardChanges: (stageId: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts', stageIndex: number) => void;
    handleTriggerChange: (event) => void;
    handleDocker: () => void;
    addDockerArg: () => void;
    handleDockerArgChange: (event, index: number, key: 'key' | 'value') => void;
    removeDockerArgs: (index: number) => void;
    handleScanToggle: () => void;
    handleSourceChange: (event, gitMaterialId: number) => void;
    handlePipelineName: (event) => void;
    selectSourceType: (event, gitMaterialId: number) => void;
}

export class CIPipelineAdvanced extends Component<CIPipelineAdvancedProps, {}> {

    renderAddStage(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        return <div className="white-card flex left cursor mt-20 mb-16 dashed"
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
            <div className="flex left cursor" onClick={(event) => {
                if (key === 'beforeDockerBuildScripts') this.props.handlePreBuild();
                else this.props.handlePostBuild();
            }}>
                <div className="sqr-44"><PreBuild className="icon-dim-24" /></div>
                <div>
                    <div className="ci-stage__title">{title}</div>
                    <div className="ci-stage__description">{description}</div>
                </div>
                {key === 'beforeDockerBuildScripts' ?
                    <img className="icon-dim-32 ml-auto" src={dropdown} alt="dropDown" style={{ "transform": this.props.showPreBuild ? "rotate(180deg)" : "rotate(0)" }} /> :
                    <img className="icon-dim-32 ml-auto" src={dropdown} alt="dropDown" style={{ "transform": this.props.showPostBuild ? "rotate(180deg)" : "rotate(0)" }} />}
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
                    if (key === 'beforeDockerBuildScripts' && this.props.showPreBuild) {
                        return <div key={`${key}-${index}`} className="white-card mt-20 mb-16">

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
                    else if (key === 'afterDockerBuildScripts' && this.props.showPostBuild) {
                        return <div key={`${key}-${index}`} className="white-card mt-20 mb-16">

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
                }
            })}
            {key === 'beforeDockerBuildScripts' && this.props.showPreBuild ? this.renderAddStage(key) : ""}
            {key === 'afterDockerBuildScripts' && this.props.showPostBuild ? this.renderAddStage(key) : ""}
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
            <div className=" flex left cursor" onClick={() => this.props.handleDocker()}>
                <div className="sqr-44"><Docker /></div>
                <div>
                    <div className="ci-stage__title">Docker build</div>
                    <div className="ci-stage__description ">Override docker build configurations for this pipeline.</div>
                </div>
                <img className="icon-dim-32 ml-auto" src={dropdown} alt="dropDown" style={{ "transform": this.props.showDocker ? "rotate(180deg)" : "rotate(0)" }} />

            </div>
            {this.props.showDocker ?
                <div className="docker-build-args mt-20">
                    <div className="docker-build-args__header"
                        onClick={(event) => { this.props.handleDockerArgs() }}>
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

    renderMaterials() {
        return <SourceMaterials
            showError={this.props.showError}
            validationRules={this.props.validationRules}
            materials={this.props.form.materials}
            selectSourceType={this.props.selectSourceType}
            handleSourceChange={this.props.handleSourceChange}
        />
    }

    render() {
        let errorObj = this.props.validationRules.name(this.props.form.name);
        return <div className="" >
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
            {this.renderMaterials()}
            <hr className="divider" />
            {this.renderStages('beforeDockerBuildScripts')}
            <hr className="divider" />
            {this.renderDockerArgs()}
            <hr className="divider" />
            {this.renderStages('afterDockerBuildScripts')}
            <hr className="divider" />
            <div className="white-card flexbox flex-justify mb-20">
                <div>
                    <p className="ci-stage__title">Scan for vulnerabilities</p>
                    <p className="ci-stage__description mb-0">Perform security scan after docker image is built.</p>
                </div>
                <div className="" style={{ width: "32px", height: "20px" }}>
                    <Toggle selected={this.props.form.scanEnabled} onSelect={this.props.handleScanToggle} />
                </div>
            </div>
        </div>
    }
}