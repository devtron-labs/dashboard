import React, { Component } from 'react'
import ReactSelect from 'react-select';
import CDHeader from './CDHeader'
import yamlJsParser from 'yaml';
import config from './sampleConfig.json';
import CodeEditor from '../CodeEditor/CodeEditor';
import { TriggerType, ViewType } from '../../config';
import { Select, Typeahead as DevtronTypeahead, Progressing, ButtonWithLoader, showError, isEmpty, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, TypeaheadOption, Checkbox, DeleteDialog, VisibleModal } from '../common';
import { AdvanceCDPipelineModalProps } from './types'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { Info } from '../common/icons/Icons'
import PreBuild from '../../assets/img/preBuildStage.png';
import dropdown from '../../assets/icons/appstatus/ic-dropdown.svg';
import trash from '../../assets/icons/misc/delete.svg';
import error from '../../assets/icons/misc/errorInfo.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import Deploy from '../../assets/icons/ic-CD.svg';
import settings from '../../assets/icons/ic-settings.svg';


export const SwitchItemValues = {
    Sample: 'sample',
    Config: 'config',
};

export default class AdvanceCDPipelineModal extends Component<AdvanceCDPipelineModalProps> {

    getSelectedConfigMapAndSecrets(stage) {
        let configMaps = this.props.pipelineConfig[stage].configMaps.map((item) => {
            return {
                type: 'configmaps',
                name: item
            }
        })
        let secrets = this.props.pipelineConfig[stage].secrets.map((item) => {
            return {
                type: 'secrets',
                name: item
            }
        });
        let selections = configMaps.concat(secrets);
        return selections;
    }


    handleTriggerChange = (event) => {
        let { pipelineConfig } = { ...this.props };
        pipelineConfig.triggerType = event.target.value;
        this.setState({ pipelineConfig });
    }


    renderDeploymentStageDetails(key: 'preStage' | 'postStage') {
        let configmapKey;
        if (key == 'preStage') configmapKey = 'preStageConfigMapSecretNames';
        else configmapKey = 'postStageConfigMapSecretNames';
        let selections = this.getSelectedConfigMapAndSecrets(configmapKey);
        let codeEditorBody = this.props.pipelineConfig[key].switch === SwitchItemValues.Config ? this.props.pipelineConfig[key].config : yamlJsParser.stringify(config[key], { indent: 2 });
        let runInEnv = key === 'preStage' ? this.props.pipelineConfig.runPreStageInEnv : this.props.pipelineConfig.runPostStageInEnv;
        return <div className="cd-stage">
            <div className="form__row">
                <img src={trash} alt="delete" className="delete-stage-icon cursor" onClick={(e) => this.props.deleteStage(key)} />
                <label className="form__label form__label--sentence bold">When do you want this stage to trigger?</label>
                <RadioGroup value={this.props.pipelineConfig[key].triggerType} name={`${key}-trigger-type`} onChange={(event) => { this.props.handleStageConfigChange(event.target.value, key, 'triggerType') }}>
                    <RadioGroupItem value={TriggerType.Auto}> Automatic  </RadioGroupItem>
                    <RadioGroupItem value={TriggerType.Manual}>  Manual  </RadioGroupItem>
                </RadioGroup>
            </div>
            <div className="form__row">
                <label className="form__label form__label--sentence bold">Select Configmap and Secrets</label>
                <ReactSelect
                    isMulti={true}
                    isClearable={true}
                    value={selections}
                    options={this.props.configMapAndSecrets}
                    components={{
                        ClearIndicator: null,
                    }}
                    styles={{
                        control: (base, state) => ({
                            ...base,
                            boxShadow: 'none',
                            height: '30px',
                        }),
                    }}
                    placeholder="Select Configmap and Secrets"
                    getOptionLabel={option => `${option.name}`}
                    getOptionValue={option => `${option.name}`}
                    onChange={(selected) => { this.props.handleConfigmapAndSecretsChange(selected, configmapKey) }}
                />
            </div>
            <div className="code-editor" >
                <CodeEditor
                    value={codeEditorBody}
                    height={300}
                    mode='yaml'
                    readOnly={this.props.pipelineConfig[key].switch !== SwitchItemValues.Config}
                    onChange={this.props.pipelineConfig[key].switch === SwitchItemValues.Config ? resp => {
                        this.props.handleStageConfigChange(resp, key, 'config');
                    } : null}>
                    <CodeEditor.Header >
                        <Switch value={this.props.pipelineConfig[key].switch} name={`${key}`} onChange={(event) => { this.props.handleStageConfigChange(event.target.value, key, 'switch') }}>
                            <SwitchItem value={SwitchItemValues.Config}> Config  </SwitchItem>
                            <SwitchItem value={SwitchItemValues.Sample}>  Sample Script</SwitchItem>
                        </Switch>
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
            <div className={this.props.pipelineConfig.isClusterCdActive ? "position-rel cd-checkbox" : "position-rel cd-checkbox cd-checkbox-tooltip"}>
                <Checkbox isChecked={runInEnv}
                    value={"CHECKED"}
                    disabled={!this.props.pipelineConfig.isClusterCdActive}
                    onChange={(event) => { this.props.handleRunInEnvCheckbox(event, key); }} >
                    <span className="mr-5">Execute in application Environment</span>
                </Checkbox>
                <span className="checkbox-tooltip-body">This Environment is not configured to run on devtron worker.</span>
            </div>
        </div>
    }

