import React, { Component } from 'react'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { TriggerType, SourceTypeMap } from '../../config'
import { Trash, Page, Toggle } from '../common'
import { ReactComponent as Docker } from '../../assets/icons/misc/docker.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as PreBuild } from '../../assets/icons/ic-cd-stage.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import error from '../../assets/icons/misc/errorInfo.svg'
import dropdown from '../../assets/icons/ic-chevron-down.svg'
import trash from '../../assets/icons/misc/delete.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/appstatus/ic-appstatus-failed.svg'
import { SourceMaterials } from './SourceMaterials'
import { CIPipelineState, WebhookCIProps } from './types'
import { ReactComponent as Info } from '../../assets/icons/appstatus/info-filled.svg'

interface CIPipelineAdvancedProps extends CIPipelineState {
    copyToClipboard: (text: string) => void
    validationRules: any
    closeCIDeleteModal: () => void
    deletePipeline: () => void
    handlePreBuild: () => void
    handlePostBuild: () => void
    handleDockerArgs: () => void
    addEmptyStage: (stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') => void
    toggleCollapse: (stageId, stageIndex: number, key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') => void
    deleteStage: (
        stageId: number,
        key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts',
        stageIndex: number,
    ) => void
    handleChange: (
        event,
        stageId: number,
        stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts',
        stageIndex: number,
        key: 'name' | 'outputLocation' | 'script',
    ) => void
    discardChanges: (
        stageId: number,
        key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts',
        stageIndex: number,
    ) => void
    handleTriggerChange: (event) => void
    handleDocker: () => void
    addDockerArg: () => void
    handleDockerArgChange: (event, index: number, key: 'key' | 'value') => void
    removeDockerArgs: (index: number) => void
    handleScanToggle: () => void
    handleSourceChange: (event, gitMaterialId: number) => void
    handlePipelineName: (event) => void
    selectSourceType: (event, gitMaterialId: number) => void
    getSelectedWebhookEvent: (material: any) => any
    addWebhookCondition: () => void
    deleteWebhookCondition: (index: number) => void
    onWebhookConditionSelectorChange: (index: number, selectorId: number) => void
    onWebhookConditionSelectorValueChange: (index: number, value: string) => void
}

export class CIPipelineAdvanced extends Component<CIPipelineAdvancedProps, {}> {
    renderAddStage(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        return (
            <div
                className="white-card flex left cursor mt-20 mb-16 dashed"
                onClick={() => {
                    this.props.addEmptyStage(key)
                }}
            >
                <Add className="icon-dim-24 fcb-5 vertical-align-middle mr-16" />
                <span className="artifact__add">Add Stage</span>
            </div>
        )
    }

    renderBuildReportInfo = () => {
        return (
            <div className="flex left mt-4 fw-4">
                <Info className="icon-dim-20" />
                <div className="cn-5 ml-4">
                    Directory in which above script is writing/producing output files(eg. test report, zip files etc)
                </div>
            </div>
        )
    }

    renderStages(key: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts') {
        let description, title
        if (key == 'beforeDockerBuildScripts') {
            title = 'Pre-build Stages'
            description = ' These stages are run in sequence before the container image is built'
        } else {
            title = 'Post-build Stages'
            description = ' These stages are run in sequence after the container image is built'
        }
        let showBuild = key === 'beforeDockerBuildScripts' ? this.props.showPreBuild : this.props.showPostBuild

        return (
            <>
                <div
                    className="flex left cursor"
                    onClick={(event) => {
                        if (key === 'beforeDockerBuildScripts') this.props.handlePreBuild()
                        else this.props.handlePostBuild()
                    }}
                >
                    <div className="sqr-44">
                        <PreBuild className="icon-dim-24" />
                    </div>
                    <div>
                        <div className="ci-stage__title">{title}</div>
                        <div className="ci-stage__description">{description}</div>
                    </div>
                    {key === 'beforeDockerBuildScripts' ? (
                        <img
                            className="icon-dim-32 ml-auto"
                            src={dropdown}
                            alt="dropDown"
                            style={{ transform: this.props.showPreBuild ? 'rotate(180deg)' : 'rotate(0)' }}
                        />
                    ) : (
                        <img
                            className="icon-dim-32 ml-auto"
                            src={dropdown}
                            alt="dropDown"
                            style={{ transform: this.props.showPostBuild ? 'rotate(180deg)' : 'rotate(0)' }}
                        />
                    )}
                </div>
                {this.props.form[key].map((stage, index) => {
                    if (showBuild && stage.isCollapsed) {
                        return (
                            <div
                                key={`${key}-${index}-collapsed`}
                                className="white-card white-card--add-new-item mt-16"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    this.props.toggleCollapse(stage.id, index, key)
                                }}
                            >
                                <Page className="ci-file-icon" />
                                <div className="ci-stage-name">{stage.name}</div>
                                <img src={dropdown} className="collapsed__icon" alt="collapsed" />
                            </div>
                        )
                    } else {
                        if (key === 'beforeDockerBuildScripts' && this.props.showPreBuild) {
                            return (
                                <div key={`${key}-${index}`} className="white-card mt-20 mb-16">
                                    <div className="white-card__header  flex flex-justify">
                                        {stage.id ? 'Edit Stage' : 'Add Stage'}
                                        {stage.id > 0 && (
                                            <Trash
                                                className="pointer"
                                                onClick={(e) => this.props.deleteStage(stage.id, key, index)}
                                            />
                                        )}
                                    </div>
                                    <label className="form__row">
                                        <span className="form__label">Stage Name*</span>
                                        <input
                                            className="form__input"
                                            autoComplete="off"
                                            placeholder="Enter stage name"
                                            type="text"
                                            value={stage.name}
                                            onChange={(event) =>
                                                this.props.handleChange(event, stage.id, key, index, 'name')
                                            }
                                        />
                                    </label>
                                    <label className="form__row">
                                        <span className="form__label">Script to execute*</span>
                                        <div className="script-container">
                                            <CodeEditor
                                                value={stage.script}
                                                mode="shell"
                                                onChange={(value) =>
                                                    this.props.handleChange(
                                                        { target: { value } },
                                                        stage.id,
                                                        key,
                                                        index,
                                                        'script',
                                                    )
                                                }
                                                shebang="#!/bin/sh"
                                                inline
                                                height={300}
                                            ></CodeEditor>
                                        </div>
                                    </label>
                                    <label className="form__row">
                                        <span className="form__label">Report directory path</span>
                                        <input
                                            className="form__input"
                                            autoComplete="off"
                                            placeholder="Enter report directory path"
                                            type="text"
                                            value={stage.outputLocation}
                                            onChange={(event) =>
                                                this.props.handleChange(event, stage.id, key, index, 'outputLocation')
                                            }
                                        />
                                        {this.renderBuildReportInfo()}
                                    </label>
                                    <div className="form__buttons">
                                        <button
                                            type="button"
                                            className="cta tertiary mr-16"
                                            onClick={(event) => this.props.discardChanges(stage.id, key, index)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="cta ghosted"
                                            onClick={(event) => this.props.toggleCollapse(stage.id, index, key)}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )
                        } else if (key === 'afterDockerBuildScripts' && this.props.showPostBuild) {
                            return (
                                <div key={`${key}-${index}`} className="white-card mt-20 mb-16">
                                    <div className="white-card__header flex flex-justify">
                                        {stage.id ? 'Edit Stage' : 'Add Stage'}
                                        {stage.id > 0 && (
                                            <Trash
                                                className="pointer"
                                                onClick={(e) => this.props.deleteStage(stage.id, key, index)}
                                            />
                                        )}
                                    </div>
                                    <label className="form__row">
                                        <span className="form__label">Stage Name*</span>
                                        <input
                                            className="form__input"
                                            autoComplete="off"
                                            placeholder="Enter stage name"
                                            type="text"
                                            value={stage.name}
                                            onChange={(event) =>
                                                this.props.handleChange(event, stage.id, key, index, 'name')
                                            }
                                        />
                                    </label>
                                    <label className="form__row">
                                        <span className="form__label">Script to execute*</span>
                                        <div className="script-container">
                                            <CodeEditor
                                                value={stage.script}
                                                mode="shell"
                                                onChange={(value) =>
                                                    this.props.handleChange(
                                                        { target: { value } },
                                                        stage.id,
                                                        key,
                                                        index,
                                                        'script',
                                                    )
                                                }
                                                shebang="#!/bin/sh"
                                                inline
                                                height={300}
                                            ></CodeEditor>
                                        </div>
                                    </label>
                                    <label className="form__row">
                                        <span className="form__label">Report directory path</span>
                                        <input
                                            className="form__input"
                                            autoComplete="off"
                                            placeholder="Enter directory path"
                                            type="text"
                                            value={stage.outputLocation}
                                            onChange={(event) =>
                                                this.props.handleChange(event, stage.id, key, index, 'outputLocation')
                                            }
                                        />
                                        {this.renderBuildReportInfo()}
                                    </label>
                                    <div className="form__buttons">
                                        <button
                                            type="button"
                                            className="cta tertiary mr-16"
                                            onClick={(event) => this.props.discardChanges(stage.id, key, index)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="cta ghosted"
                                            onClick={(event) => this.props.toggleCollapse(stage.id, index, key)}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    }
                })}
                {key === 'beforeDockerBuildScripts' && this.props.showPreBuild ? this.renderAddStage(key) : ''}
                {key === 'afterDockerBuildScripts' && this.props.showPostBuild ? this.renderAddStage(key) : ''}
            </>
        )
    }

    renderTriggerType() {
        return (
            <div className="form__row">
                <label className="form__label form__label--sentence">When do you want the pipeline to execute?*</label>
                <RadioGroup
                    value={this.props.form.triggerType}
                    name="trigger-type"
                    onChange={this.props.handleTriggerChange}
                >
                    <RadioGroupItem value={TriggerType.Auto}> Automatic </RadioGroupItem>
                    <RadioGroupItem value={TriggerType.Manual}> Manual </RadioGroupItem>
                </RadioGroup>
            </div>
        )
    }

    renderDockerArgs() {
        return (
            <>
                <div className=" flex left cursor" onClick={() => this.props.handleDocker()}>
                    <div className="sqr-44">
                        <Docker />
                    </div>
                    <div>
                        <div className="ci-stage__title">Docker build</div>
                        <div className="ci-stage__description ">
                            Override docker build configurations for this pipeline.
                        </div>
                    </div>
                    <img
                        className="icon-dim-32 ml-auto"
                        src={dropdown}
                        alt="dropDown"
                        style={{ transform: this.props.showDocker ? 'rotate(180deg)' : 'rotate(0)' }}
                    />
                </div>
                {this.props.showDocker ? (
                    <div className="docker-build-args mt-20">
                        <div
                            className="docker-build-args__header"
                            onClick={(event) => {
                                this.props.handleDockerArgs()
                            }}
                        >
                            <span className="docker-build-args__text">Docker Arguments Override</span>
                            <img
                                src={dropdown}
                                alt="dropDown"
                                style={{ transform: this.props.showDockerArgs ? 'rotate(180deg)' : 'rotate(0)' }}
                            />
                        </div>
                        {this.props.showDockerArgs ? (
                            <div className="docker-build-args__wrapper">
                                {this.props.form.args.map((arg, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="form__key-value-inputs form__key-value-inputs--docker-build docker-build-args__body"
                                        >
                                            <img
                                                src={trash}
                                                onClick={(event) => {
                                                    this.props.removeDockerArgs(index)
                                                }}
                                            />
                                            <div className="form__field">
                                                <label className="form__label">Key</label>
                                                <input
                                                    className="form__input"
                                                    autoComplete="off"
                                                    placeholder="Name"
                                                    type="text"
                                                    value={arg.key}
                                                    onChange={(event) => {
                                                        this.props.handleDockerArgChange(event, index, 'key')
                                                    }}
                                                />
                                            </div>
                                            <div className="form__field">
                                                <label className="form__label">Value</label>
                                                <textarea
                                                    value={arg.value}
                                                    onChange={(event) => {
                                                        this.props.handleDockerArgChange(event, index, 'value')
                                                    }}
                                                    placeholder="Enter Your Text here"
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        this.props.addDockerArg()
                                    }}
                                    className="form__add-parameter form__add-parameter--docker-build"
                                >
                                    <span className="fa fa-plus mr-5"></span>Add parameter
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </>
        )
    }

    renderMaterials() {
        let _webhookData: WebhookCIProps = {
            webhookConditionList: this.props.form.webhookConditionList,
            gitHost: this.props.form.gitHost,
            getSelectedWebhookEvent: this.props.getSelectedWebhookEvent,
            copyToClipboard: this.props.copyToClipboard,
            addWebhookCondition: this.props.addWebhookCondition,
            deleteWebhookCondition: this.props.deleteWebhookCondition,
            onWebhookConditionSelectorChange: this.props.onWebhookConditionSelectorChange,
            onWebhookConditionSelectorValueChange: this.props.onWebhookConditionSelectorValueChange,
        }

        return (
            <SourceMaterials
                showError={this.props.showError}
                validationRules={this.props.validationRules}
                materials={this.props.form.materials}
                selectSourceType={this.props.selectSourceType}
                handleSourceChange={this.props.handleSourceChange}
                includeWebhookEvents={true}
                ciPipelineSourceTypeOptions={this.props.form.ciPipelineSourceTypeOptions}
                webhookData={_webhookData}
                canEditPipeline={this.props.form.ciPipelineEditable}
            />
        )
    }

    renderWebhookWarning() {
        return (
            <div
                className="bcr-1 cn-9 pl-20 pr-20 pt-10 pb-10"
                style={{ position: 'fixed', zIndex: 2, minWidth: '799px', borderBottom: '1px solid #fcbcbc' }}
            >
                <div className="flex left">
                    <InfoIcon className="icon-dim-20 mr-8" />
                    Editing for this webhook CI pipeline is disabled as more than one git repository is connected to
                    this application.
                </div>
                <div className="ml-28">You can continue running the pipeline based on existing configurations.</div>
                <div className="ml-28">
                    NOTE : Webhook based CI pipeline is not supported for multiple git repos.&nbsp;
                    <a
                        className="learn-more__href ml-4 mr-4"
                        href="https://github.com/devtron-labs/devtron/issues"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Create a github issue
                    </a>
                    for feature request.
                </div>
            </div>
        )
    }

    render() {
        let errorObj = this.props.validationRules.name(this.props.form.name)

        return (
            <>
                {!this.props.form.ciPipelineEditable &&
                    this.props.form.materials.some((_material) => _material.type == SourceTypeMap.WEBHOOK) &&
                    this.renderWebhookWarning()}
                <div
                    className={`pl-20 pr-20 pb-20 ${
                        !this.props.form.ciPipelineEditable &&
                        this.props.form.materials.some((_material) => _material.type == SourceTypeMap.WEBHOOK)
                            ? 'webhook-warning-padding'
                            : 'pt-20'
                    }`}
                >
                    <label className="form__row">
                        <span className="form__label">Pipeline Name*</span>
                        <input
                            className="form__input"
                            autoComplete="off"
                            disabled={!!this.props.ciPipeline.id}
                            placeholder="e.g. my-first-pipeline"
                            type="text"
                            value={this.props.form.name}
                            onChange={this.props.handlePipelineName}
                        />
                        {this.props.showError && !errorObj.isValid ? (
                            <span className="form__error">
                                <img src={error} className="form__icon" />
                                {this.props.validationRules.name(this.props.form.name).message}
                            </span>
                        ) : null}
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
                            <p className="ci-stage__description mb-0">
                                Perform security scan after container image is built.
                            </p>
                        </div>
                        <div className="" style={{ width: '32px', height: '20px' }}>
                            <Toggle
                                disabled={window._env_.FORCE_SECURITY_SCANNING && this.props.form.scanEnabled}
                                selected={this.props.form.scanEnabled}
                                onSelect={this.props.handleScanToggle}
                            />
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
