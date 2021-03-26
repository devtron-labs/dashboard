import React, { Component } from 'react';
import { TriggerType, ViewType } from '../../config';
import { ServerErrors } from '../../modals/commonTypes';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { Select, Typeahead as DevtronTypeahead, Progressing, ButtonWithLoader, showError, isEmpty, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, TypeaheadOption, Checkbox, DeleteDialog, VisibleModal } from '../common';
import { toast } from 'react-toastify';
import { Info } from '../common/icons/Icons'
import { ErrorScreenManager } from '../common';
import { getDeploymentStrategyList, saveCDPipeline, getCDPipelineConfig, updateCDPipeline, deleteCDPipeline, getConfigMapAndSecrets } from './service';
import { CDPipelineProps, CDPipelineState, CD_PATCH_ACTION, Environment } from './types';
import { ValidationRules } from './validationRules';
import yamlJsParser from 'yaml';
import settings from '../../assets/icons/ic-settings.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import trash from '../../assets/icons/misc/delete.svg';
import error from '../../assets/icons/misc/errorInfo.svg';
import CodeEditor from '../CodeEditor/CodeEditor';
import config from './sampleConfig.json';
import ReactSelect from 'react-select';
import { getEnvironmentListMinPublic } from '../../services/service';
import './cdPipeline.css';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import PreBuild from '../../assets/img/preBuildStage.png';
import dropdown from '../../assets/icons/appstatus/ic-dropdown.svg';
import BasicCDPipelineModal from './BasicCDPipelineModal';
import Deploy from '../../assets/icons/ic-CD.svg';
import AdvanceCDPipelineModal from './AdvanceCDPipelineModal';


export const SwitchItemValues = {
    Sample: 'sample',
    Config: 'config',
};