    renderNamespaceInfo(namespaceEditable: boolean) {
        if (namespaceEditable)
            return <div className="info__container info__container--cd-pipeline">
                <Info />
                <div className="flex column left">
                    <div className="info__title">Set Namespace</div>
                    <div className="info__subtitle">The entered namespace will be applicable to selected environment across all the pipelines for this application.</div>
                </div>
            </div>
        else return null;
    }


    renderAddStage(key: 'preStage' | 'postStage') {
        return <div className="white-card white-card--add-new-item dashed mb-20 mt-20" onClick={(event) => this.props.deleteStage(key)}>
            <Add className="icon-dim-24 mr-16 fcb-5 vertical-align-middle" />
            <span className="artifact__add cb-5">Add Stage</span>
        </div>
    }


    renderTriggerType() {
        return <div className="form__row">
            <label className="form__label form__label--sentence bold">When do you want the pipeline to execute?*</label>
            <RadioGroup value={this.props.pipelineConfig.triggerType} name="trigger-type" onChange={this.handleTriggerChange}>
                <RadioGroupItem value={TriggerType.Auto}> Automatic  </RadioGroupItem>
                <RadioGroupItem value={TriggerType.Manual}>  Manual  </RadioGroupItem>
            </RadioGroup>
        </div>
    }


    renderDeploymentStrategy() {
        return <div className="form__row">
            <p className="form__label form__label--caps">Deployment Strategy</p>
            <p className="deployment-strategy">Add one or more deployment strategies.
            You can choose from selected strategy while deploying manually to this environment.
            </p>
            <Select rootClassName="mb-16 dashed" onChange={(e) => this.props.selectStrategy(e.target.value)} >
                <Select.Button rootClassName="select-button--deployment-strategy " >
                    <span className="artifact__add"><Add className="icon-dim-24 mr-16 fcb-5 vertical-align-middle" />
                        Add Deployment Strategy
                    </span>
                </Select.Button>
                {this.props.strategies.map((strategy) => {
                    return <Select.Option rootClassName="select-option--deployment-strategy" key={strategy.deploymentTemplate} value={strategy.deploymentTemplate} >
                        {strategy.deploymentTemplate}
                    </Select.Option>
                })}
            </Select>
            {this.props.pipelineConfig.strategies.map((strategy) => {
                return <div key={strategy.deploymentTemplate} className="deployment-strategy__info" >
                    <div className="deployment-strategy__info-header">
                        <span>
                            <span>{strategy.deploymentTemplate}</span>
                            {strategy.default ? <span className="default-strategy" >Default</span>
                                : <span className="set-as-default" onClick={(event) => this.props.setDefaultStrategy(strategy.deploymentTemplate)}>Set Default</span>}
                        </span>
                        <span className="deployment-strategy__controls">
                            <button type="button" className="transparent" onClick={(event) => this.props.toggleStrategy(strategy.deploymentTemplate)}>
                                <img src={settings} alt="config" className="icon-dim-20" />
                            </button>
                            <button type="button" className="transparent" onClick={(event) => { event.stopPropagation(); this.props.deleteStrategy(strategy.deploymentTemplate) }} >
                                <img src={trash} alt="trash" className="icon-dim-20" />
                            </button>
                        </span>
                    </div>
                    {strategy.isCollapsed ? null : <div className="deployment-strategy__info-body">
                        <textarea className="code-textarea code-textarea--cd-pipeline"
                            value={strategy.jsonStr} onChange={(event) => this.props.handleStrategyChange(event, strategy.deploymentTemplate, 'json')} />
                    </div>}
                </div>
            })}
        </div>
    }

    render() {
        let envId = this.props.pipelineConfig.environmentId;
        let selectedEnv = this.props.environments.find(env => env.id == envId);
        let namespaceEditable = false;
        // let namespaceErroObj = this.validationRules.namespace(this.props.pipelineConfig.namespace);
        // let nameErrorObj = this.validationRules.name(this.props.pipelineConfig.name);
        // let envErrorObj = this.validationRules.environment(this.props.pipelineConfig.environmentId);
        if (!selectedEnv || selectedEnv.namespace && selectedEnv.namespace.length > 0) {
            namespaceEditable = false;
        }
        else {
            namespaceEditable = true;
        }
        return (
            <div>
                <form className="modal__body modal__body--ci br-0 modal__body--p-0 lh-1-43">
                    < CDHeader close={this.props.close} />
                    <div className="pl-20 pr-20 pb-20">
                        <div className="form__row">
                            <label className="form__label">Pipeline Name*</label>
                            <input className="form__input" autoComplete="off" disabled={!!this.props.pipelineConfig.id} placeholder="Pipeline name" type="text" value={this.props.pipelineConfig.name}
                                onChange={this.props.handlePipelineName} />
                            {/* {this.props.showError && !nameErrorObj.isValid ? <span className="form__error">
                                <img src={error} className="form__icon" />
                                {nameErrorObj.message}
                            </span> : null} */}
                        </div>
                        <div className="form__row form__row--flex">
                            <div className={`typeahead w-50 `}>
                                <DevtronTypeahead name="environment" label={"Deploy to Environment*"} labelKey='name' multi={false}
                                    defaultSelections={selectedEnv ? [selectedEnv] : []}
                                    disabled={!!this.props.pipelineConfig.id} onChange={this.props.selectEnvironment}>
                                    {this.props.environments.map((env) => {
                                        return <TypeaheadOption key={env.id} item={env} id={env.id}>
                                            {env.name}
                                        </TypeaheadOption>
                                    })}
                                </DevtronTypeahead >
                                {/* {this.props.showError && !envErrorObj.isValid ? <span className="form__error">
                                    <img src={error} className="form__icon" />
                                    {envErrorObj.message}
                                </span> : null} */}
                            </div>
                            <label className="flex-1 ml-16">
                                <span className="form__label">Namespace*</span>
                                <input className="form__input" autoComplete="off" placeholder="Namespace" type="text"
                                    disabled={!namespaceEditable}
                                    value={selectedEnv && selectedEnv.namespace ? selectedEnv.namespace : this.props.pipelineConfig.namespace}
                                    onChange={(event) => { this.props.handleNamespaceChange(event, selectedEnv) }} />
                                {/* {this.props.showError && !namespaceErroObj.isValid ? <span className="form__error">
                                    <img src={error} className="form__icon" />
                                    {namespaceErroObj.message}
                                </span> : null} */}
                            </label>
                        </div>
                        {this.renderNamespaceInfo(namespaceEditable)}
                        <div className="flex left cursor" onClick={(e) => this.props.handlePreBuild()}>
                            <div className="sqr-44 "><img className="workflow-node__icon-common" src={PreBuild} /></div>
                            <div>
                                <div className="form__input-header">Pre-deployment Stage</div>
                                <div className=" form__label--sentence">Configure actions like DB migration, that you want to run before the deployment.</div>
                            </div>
                            <img className="icon-dim-32 m-auto-mr-0" src={dropdown} alt="dropDown" style={{ "transform": this.props.showPreBuild ? "rotate(180deg)" : "rotate(0)" }} />
                        </div>
                        {!this.props.showPreBuild ? "" : <>{this.props.showPreStage ? this.renderDeploymentStageDetails('preStage') : this.renderAddStage('preStage')}</>}
                        <hr className="divider" />

                        <div className="flex left cursor" onClick={() => this.props.handleDocker()}>
                            <div className="sqr-44"><img className="icon-dim-24" src={Deploy} /></div>
                            <div>
                                <div className="form__input-header">Deployment Stage</div>
                                <div>Configure deployment preferences for this pipeline</div>
                            </div>
                            <img className="icon-dim-32 m-auto-mr-0" src={dropdown} alt="dropDown" style={{ "transform": this.props.showDocker ? "rotate(180deg)" : "rotate(0)" }} />
                        </div>
                        {this.props.showDocker ? <div className="mt-20">
                            {this.renderTriggerType()}
                            {this.renderDeploymentStrategy()} </div> : ""}

                        <hr className="divider" />

                        <div className="flex left cursor" onClick={(e) => this.props.handlePostBuild()}>
                            <div className="sqr-44"><img className="workflow-node__icon-common" src={PreBuild} /></div>
                            <div>
                                <div className="form__input-header">Post-deployment Stage</div>
                                <div className="form__label--sentence">Configure actions like Jira ticket close, that you want to run after the deployment.</div>
                            </div>
                            <img className="icon-dim-32 m-auto-mr-0" src={dropdown} alt="dropDown" style={{ "transform": this.props.showPostBuild ? "rotate(180deg)" : "rotate(0)" }} />
                        </div>
                        {this.props.showPostBuild ? <>
                            {this.props.showPostStage ? this.renderDeploymentStageDetails('postStage') : this.renderAddStage('postStage')} </> : ""}
                        <hr className="divider" />
                        <div className="form__row form__row--flex">
                            {this.props.cdPipelineId ? <button type="button" className="cta delete mr-16"
                                onClick={() => { this.setState({ showDeleteModal: true }) }}>Delete Pipeline
                             </button> : null}
                            <ButtonWithLoader rootClassName="cta flex-1" onClick={this.props.savePipeline} isLoading={this.props.loadingData}
                                loaderColor="white">
                                {this.props.cdPipelineId ? "Update Pipeline" : "Create Pipeline"}
                            </ButtonWithLoader>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}