export default class CDPipeline extends Component<CDPipelineProps, CDPipelineState> {
    allStrategies: { [key: string]: any } = {};
    validationRules;
    preStage;
    postStage;
    configMapAndSecrets = [];

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            loadingData: false,
            code: 0,
            showError: false,
            environments: [],
            strategies: [],
            pipelineConfig: {
                id: null,
                environmentId: 0,
                ciPipelineId: +this.props.match.params.ciPipelineId,
                triggerType: TriggerType.Auto,
                name: "",
                strategies: [],
                namespace: "",
                preStage: {
                    config: "",
                    triggerType: TriggerType.Auto,
                    switch: SwitchItemValues.Config,
                },
                postStage: {
                    config: "",
                    triggerType: TriggerType.Auto,
                    switch: SwitchItemValues.Config,
                },
                preStageConfigMapSecretNames: {
                    configMaps: [],
                    secrets: []
                },
                postStageConfigMapSecretNames: {
                    configMaps: [],
                    secrets: []
                },
                runPreStageInEnv: false,
                runPostStageInEnv: false,
                isClusterCdActive: false,
            },
            showPreStage: false,
            showPostStage: false,
            showDeleteModal: false,
            shouldDeleteApp: true,
            showPreBuild: false,
            showDocker: false,
            showPostBuild: false,
        }
        this.validationRules = new ValidationRules();
        this.handleRunInEnvCheckbox = this.handleRunInEnvCheckbox.bind(this);
        this.savePipeline = this.savePipeline.bind(this);
        this.handleDocker = this.handleDocker.bind(this);
        this.handlePostBuild = this.handlePostBuild.bind(this);
        this.handlePreBuild = this.handlePreBuild.bind(this);
    }

    componentDidMount() {
        this.getDeploymentStrategies();
    }

    handleDocker() {
        this.setState({
            view: ViewType.FORM,
            showDocker: !this.state.showDocker
        },
        )
    }

    handlePostBuild() {
        this.setState({
            view: ViewType.FORM,
            showPostBuild: !this.state.showPostBuild
        },
        )
    }

    handlePreBuild() {
        this.setState({
            view: ViewType.FORM,
            showPreBuild: !this.state.showPreBuild
        },
        )
    }

    getDeploymentStrategies(): void {
        getDeploymentStrategyList(this.props.match.params.appId).then((response) => {
            let strategies = response.result.pipelineStrategy || [];
            for (let i = 0; i < strategies.length; i++) {
                if (!this.allStrategies[strategies[i].deploymentTemplate])
                    this.allStrategies[strategies[i].deploymentTemplate] = {}
                this.allStrategies[strategies[i].deploymentTemplate] = strategies[i].config;
            }
            this.setState({
                strategies,
                view: this.props.match.params.cdPipelineId ? ViewType.LOADING : ViewType.FORM
            },
                () => {
                    if (this.props.match.params.cdPipelineId) {
                        this.getCDPipeline();
                    }
                    else {
                        getEnvironmentListMinPublic().then((response) => {
                            let list = response.result || [];
                            list = list.map((env) => {
                                return {
                                    id: env.id,
                                    name: env.environment_name,
                                    namespace: env.namespace || "",
                                    active: false,
                                    isClusterCdActive: env.isClusterCdActive,
                                }
                            });
                            this.setState({ environments: list })
                        }).catch((error) => {
                            showError(error)
                        })
                        let defaultStrategy = this.state.strategies.find((strategy => strategy.default));
                        this.selectStrategy(defaultStrategy.deploymentTemplate);
                    }
                });
        }).catch((error: ServerErrors) => {
            showError(error);
            this.setState({ code: error.code, view: ViewType.ERROR, loadingData: false });
        })
    }

    getCDPipeline(): void {
        getCDPipelineConfig(this.props.match.params.appId, this.props.match.params.cdPipelineId).then((data) => {
            let pipelineConfigFromRes = data.pipelineConfig;
            this.updateStateFromResponse(pipelineConfigFromRes, data.environments);
        }).then(() => {
            getConfigMapAndSecrets(this.props.match.params.appId, this.state.pipelineConfig.environmentId).then((response) => {
                this.configMapAndSecrets = response.result;
                console.log(response.result);
                this.setState({ view: ViewType.FORM });
            }).catch((error: ServerErrors) => {
                showError(error);
                this.setState({ code: error.code, loadingData: false });
            })
        }).catch((error: ServerErrors) => {
            showError(error);
            this.setState({ code: error.code, view: ViewType.ERROR, loadingData: false });
        })
    }

    updateStateFromResponse(pipelineConfigFromRes, environments): void {
        let { pipelineConfig, strategies } = { ...this.state };
        environments = environments.map((env) => {
            return {
                ...env,
                active: env.id === pipelineConfigFromRes.environmentId
            }
        })
        let savedStrategies = []
        for (let i = 0; i < pipelineConfigFromRes.strategies.length; i++) {
            savedStrategies.push({
                ...pipelineConfigFromRes.strategies[i],
                defaultConfig: this.allStrategies[pipelineConfigFromRes.strategies[i].deploymentTemplate],
                jsonStr: JSON.stringify(pipelineConfigFromRes.strategies[i].config, null, 4),
                selection: yamlJsParser.stringify(this.allStrategies[pipelineConfigFromRes.strategies[i].config], { indent: 4 }),
                isCollapsed: true,
            });
            strategies = strategies.filter(strategy => strategy.deploymentTemplate !== pipelineConfigFromRes.strategies[i].deploymentTemplate)
        }
        let env = environments.find(e => (e.id === pipelineConfigFromRes.environmentId));
        pipelineConfig = {
            ...pipelineConfigFromRes,
            ...(pipelineConfigFromRes.environmentId && env ? { namespace: env.namespace } : {}),
            strategies: savedStrategies,
            preStage: {
                ...pipelineConfigFromRes.preStage,
                config: pipelineConfigFromRes.preStage.config || "",
                triggerType: pipelineConfigFromRes.preStage.triggerType || TriggerType.Auto,
                switch: SwitchItemValues.Config,
                isCollapse: isEmpty(pipelineConfigFromRes.preStage.config)
            },
            postStage: {
                ...pipelineConfigFromRes.postStage,
                config: pipelineConfigFromRes.postStage.config || "",
                triggerType: pipelineConfigFromRes.postStage.triggerType || TriggerType.Auto,
                switch: SwitchItemValues.Config,
                isCollapse: isEmpty(pipelineConfigFromRes.postStage.config)
            },
            preStageConfigMapSecretNames: {
                configMaps: pipelineConfigFromRes.preStageConfigMapSecretNames.configMaps ? pipelineConfigFromRes.preStageConfigMapSecretNames.configMaps : [],
                secrets: pipelineConfigFromRes.preStageConfigMapSecretNames.secrets ? pipelineConfigFromRes.preStageConfigMapSecretNames.secrets : [],
            },
            postStageConfigMapSecretNames: {
                configMaps: pipelineConfigFromRes.postStageConfigMapSecretNames.configMaps ? pipelineConfigFromRes.postStageConfigMapSecretNames.configMaps : [],
                secrets: pipelineConfigFromRes.postStageConfigMapSecretNames.secrets ? pipelineConfigFromRes.postStageConfigMapSecretNames.secrets : [],
            },
            runPreStageInEnv: pipelineConfigFromRes.runPreStageInEnv || false,
            runPostStageInEnv: pipelineConfigFromRes.runPostStageInEnv || false,
            isClusterCdActive: pipelineConfigFromRes.isClusterCdActive || false,
        }
        this.preStage = pipelineConfigFromRes.preStage.config || "";
        this.postStage = pipelineConfigFromRes.postStage.config || "";
        let showPreStage = !isEmpty(pipelineConfigFromRes.preStage.config) || !!pipelineConfig.preStageConfigMapSecretNames.configMaps.length || !!pipelineConfig.preStageConfigMapSecretNames.secrets.length;
        let showPostStage = !isEmpty(pipelineConfigFromRes.postStage.config) || !!pipelineConfig.postStageConfigMapSecretNames.configMaps.length || !!pipelineConfig.postStageConfigMapSecretNames.secrets.length;

        this.setState({
            view: ViewType.FORM,
            loadingData: false,
            strategies,
            pipelineConfig: pipelineConfig,
            environments,
            showPreStage,
            showPostStage,
            showError: false,
        });
    }

    toggleStrategy(selection: string) {
        let { pipelineConfig } = { ...this.state };
        let savedStrategies = this.state.pipelineConfig.strategies.map((strategy) => {
            return {
                ...strategy,
                isCollapsed: strategy.deploymentTemplate === selection ? !strategy.isCollapsed : strategy.isCollapsed
            }
        })
        pipelineConfig.strategies = savedStrategies;
        this.setState({ pipelineConfig, view: ViewType.FORM });
    }

    setDefaultStrategy(selection: string) {
        //only one strategy can be default in [...savedStrategies, ...strategies]
        let strategies = this.state.strategies.map((strategy) => {
            return {
                ...strategy,
                default: strategy.deploymentTemplate == selection
            }
        })
        let savedStrategies = this.state.pipelineConfig.strategies.map((strategy) => {
            return {
                ...strategy,
                default: strategy.deploymentTemplate == selection
            }
        })
        let { pipelineConfig } = { ...this.state };
        pipelineConfig.strategies = savedStrategies;
        this.setState({ pipelineConfig, strategies });
    }

    selectStrategy(value: string) {
        let selection = this.state.strategies.find(strategy => strategy.deploymentTemplate == value);
        let strategies = this.state.strategies.filter(strategy => strategy.deploymentTemplate != value);

        let state = { ...this.state };
        if (this.state.pipelineConfig.strategies.length == 0)
            selection.default = true;
        else selection.default = false;

        selection['defaultConfig'] = this.allStrategies[selection.deploymentTemplate];
        selection['jsonStr'] = JSON.stringify(this.allStrategies[selection.deploymentTemplate], null, 4);
        selection['yamlStr'] = yamlJsParser.stringify(this.allStrategies[selection.deploymentTemplate], { indent: 4 });
        selection['isCollapsed'] = true;

        state.strategies = strategies;
        state.pipelineConfig.strategies.push(selection);
        this.setState(state);
    }

    deleteStrategy(selection: string) {
        let removedStrategy = this.state.pipelineConfig.strategies.find(savedStrategy => selection === savedStrategy.deploymentTemplate);
        if (removedStrategy.default) {
            toast.error("Cannot remove default strategy");
            return;
        }
        let savedStrategies = this.state.pipelineConfig.strategies.filter(savedStrategy => selection !== savedStrategy.deploymentTemplate);
        let { pipelineConfig, strategies } = { ...this.state };
        strategies.push(removedStrategy);
        pipelineConfig.strategies = savedStrategies;
        this.setState({ strategies, pipelineConfig });
    }

    selectEnvironment = (selection: Environment[]) => {
        let { pipelineConfig } = { ...this.state };
        if (selection.length && selection.length === 1) {
            let list = this.state.environments.map((item) => {
                return {
                    ...item,
                    active: item.id == selection[0].id
                }
            });
            pipelineConfig.environmentId = selection[0].id;
            pipelineConfig.namespace = selection[0].namespace;
            pipelineConfig.preStageConfigMapSecretNames = {
                configMaps: [],
                secrets: [],
            };
            pipelineConfig.postStageConfigMapSecretNames = {
                configMaps: [],
                secrets: [],
            };
            pipelineConfig.isClusterCdActive = selection[0].isClusterCdActive;
            pipelineConfig.runPreStageInEnv = pipelineConfig.isClusterCdActive && pipelineConfig.runPreStageInEnv;
            pipelineConfig.runPostStageInEnv = pipelineConfig.isClusterCdActive && pipelineConfig.runPostStageInEnv;
            this.setState({ environments: list, pipelineConfig }, () => {
                getConfigMapAndSecrets(this.props.match.params.appId, this.state.pipelineConfig.environmentId).then((response) => {
                    this.configMapAndSecrets = response.result;
                    this.setState({ view: ViewType.FORM });
                }).catch((error: ServerErrors) => {
                    showError(error);
                    this.setState({ code: error.code, loadingData: false });
                })
            });
        }
        else {
            let list = this.state.environments.map((item) => {
                return {
                    ...item,
                    active: false,
                }
            });
            pipelineConfig.environmentId = 0;
            pipelineConfig.namespace = "";
            this.setState({ environments: list, pipelineConfig });
        }
    }

    // @stage: 'preStageConfigMapSecretNames' | 'postStageConfigMapSecretNames'
    handleConfigmapAndSecretsChange = (selection, stage) => {
        selection = selection || [];
        let state = { ...this.state };
        if (selection.length) {
            let configmaps = selection.filter(e => e.type === 'configmaps').map((e) => e.name);
            let secrets = selection.filter(e => e.type === 'secrets').map((e) => e.name);
            state.pipelineConfig[stage]['configMaps'] = configmaps;
            state.pipelineConfig[stage]['secrets'] = secrets;
        }
        else {
            state.pipelineConfig[stage]['configMaps'] = [];
            state.pipelineConfig[stage]['secrets'] = [];
        }
        this.setState(state);
    }

    handleRunInEnvCheckbox(event, stageType: 'preStage' | 'postStage') {
        let { pipelineConfig } = { ...this.state };
        if (stageType === 'preStage') pipelineConfig.runPreStageInEnv = !pipelineConfig.runPreStageInEnv;
        if (stageType === 'postStage') pipelineConfig.runPostStageInEnv = !pipelineConfig.runPostStageInEnv;
        this.setState({ pipelineConfig });
    }

    handleTriggerChange = (event) => {
        let { pipelineConfig } = { ...this.state };
        pipelineConfig.triggerType = event.target.value;
        this.setState({ pipelineConfig });
    }

    handlePipelineName = (event) => {
        let { pipelineConfig } = { ...this.state };
        pipelineConfig.name = event.target.value
        this.setState({ pipelineConfig });
    }

    handleNamespaceChange(event, environment): void {
        let { pipelineConfig } = { ...this.state };
        pipelineConfig.namespace = event.target.value;
        this.setState({ pipelineConfig });
    }

    handleStrategyChange(event, selection: string, key: 'json' | 'yaml'): void {
        let json, jsonStr, yamlStr;
        if (key === 'json') {
            jsonStr = event.target.value;
            try {
                json = JSON.parse(jsonStr);
                yamlStr = yamlJsParser.stringify(json, { indent: 4 });
            } catch (error) { }
        }
        else {
            yamlStr = event.target.value;
            try {
                json = yamlJsParser.parse(yamlStr);
                jsonStr = JSON.stringify(json, undefined, 2);

            } catch (error) { }
        }
        let state = { ...this.state };
        let strategies = this.state.pipelineConfig.strategies.map((strategy) => {
            if (strategy.deploymentTemplate === selection) {
                if (json) strategy['config'] = json;
                if (jsonStr) strategy['jsonStr'] = jsonStr;
                if (yamlStr) strategy['yamlStr'] = yamlStr;
            }
            return strategy;
        })
        state.pipelineConfig.strategies = strategies;
        this.setState(state);
    }
    //@value: MANUAL | AUTOMATIC | yaml string
    handleStageConfigChange = (value: string, stageType: 'preStage' | 'postStage', key: 'triggerType' | 'config' | 'switch') => {
        let { pipelineConfig } = { ...this.state };
        if (key !== 'config') pipelineConfig[stageType][key] = value;
        else {
            if (pipelineConfig[stageType].switch === SwitchItemValues.Config) pipelineConfig[stageType][key] = value;
        }
        this.setState({ pipelineConfig });
    }

    savePipeline() {
        this.setState({ showError: true, loadingData: true });
        let pipeline = {
            appWorkflowId: +this.props.match.params.workflowId,
            ...this.state.pipelineConfig,
            deploymentTemplate: this.state.pipelineConfig.strategies.find(savedStrategy => savedStrategy.default).deploymentTemplate,
            strategies: this.state.pipelineConfig.strategies.map((savedStrategy) => {
                return {
                    deploymentTemplate: savedStrategy.deploymentTemplate,
                    config: savedStrategy.config,
                    default: savedStrategy.default
                }
            })
        }
        let request = {
            appId: parseInt(this.props.match.params.appId),
        }
        pipeline.preStage.config = pipeline.preStage.config.replace(/^\s+|\s+$/g, '');
        pipeline.postStage.config = pipeline.postStage.config.replace(/^\s+|\s+$/g, '');
        let valid = !!this.state.pipelineConfig.environmentId && this.validationRules.name(this.state.pipelineConfig.name).isValid
            && !!this.state.pipelineConfig.namespace && !!this.state.pipelineConfig.triggerType;

        if (!valid) {
            this.setState({ loadingData: false });
            toast.error("Some required fields are missing")
            return;
        }

        let msg;
        if (!this.props.match.params.cdPipelineId) {
            request['pipelines'] = [pipeline];
            delete pipeline['id'];
            msg = 'Pipeline Created Successfully';
        }
        else {
            request['pipeline'] = pipeline;
            request['action'] = CD_PATCH_ACTION.UPDATE;
            msg = 'Pipeline Updated Successfully';
        }
        let promise = (this.props.match.params.cdPipelineId) ? updateCDPipeline(request) : saveCDPipeline(request)
        promise.then(response => {
            if (response.result) {
                toast.success(msg);
                let pipelineConfigFromRes = response.result.pipelines[0];
                this.updateStateFromResponse(pipelineConfigFromRes, this.state.environments);
                this.props.close();
                this.props.getWorkflows();
            }
        }).catch((error: ServerErrors) => {
            showError(error);
            this.setState({ code: error.code, loadingData: false });
        })
    }

    getSelectedConfigMapAndSecrets(stage) {
        let configMaps = this.state.pipelineConfig[stage].configMaps.map((item) => {
            return {
                type: 'configmaps',
                name: item
            }
        })
        let secrets = this.state.pipelineConfig[stage].secrets.map((item) => {
            return {
                type: 'secrets',
                name: item
            }
        });
        let selections = configMaps.concat(secrets);
        return selections;
    }

    setDeleteApp = () => {
        this.setState({ shouldDeleteApp: !this.state.shouldDeleteApp });
    }

    deleteCD = () => {
        let request = {
            action: CD_PATCH_ACTION.DELETE,
            appId: parseInt(this.props.match.params.appId),
            pipeline: {
                id: this.state.pipelineConfig.id
            }
        }
        deleteCDPipeline(request).then((response) => {
            if (response.result) {
                toast.success("Pipeline Deleted");
                this.setState({ loadingData: false });
                this.props.getWorkflows();
                this.props.close();
            }
        }).catch((error: ServerErrors) => {
            showError(error);
            this.setState({ code: error.code, loadingData: false });
        })
    }

    deleteStage(key: 'preStage' | 'postStage') {
        let { pipelineConfig } = { ...this.state };
        pipelineConfig[key].config = "";

        if (key === 'preStage') {
            pipelineConfig.preStageConfigMapSecretNames = {
                secrets: [],
                configMaps: [],
            }
            pipelineConfig.runPreStageInEnv = false;
            this.setState({ pipelineConfig, showPreStage: !this.state.showPreStage });
        }
        else {
            pipelineConfig.postStageConfigMapSecretNames = {
                secrets: [],
                configMaps: []
            }
            pipelineConfig.runPostStageInEnv = false;
            this.setState({ showPostStage: !this.state.showPostStage });
        }
    }

    closeCDDeleteModal = () => {
        this.setState({ showDeleteModal: false });
    }

    renderHeader() {
        return <>
        
    </>
    }

    renderDeploymentStrategy() {
        return <div className="form__row">
            <p className="form__label form__label--caps">Deployment Strategy</p>
            <p className="deployment-strategy">Add one or more deployment strategies.
            You can choose from selected strategy while deploying manually to this environment.
            </p>
            <Select rootClassName="mb-16 dashed" onChange={(e) => this.selectStrategy(e.target.value)} >
                <Select.Button rootClassName="select-button--deployment-strategy " >
                    <span className="artifact__add"><Add className="icon-dim-24 mr-16 fcb-5 vertical-align-middle" />
                        Add Deployment Strategy
                    </span>
                </Select.Button>
                {this.state.strategies.map((strategy) => {
                    return <Select.Option rootClassName="select-option--deployment-strategy" key={strategy.deploymentTemplate} value={strategy.deploymentTemplate} >
                        {strategy.deploymentTemplate}
                    </Select.Option>
                })}
            </Select>
            {this.state.pipelineConfig.strategies.map((strategy) => {
                return <div key={strategy.deploymentTemplate} className="deployment-strategy__info" >
                    <div className="deployment-strategy__info-header">
                        <span>
                            <span>{strategy.deploymentTemplate}</span>
                            {strategy.default ? <span className="default-strategy" >Default</span>
                                : <span className="set-as-default" onClick={(event) => this.setDefaultStrategy(strategy.deploymentTemplate)}>Set Default</span>}
                        </span>
                        <span className="deployment-strategy__controls">
                            <button type="button" className="transparent" onClick={(event) => this.toggleStrategy(strategy.deploymentTemplate)}>
                                <img src={settings} alt="config" className="icon-dim-20" />
                            </button>
                            <button type="button" className="transparent" onClick={(event) => { event.stopPropagation(); this.deleteStrategy(strategy.deploymentTemplate) }} >
                                <img src={trash} alt="trash" className="icon-dim-20" />
                            </button>
                        </span>
                    </div>
                    {strategy.isCollapsed ? null : <div className="deployment-strategy__info-body">
                        <textarea className="code-textarea code-textarea--cd-pipeline"
                            value={strategy.jsonStr} onChange={(event) => this.handleStrategyChange(event, strategy.deploymentTemplate, 'json')} />
                    </div>}
                </div>
            })}
        </div>
    }

    renderDeploymentStageDetails(key: 'preStage' | 'postStage') {
        let configmapKey;
        if (key == 'preStage') configmapKey = 'preStageConfigMapSecretNames';
        else configmapKey = 'postStageConfigMapSecretNames';
        let selections = this.getSelectedConfigMapAndSecrets(configmapKey);
        let codeEditorBody = this.state.pipelineConfig[key].switch === SwitchItemValues.Config ? this.state.pipelineConfig[key].config : yamlJsParser.stringify(config[key], { indent: 2 });
        let runInEnv = key === 'preStage' ? this.state.pipelineConfig.runPreStageInEnv : this.state.pipelineConfig.runPostStageInEnv;
        return <div className="cd-stage">
            <div className="form__row">
                <img src={trash} alt="delete" className="delete-stage-icon cursor" onClick={(e) => this.deleteStage(key)} />
                <label className="form__label form__label--sentence bold">When do you want this stage to trigger?</label>
                <RadioGroup value={this.state.pipelineConfig[key].triggerType} name={`${key}-trigger-type`} onChange={(event) => { this.handleStageConfigChange(event.target.value, key, 'triggerType') }}>
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
                    options={this.configMapAndSecrets}
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
                    onChange={(selected) => { this.handleConfigmapAndSecretsChange(selected, configmapKey) }}
                />
            </div>
            <div className="code-editor" >
                <CodeEditor
                    value={codeEditorBody}
                    height={300}
                    mode='yaml'
                    readOnly={this.state.pipelineConfig[key].switch !== SwitchItemValues.Config}
                    onChange={this.state.pipelineConfig[key].switch === SwitchItemValues.Config ? resp => {
                        this.handleStageConfigChange(resp, key, 'config');
                    } : null}>
                    <CodeEditor.Header >
                        <Switch value={this.state.pipelineConfig[key].switch} name={`${key}`} onChange={(event) => { this.handleStageConfigChange(event.target.value, key, 'switch') }}>
                            <SwitchItem value={SwitchItemValues.Config}> Config  </SwitchItem>
                            <SwitchItem value={SwitchItemValues.Sample}>  Sample Script</SwitchItem>
                        </Switch>
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
            <div className={this.state.pipelineConfig.isClusterCdActive ? "position-rel cd-checkbox" : "position-rel cd-checkbox cd-checkbox-tooltip"}>
                <Checkbox isChecked={runInEnv}
                    value={"CHECKED"}
                    disabled={!this.state.pipelineConfig.isClusterCdActive}
                    onChange={(event) => { this.handleRunInEnvCheckbox(event, key); }} >
                    <span className="mr-5">Execute in application Environment</span>
                </Checkbox>
                <span className="checkbox-tooltip-body">This Environment is not configured to run on devtron worker.</span>
            </div>
        </div>
    }

    renderAddStage(key: 'preStage' | 'postStage') {
        return <div className="white-card white-card--add-new-item dashed mb-20 mt-20" onClick={(event) => this.deleteStage(key)}>
            <Add className="icon-dim-24 mr-16 fcb-5 vertical-align-middle" />
            <span className="artifact__add cb-5">Add Stage</span>
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

    renderTriggerType() {
        return <div className="form__row">
            <label className="form__label form__label--sentence bold">When do you want the pipeline to execute?*</label>
            <RadioGroup value={this.state.pipelineConfig.triggerType} name="trigger-type" onChange={this.handleTriggerChange}>
                <RadioGroupItem value={TriggerType.Auto}> Automatic  </RadioGroupItem>
                <RadioGroupItem value={TriggerType.Manual}>  Manual  </RadioGroupItem>
            </RadioGroup>
        </div>
    }

    renderDeleteCD() {
        if (this.props.match.params.cdPipelineId && this.state.showDeleteModal) {
            return <DeleteDialog title={`Delete '${this.state.pipelineConfig.name}' ?`}
                description={`Are you sure you want to delete this CD Pipeline from '${this.props.appName}' ?`}
                delete={this.deleteCD}
                closeDelete={this.closeCDDeleteModal} />
        }
        return null;
    }

    renderAdvanceCDPipeline() {
        let envId = this.state.pipelineConfig.environmentId;
        let selectedEnv = this.state.environments.find(env => env.id == envId);
        let namespaceEditable = false;
        let namespaceErroObj = this.validationRules.namespace(this.state.pipelineConfig.namespace);
        let nameErrorObj = this.validationRules.name(this.state.pipelineConfig.name);
        let envErrorObj = this.validationRules.environment(this.state.pipelineConfig.environmentId);
        if (!selectedEnv || selectedEnv.namespace && selectedEnv.namespace.length > 0) {
            namespaceEditable = false;
        }
        else {
            namespaceEditable = true;
        }
        return <>
            <form className="modal__body modal__body--ci br-0 modal__body--p-0 lh-1-43" onSubmit={this.savePipeline}>
                {this.renderHeader()}
                    <hr className="divider mb-0"/>
                    <div className="p-20 ">
                        <div className="form__row">
                            <label className="form__label">Pipeline Name*</label>
                            <input className="form__input" autoComplete="off" disabled={!!this.state.pipelineConfig.id} placeholder="Pipeline name" type="text" value={this.state.pipelineConfig.name}
                                onChange={this.handlePipelineName} />
                            {this.state.showError && !nameErrorObj.isValid ? <span className="form__error">
                                <img src={error} className="form__icon" />
                                {nameErrorObj.message}
                            </span> : null}
                        </div>
                        <div className="form__row form__row--flex">
                            <div className={`typeahead w-50 `}>
                                <DevtronTypeahead name="environment" label={"Deploy to Environment*"} labelKey='name' multi={false}
                                    defaultSelections={selectedEnv ? [selectedEnv] : []}
                                    disabled={!!this.state.pipelineConfig.id} onChange={this.selectEnvironment}>
                                    {this.state.environments.map((env) => {
                                        return <TypeaheadOption key={env.id} item={env} id={env.id}>
                                            {env.name}
                                        </TypeaheadOption>
                                    })}
                                </DevtronTypeahead >
                                {this.state.showError && !envErrorObj.isValid ? <span className="form__error">
                                    <img src={error} className="form__icon" />
                                    {envErrorObj.message}
                                </span> : null}
                            </div>
                            <label className="flex-1 ml-16">
                                <span className="form__label">Namespace*</span>
                                <input className="form__input" autoComplete="off" placeholder="Namespace" type="text"
                                    disabled={!namespaceEditable}
                                    value={selectedEnv && selectedEnv.namespace ? selectedEnv.namespace : this.state.pipelineConfig.namespace}
                                    onChange={(event) => { this.handleNamespaceChange(event, selectedEnv) }} />
                                {this.state.showError && !namespaceErroObj.isValid ? <span className="form__error">
                                    <img src={error} className="form__icon" />
                                    {namespaceErroObj.message}
                                </span> : null}
                            </label>
                        </div>
                        {this.renderNamespaceInfo(namespaceEditable)}
                        <div className="flex left cursor" onClick={(e) => this.handlePreBuild()}>
                            <div className="sqr-44 "><img className="workflow-node__icon-common" src={PreBuild} /></div>
                            <div>
                                <div className="form__input-header">Pre-deployment Stage</div>
                                <div className=" form__label--sentence">Configure actions like DB migration, that you want to run before the deployment.</div>
                            </div>
                            <img className="icon-dim-32 m-auto-mr-0" src={dropdown} alt="dropDown" style={{ "transform": this.state.showPreBuild ? "rotate(180deg)" : "rotate(0)" }} />
                        </div>
                        {!this.state.showPreBuild ? "" : <>{this.state.showPreStage ? this.renderDeploymentStageDetails('preStage') : this.renderAddStage('preStage')}</>}

                        <hr className="divider" />

                        <div className="flex left cursor" onClick={() => this.handleDocker()}>
                            <div className="sqr-44"><img className="icon-dim-24" src={Deploy}/></div>
                            <div>
                                <div className="form__input-header">Deployment Stage</div>
                                <div>Configure deployment preferences for this pipeline</div>
                            </div>
                            <img className="icon-dim-32 m-auto-mr-0" src={dropdown} alt="dropDown" style={{ "transform": this.state.showDocker ? "rotate(180deg)" : "rotate(0)" }} />
                        </div>
                        {this.state.showDocker ? <div className="mt-20">
                            {this.renderTriggerType()}
                            {this.renderDeploymentStrategy()} </div> : ""}

                        <hr className="divider" />

                        <div className="flex left cursor" onClick={(e) => this.handlePostBuild()}>
                            <div className="sqr-44"><img className="workflow-node__icon-common" src={PreBuild} /></div>
                            <div>
                                <div className="form__input-header">Post-deployment Stage</div>
                                <div className="form__label--sentence">Configure actions like Jira ticket close, that you want to run after the deployment.</div>
                            </div>
                            <img className="icon-dim-32 m-auto-mr-0" src={dropdown} alt="dropDown" style={{ "transform": this.state.showPostBuild ? "rotate(180deg)" : "rotate(0)" }} />
                        </div>
                        {this.state.showPostBuild ? <>
                            {this.state.showPostStage ? this.renderDeploymentStageDetails('postStage') : this.renderAddStage('postStage')} </> : ""}
                        <hr className="divider" />
                        <div className="form__row form__row--flex">
                            {this.props.match.params.cdPipelineId ? <button type="button" className="cta delete mr-16"
                                onClick={() => { this.setState({ showDeleteModal: true }) }}>Delete Pipeline
                    </button> : null}
                            <ButtonWithLoader rootClassName="cta flex-1" onClick={this.savePipeline} isLoading={this.state.loadingData}
                                loaderColor="white">
                                {this.props.match.params.cdPipelineId ? "Update Pipeline" : "Create Pipeline"}
                            </ButtonWithLoader>
                        </div>
                    </div>
            </form>
        </>
    }



    renderBasicCDPipelin() {
        let envId = this.state.pipelineConfig.environmentId;
        let selectedEnv = this.state.environments.find(env => env.id == envId);
        let namespaceEditable = false;
        let namespaceErroObj = this.validationRules.namespace(this.state.pipelineConfig.namespace);
        let nameErrorObj = this.validationRules.name(this.state.pipelineConfig.name);
        let envErrorObj = this.validationRules.environment(this.state.pipelineConfig.environmentId);
        if (!selectedEnv || selectedEnv.namespace && selectedEnv.namespace.length > 0) {
            namespaceEditable = false;
        }
        else {
            namespaceEditable = true;
        }
        return <>
            <div className="modal__body br-0 modal__body--w-800 modal__body--p-0">
                <div className="">{this.renderHeader}</div>
                <hr className="divider" />
                <div className="m-20">
                    <div className="cn-9 fw-6 fs-14 mb-18">Select Environment</div>
                    <div className="form__row form__row--flex">
                        <div className={`typeahead w-50 `}>
                            <DevtronTypeahead name="environment" label={"Deploy to Environment*"} labelKey='name' multi={false}
                                defaultSelections={selectedEnv ? [selectedEnv] : []}
                                disabled={!!this.state.pipelineConfig.id} onChange={this.selectEnvironment}>
                                {this.state.environments.map((env) => {
                                    return <TypeaheadOption key={env.id} item={env} id={env.id}>
                                        {env.name}
                                    </TypeaheadOption>
                                })}
                            </DevtronTypeahead >
                            {this.state.showError && !envErrorObj.isValid ? <span className="form__error">
                                <img src={error} className="form__icon" />
                                {envErrorObj.message}
                            </span> : null}
                        </div>
                        <label className="flex-1 ml-16">
                            <span className="form__label">Namespace*</span>
                            <input className="form__input" autoComplete="off" placeholder="Namespace" type="text"
                                disabled={!namespaceEditable}
                                value={selectedEnv && selectedEnv.namespace ? selectedEnv.namespace : this.state.pipelineConfig.namespace}
                                onChange={(event) => { this.handleNamespaceChange(event, selectedEnv) }} />
                            {this.state.showError && !namespaceErroObj.isValid ? <span className="form__error">
                                <img src={error} className="form__icon" />
                                {namespaceErroObj.message}
                            </span> : null}
                        </label>
                    </div>

                </div>
                <hr className="mb-12 divider" />
                <div className="pl-20 pr-20">
                    <div className="cn-9 fw-6 fs-14 mb-4">Deployment strategy</div>
                    <span className="form__label">To add and configure strategies switch to advanced options.</span>
                </div>
                <hr className="" />
                <div className="flex left mb-12">
                    <div className={"cursor br-4 pt-8 pb-8 pl-16 pr-16 ml-20 cn-7 fs-14 fw-6"} style={{ border: "1px solid #d0d4d9", width: "155px" }}>
                        Advanced options
                    </div>
                    <div className="m-auto-mr-0" style={{ width: "155px" }}>
                        <ButtonWithLoader rootClassName="cta flex-1" loaderColor="white"
                            onClick={this.savePipeline}
                            isLoading={this.state.loadingData}>
                        </ButtonWithLoader>
                    </div>
                </div>

            </div>
        </>

    }

    render() {
        if (this.state.view == ViewType.ERROR) {
            return <VisibleModal className="" close={this.props.close}>
                <ErrorScreenManager code={this.state.code} />
            </VisibleModal>
        }
        else {
            return <>
                <VisibleModal className="" >
                    
                    <BasicCDPipelineModal 
                    view = {this.state.view}
                    pipelineConfig= {this.state.pipelineConfig}
                    environments= {this.state.environments}
                    selectEnvironment= {this.selectEnvironment}
                    savePipeline= {this.savePipeline}
                    loadingData= {this.state.loadingData}
                    showError= {this.state.showError}
                    handleNamespaceChange= {this.handleNamespaceChange}
                    close= {this.props.close}
                    cdPipelineId= {this.props.match.params.cdPipelineId}
                    strategies={ this.state.strategies}
                    selectStrategy= {this.selectStrategy}

                     /> 
                     {/* {this.renderAdvanceCDPipeline()}
                      <AdvanceCDPipelineModal 
                     close= {this.props.close}
                     pipelineConfig= {this.state.pipelineConfig}
                     environments= {this.state.environments}
                     selectEnvironment= {this.selectEnvironment}
                     handleNamespaceChange= {this.handleNamespaceChange}
                     handlePipelineName= {this.handlePipelineName}
                     handlePreBuild= {this.handlePreBuild}
                     showPreBuild= {this.state.showPreBuild}
                     showPreStage= {this.state.showPreStage}
                     showPostStage= {this.state.showPostStage}
                     showPostBuild= {this.state.showPostBuild}
                     handleStageConfigChange= {this.handleStageConfigChange}
                     configMapAndSecrets= {this.configMapAndSecrets}
                     handleConfigmapAndSecretsChange={this.handleConfigmapAndSecretsChange}
                     handleRunInEnvCheckbox= {this.handleRunInEnvCheckbox}
                     handleDocker= {this.handleDocker}
                     showDocker= {this.state.showDocker}
                     handlePostBuild={this.handlePostBuild}
                     cdPipelineId= {this.props.match.params.cdPipelineId}
                     savePipeline={this.savePipeline}
                     loadingData= {this.state.loadingData}
                     strategies={ this.state.strategies}
                     allStrategies= {this.allStrategies}
                     setDefaultStrategy={this.setDefaultStrategy}
                     toggleStrategy= {this.toggleStrategy}
                     deleteStrategy= {this.deleteStrategy}
                     handleStrategyChange= {this.handleStrategyChange}
                     selectStrategy= {this.selectStrategy}
                     deleteStage= {this.deleteStage}
                     renderAddStage= {this.renderAddStage}
        /> */}
                </VisibleModal>
            </>
        }
    }
}