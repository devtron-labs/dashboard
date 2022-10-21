import React, { Component } from 'react'
import { TriggerType, ViewType } from '../../config'
import { ServerErrors } from '../../modals/commonTypes'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import {
    VisibleModal,
    Select,
    Progressing,
    ButtonWithLoader,
    showError,
    isEmpty,
    DevtronSwitch as Switch,
    DevtronSwitchItem as SwitchItem,
    Checkbox,
    DeleteDialog,
    CHECKBOX_VALUE,
    sortObjectArrayAlphabetically,
} from '../common'
import { toast } from 'react-toastify'
import { Info } from '../common/icons/Icons'
import { ErrorScreenManager } from '../common'
import {
    getDeploymentStrategyList,
    saveCDPipeline,
    getCDPipelineConfig,
    updateCDPipeline,
    deleteCDPipeline,
    getCDPipelineNameSuggestion,
    getConfigMapAndSecrets,
} from './cdPipeline.service'
import { CDPipelineProps, CDPipelineState, CD_PATCH_ACTION, Environment } from './cdPipeline.types'
import { ValidationRules } from './validationRules'
import { getEnvironmentListMinPublic } from '../../services/service'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as PrePostCD } from '../../assets/icons/ic-cd-stage.svg'
import { ReactComponent as CD } from '../../assets/icons/ic-CD.svg'
import yamlJsParser from 'yaml'
import settings from '../../assets/icons/ic-settings.svg'
import trash from '../../assets/icons/misc/delete.svg'
import error from '../../assets/icons/misc/errorInfo.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import config from './sampleConfig.json'
import ReactSelect from 'react-select'
import { styles, DropdownIndicator, Option } from './cdpipeline.util'
import './cdPipeline.css'
import dropdown from '../../assets/icons/ic-chevron-down.svg'
import ForceDeleteDialog from '../common/dialogs/ForceDeleteDialog'
import { ConditionalWrap } from '../common/helpers/Helpers'
import Tippy from '@tippyjs/react'

export const SwitchItemValues = {
    Sample: 'sample',
    Config: 'config',
}

export default class CDPipeline extends Component<CDPipelineProps, CDPipelineState> {
    allStrategies: { [key: string]: any } = {}
    validationRules
    preStage
    postStage
    configMapAndSecrets = []
    noStrategyAvailable = false
    constructor(props) {
        super(props)
        const urlParams = new URLSearchParams(this.props.location.search)
        const parentPipelineType = (urlParams.get('parentPipelineType') ?? '').toLocaleUpperCase().replace('-', '_')
        const parentPipelineId = urlParams.get('parentPipelineId')
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
                name: '',
                strategies: [],
                namespace: '',
                preStage: {
                    config: '',
                    triggerType: TriggerType.Auto,
                    switch: SwitchItemValues.Config,
                },
                postStage: {
                    config: '',
                    triggerType: TriggerType.Auto,
                    switch: SwitchItemValues.Config,
                },
                preStageConfigMapSecretNames: {
                    configMaps: [],
                    secrets: [],
                },
                postStageConfigMapSecretNames: {
                    configMaps: [],
                    secrets: [],
                },
                runPreStageInEnv: false,
                runPostStageInEnv: false,
                isClusterCdActive: false,
                parentPipelineId: +parentPipelineId,
                parentPipelineType: parentPipelineType,
            },
            showPreStage: false,
            showDeploymentStage: true,
            showPostStage: false,
            showDeleteModal: false,
            shouldDeleteApp: true,
            showForceDeleteDialog: false,
            isAdvanced: false,
            forceDeleteDialogMessage: '',
            forceDeleteDialogTitle: '',
        }
        this.validationRules = new ValidationRules()
        this.handleRunInEnvCheckbox = this.handleRunInEnvCheckbox.bind(this)
        this.savePipeline = this.savePipeline.bind(this)
        this.selectEnvironment = this.selectEnvironment.bind(this)
        this.escFunction = this.escFunction.bind(this)
    }

    componentDidMount() {
        this.getDeploymentStrategies()
        document.addEventListener('keydown', this.escFunction)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escFunction)
    }

    escFunction(event) {
        if ((event.keyCode === 27 || event.key === 'Escape') && typeof this.props.close === 'function') {
          this.props.close()
        }
    }

    getDeploymentStrategies(): void {
        getDeploymentStrategyList(this.props.match.params.appId)
            .then((response) => {
                let strategies = response.result.pipelineStrategy || []
                for (let i = 0; i < strategies.length; i++) {
                    if (!this.allStrategies[strategies[i].deploymentTemplate])
                        this.allStrategies[strategies[i].deploymentTemplate] = {}
                    this.allStrategies[strategies[i].deploymentTemplate] = strategies[i].config
                }
                this.noStrategyAvailable = strategies.length === 0
                this.setState(
                    {
                        strategies,
                        isAdvanced: this.props.match.params.cdPipelineId ? true : false,
                        view: this.props.match.params.cdPipelineId ? ViewType.LOADING : ViewType.FORM,
                    },
                    () => {
                        if (this.props.match.params.cdPipelineId) {
                            this.getCDPipeline()
                        } else {
                            getCDPipelineNameSuggestion(this.props.match.params.appId)
                                .then((response) => {
                                    this.setState({
                                        pipelineConfig: {
                                            ...this.state.pipelineConfig,
                                            name: response.result,
                                        },
                                    })
                                })
                                .catch((error) => {})
                            getEnvironmentListMinPublic()
                                .then((response) => {
                                    let list = response.result || []
                                    list = list.map((env) => {
                                        return {
                                            id: env.id,
                                            name: env.environment_name,
                                            namespace: env.namespace || '',
                                            active: false,
                                            isClusterCdActive: env.isClusterCdActive,
                                        }
                                    })
                                    sortObjectArrayAlphabetically(list, 'name')
                                    this.setState({ environments: list })
                                })
                                .catch((error) => {
                                    showError(error)
                                })
                            if (this.state.strategies.length > 0) {
                                let defaultStrategy = this.state.strategies.find((strategy) => strategy.default)
                                this.handleStrategy(defaultStrategy.deploymentTemplate)
                            }
                        }
                    },
                )
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({ code: error.code, view: ViewType.ERROR, loadingData: false })
            })
    }

    getCDPipeline(): void {
        getCDPipelineConfig(this.props.match.params.appId, this.props.match.params.cdPipelineId)
            .then((data) => {
                let pipelineConfigFromRes = data.pipelineConfig
                this.updateStateFromResponse(pipelineConfigFromRes, data.environments)
            })
            .then(() => {
                getConfigMapAndSecrets(this.props.match.params.appId, this.state.pipelineConfig.environmentId)
                    .then((response) => {
                        this.configMapAndSecrets = response.result
                        this.setState({ view: ViewType.FORM })
                    })
                    .catch((error: ServerErrors) => {
                        showError(error)
                        this.setState({ code: error.code, loadingData: false })
                    })
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({ code: error.code, view: ViewType.ERROR, loadingData: false })
            })
    }

    updateStateFromResponse(pipelineConfigFromRes, environments): void {
        let { pipelineConfig, strategies } = { ...this.state }
        sortObjectArrayAlphabetically(environments, 'name')
        environments = environments.map((env) => {
            return {
                ...env,
                active: env.id === pipelineConfigFromRes.environmentId,
            }
        })
        let savedStrategies = []
        if (pipelineConfigFromRes.strategies) {
            for (let i = 0; i < pipelineConfigFromRes.strategies.length; i++) {
                savedStrategies.push({
                    ...pipelineConfigFromRes.strategies[i],
                    defaultConfig: this.allStrategies[pipelineConfigFromRes.strategies[i].deploymentTemplate],
                    jsonStr: JSON.stringify(pipelineConfigFromRes.strategies[i].config, null, 4),
                    selection: yamlJsParser.stringify(this.allStrategies[pipelineConfigFromRes.strategies[i].config], {
                        indent: 2,
                    }),
                    isCollapsed: true,
                })
                strategies = strategies.filter(
                    (strategy) =>
                        strategy.deploymentTemplate !== pipelineConfigFromRes.strategies[i].deploymentTemplate,
                )
            }
        }
        let env = environments.find((e) => e.id === pipelineConfigFromRes.environmentId)
        pipelineConfig = {
            ...pipelineConfigFromRes,
            ...(pipelineConfigFromRes.environmentId && env ? { namespace: env.namespace } : {}),
            strategies: savedStrategies,
            preStage: {
                ...pipelineConfigFromRes.preStage,
                config: pipelineConfigFromRes.preStage.config || '',
                triggerType: pipelineConfigFromRes.preStage.triggerType || TriggerType.Auto,
                switch: SwitchItemValues.Config,
                isCollapse: isEmpty(pipelineConfigFromRes.preStage.config),
            },
            postStage: {
                ...pipelineConfigFromRes.postStage,
                config: pipelineConfigFromRes.postStage.config || '',
                triggerType: pipelineConfigFromRes.postStage.triggerType || TriggerType.Auto,
                switch: SwitchItemValues.Config,
                isCollapse: isEmpty(pipelineConfigFromRes.postStage.config),
            },
            preStageConfigMapSecretNames: {
                configMaps: pipelineConfigFromRes.preStageConfigMapSecretNames.configMaps
                    ? pipelineConfigFromRes.preStageConfigMapSecretNames.configMaps
                    : [],
                secrets: pipelineConfigFromRes.preStageConfigMapSecretNames.secrets
                    ? pipelineConfigFromRes.preStageConfigMapSecretNames.secrets
                    : [],
            },
            postStageConfigMapSecretNames: {
                configMaps: pipelineConfigFromRes.postStageConfigMapSecretNames.configMaps
                    ? pipelineConfigFromRes.postStageConfigMapSecretNames.configMaps
                    : [],
                secrets: pipelineConfigFromRes.postStageConfigMapSecretNames.secrets
                    ? pipelineConfigFromRes.postStageConfigMapSecretNames.secrets
                    : [],
            },
            runPreStageInEnv: pipelineConfigFromRes.runPreStageInEnv || false,
            runPostStageInEnv: pipelineConfigFromRes.runPostStageInEnv || false,
            isClusterCdActive: pipelineConfigFromRes.isClusterCdActive || false,
        }
        this.preStage = pipelineConfigFromRes.preStage.config || ''
        this.postStage = pipelineConfigFromRes.postStage.config || ''
        let showPreStage =
            !isEmpty(pipelineConfigFromRes.preStage.config) ||
            !!pipelineConfig.preStageConfigMapSecretNames.configMaps.length ||
            !!pipelineConfig.preStageConfigMapSecretNames.secrets.length
        let showPostStage =
            !isEmpty(pipelineConfigFromRes.postStage.config) ||
            !!pipelineConfig.postStageConfigMapSecretNames.configMaps.length ||
            !!pipelineConfig.postStageConfigMapSecretNames.secrets.length

        this.setState({
            view: ViewType.FORM,
            loadingData: false,
            strategies,
            pipelineConfig: pipelineConfig,
            environments,
            showPreStage,
            showPostStage,
            showError: false,
        })
    }

    toggleStrategy(selection: string): void {
        let { pipelineConfig } = { ...this.state }
        let savedStrategies = this.state.pipelineConfig.strategies.map((strategy) => {
            return {
                ...strategy,
                isCollapsed: strategy.deploymentTemplate === selection ? !strategy.isCollapsed : strategy.isCollapsed,
            }
        })
        pipelineConfig.strategies = savedStrategies
        this.setState({ pipelineConfig, view: ViewType.FORM })
    }

    setDefaultStrategy(selection: string): void {
        //only one strategy can be default in [...savedStrategies, ...strategies]
        let strategies = this.state.strategies.map((strategy) => {
            return {
                ...strategy,
                default: strategy.deploymentTemplate == selection,
            }
        })
        let savedStrategies = this.state.pipelineConfig.strategies.map((strategy) => {
            return {
                ...strategy,
                default: strategy.deploymentTemplate == selection,
            }
        })
        let { pipelineConfig } = { ...this.state }
        pipelineConfig.strategies = savedStrategies
        this.setState({ pipelineConfig, strategies })
    }

    selectStrategy(value: string): void {
        let selection = this.state.strategies.find((strategy) => strategy.deploymentTemplate == value)
        let strategies = this.state.strategies.filter((strategy) => strategy.deploymentTemplate != value)

        let state = { ...this.state }
        if (this.state.pipelineConfig.strategies.length == 0) selection.default = true
        else selection.default = false

        selection['defaultConfig'] = this.allStrategies[selection.deploymentTemplate]
        selection['jsonStr'] = JSON.stringify(this.allStrategies[selection.deploymentTemplate], null, 4)
        selection['yamlStr'] = yamlJsParser.stringify(this.allStrategies[selection.deploymentTemplate], { indent: 2 })
        selection['isCollapsed'] = true

        state.strategies = strategies
        state.pipelineConfig.strategies.push(selection)
        this.setState(state)
    }

    deleteStrategy(selection: string): void {
        let removedStrategy = this.state.pipelineConfig.strategies.find(
            (savedStrategy) => selection === savedStrategy.deploymentTemplate,
        )
        if (removedStrategy.default) {
            toast.error('Cannot remove default strategy')
            return
        }
        let savedStrategies = this.state.pipelineConfig.strategies.filter(
            (savedStrategy) => selection !== savedStrategy.deploymentTemplate,
        )
        let { pipelineConfig, strategies } = { ...this.state }
        strategies.push(removedStrategy)
        pipelineConfig.strategies = savedStrategies
        this.setState({ strategies, pipelineConfig })
    }

    handleStrategy(value: string): void {
        let newSelection
        newSelection = {}
        newSelection['deploymentTemplate'] = value
        newSelection['defaultConfig'] = this.allStrategies[value]
        newSelection['config'] = this.allStrategies[value]
        newSelection['isCollapsed'] = true
        newSelection['default'] = true
        newSelection['jsonStr'] = JSON.stringify(this.allStrategies[value], null, 4)
        newSelection['yamlStr'] = yamlJsParser.stringify(this.allStrategies[value], { indent: 2 })

        let { pipelineConfig } = { ...this.state }
        pipelineConfig.strategies.push(newSelection)
        pipelineConfig.strategies = [newSelection]
        this.setState({ pipelineConfig })
    }

    selectEnvironment = (selection: Environment): void => {
        let { pipelineConfig } = { ...this.state }
        if (selection) {
            let list = this.state.environments.map((item) => {
                return {
                    ...item,
                    active: item.id == selection.id,
                }
            })
            pipelineConfig.environmentId = selection.id
            pipelineConfig.namespace = selection.namespace
            pipelineConfig.preStageConfigMapSecretNames = {
                configMaps: [],
                secrets: [],
            }
            pipelineConfig.postStageConfigMapSecretNames = {
                configMaps: [],
                secrets: [],
            }
            pipelineConfig.isClusterCdActive = selection.isClusterCdActive
            pipelineConfig.runPreStageInEnv = pipelineConfig.isClusterCdActive && pipelineConfig.runPreStageInEnv
            pipelineConfig.runPostStageInEnv = pipelineConfig.isClusterCdActive && pipelineConfig.runPostStageInEnv
            this.setState({ environments: list, pipelineConfig }, () => {
                getConfigMapAndSecrets(this.props.match.params.appId, this.state.pipelineConfig.environmentId)
                    .then((response) => {
                        this.configMapAndSecrets = response.result
                        this.setState({ view: ViewType.FORM })
                    })
                    .catch((error: ServerErrors) => {
                        showError(error)
                        this.setState({ code: error.code, loadingData: false })
                    })
            })
        } else {
            let list = this.state.environments.map((item) => {
                return {
                    ...item,
                    active: false,
                }
            })
            pipelineConfig.environmentId = 0
            pipelineConfig.namespace = ''
            this.setState({ environments: list, pipelineConfig })
        }
    }

    // @stage: 'preStageConfigMapSecretNames' | 'postStageConfigMapSecretNames'
    handleConfigmapAndSecretsChange = (selection, stage) => {
        selection = selection || []
        let state = { ...this.state }
        if (selection.length) {
            let configmaps = selection.filter((e) => e.type === 'configmaps').map((e) => e.name)
            let secrets = selection.filter((e) => e.type === 'secrets').map((e) => e.name)
            state.pipelineConfig[stage]['configMaps'] = configmaps
            state.pipelineConfig[stage]['secrets'] = secrets
        } else {
            state.pipelineConfig[stage]['configMaps'] = []
            state.pipelineConfig[stage]['secrets'] = []
        }
        this.setState(state)
    }

    handleRunInEnvCheckbox(event, stageType: 'preStage' | 'postStage') {
        let { pipelineConfig } = { ...this.state }
        if (stageType === 'preStage') pipelineConfig.runPreStageInEnv = !pipelineConfig.runPreStageInEnv
        if (stageType === 'postStage') pipelineConfig.runPostStageInEnv = !pipelineConfig.runPostStageInEnv
        this.setState({ pipelineConfig })
    }

    handleTriggerChange = (event) => {
        let { pipelineConfig } = { ...this.state }
        pipelineConfig.triggerType = event.target.value
        this.setState({ pipelineConfig })
    }

    handlePipelineName = (event) => {
        let { pipelineConfig } = { ...this.state }
        pipelineConfig.name = event.target.value
        this.setState({ pipelineConfig })
    }

    handleNamespaceChange(event, environment): void {
        let { pipelineConfig } = { ...this.state }
        pipelineConfig.namespace = event.target.value
        this.setState({ pipelineConfig })
    }

    handleStrategyChange(event, selection: string, key: 'json' | 'yaml'): void {
        let json, jsonStr, yamlStr
        if (key === 'json') {
            jsonStr = event.target.value
            try {
                json = JSON.parse(jsonStr)
                yamlStr = yamlJsParser.stringify(json, { indent: 2 })
            } catch (error) {}
        } else {
            yamlStr = event.target.value
            try {
                json = yamlJsParser.parse(yamlStr)
                jsonStr = JSON.stringify(json, undefined, 2)
            } catch (error) {}
        }
        let state = { ...this.state }
        let strategies = this.state.pipelineConfig.strategies.map((strategy) => {
            if (strategy.deploymentTemplate === selection) {
                if (json) strategy['config'] = json
                if (jsonStr) strategy['jsonStr'] = jsonStr
                if (yamlStr) strategy['yamlStr'] = yamlStr
            }
            return strategy
        })
        state.pipelineConfig.strategies = strategies
        this.setState(state)
    }

    //@value: MANUAL | AUTOMATIC | yaml string
    handleStageConfigChange = (
        value: string,
        stageType: 'preStage' | 'postStage',
        key: 'triggerType' | 'config' | 'switch',
    ) => {
        let { pipelineConfig } = { ...this.state }
        if (key !== 'config') pipelineConfig[stageType][key] = value
        else {
            if (pipelineConfig[stageType].switch === SwitchItemValues.Config) pipelineConfig[stageType][key] = value
        }
        this.setState({ pipelineConfig })
    }

    savePipeline() {
        this.setState({ showError: true, loadingData: true })
        let pipeline = {
            appWorkflowId: +this.props.match.params.workflowId,
            ...this.state.pipelineConfig,
            deploymentTemplate:
                this.state.pipelineConfig.strategies.length > 0
                    ? this.state.pipelineConfig.strategies.find((savedStrategy) => savedStrategy.default)
                          .deploymentTemplate
                    : null,
            strategies: this.state.pipelineConfig.strategies.map((savedStrategy) => {
                return {
                    deploymentTemplate: savedStrategy.deploymentTemplate,
                    config: savedStrategy.config,
                    default: savedStrategy.default,
                }
            }),
        }
        let request = {
            appId: parseInt(this.props.match.params.appId),
        }
        pipeline.preStage.config = pipeline.preStage.config.replace(/^\s+|\s+$/g, '')
        pipeline.postStage.config = pipeline.postStage.config.replace(/^\s+|\s+$/g, '')
        let valid =
            !!this.state.pipelineConfig.environmentId &&
            this.validationRules.name(this.state.pipelineConfig.name).isValid &&
            !!this.state.pipelineConfig.namespace &&
            !!this.state.pipelineConfig.triggerType

        if (!valid) {
            this.setState({ loadingData: false })
            toast.error('Some required fields are missing')
            return
        }

        let msg
        if (!this.props.match.params.cdPipelineId) {
            request['pipelines'] = [pipeline]
            delete pipeline['id']
            msg = 'Pipeline Created Successfully'
        } else {
            request['pipeline'] = pipeline
            request['action'] = CD_PATCH_ACTION.UPDATE
            msg = 'Pipeline Updated Successfully'
        }
        let promise = this.props.match.params.cdPipelineId ? updateCDPipeline(request) : saveCDPipeline(request)
        promise
            .then((response) => {
                if (response.result) {
                    let pipelineConfigFromRes = response.result.pipelines[0]
                    this.updateStateFromResponse(pipelineConfigFromRes, this.state.environments)
                    let envName = this.state.pipelineConfig.environmentName
                    if (!envName) {
                        let selectedEnv: Environment = this.state.environments.find(
                            (env) => env.id == this.state.pipelineConfig.environmentId,
                        )
                        envName = selectedEnv.name
                    }
                    this.props.close(
                        true,
                        this.state.pipelineConfig.environmentId,
                        envName,
                        this.props.match.params.cdPipelineId
                            ? 'Deployment pipeline updated'
                            : 'Deployment pipeline created',
                    )
                    this.props.getWorkflows()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                this.setState({ code: error.code, loadingData: false })
            })
    }

    getSelectedConfigMapAndSecrets(stage) {
        let configMaps = this.state.pipelineConfig[stage].configMaps.map((item) => {
            return {
                type: 'configmaps',
                name: item,
            }
        })
        let secrets = this.state.pipelineConfig[stage].secrets.map((item) => {
            return {
                type: 'secrets',
                name: item,
            }
        })
        let selections = configMaps.concat(secrets)
        return selections
    }

    setDeleteApp = () => {
        this.setState({ shouldDeleteApp: !this.state.shouldDeleteApp })
    }

    setForceDeleteDialogData = (serverError) => {
        this.setState({ showForceDeleteDialog: true })
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                this.setState({ forceDeleteDialogMessage: internalMessage, forceDeleteDialogTitle: userMessage })
            })
        }
    }

    deleteCD = (force) => {
        let payload = {
            action: CD_PATCH_ACTION.DELETE,
            appId: parseInt(this.props.match.params.appId),
            pipeline: {
                id: this.state.pipelineConfig.id,
            },
        }

        deleteCDPipeline(payload, force)
            .then((response) => {
                if (response.result) {
                    toast.success('Pipeline Deleted')
                    this.setState({ loadingData: false })
                    this.props.getWorkflows()
                    this.props.close()
                }
            })
            .catch((error: ServerErrors) => {
                if (!force && error.code != 403) {
                    this.setForceDeleteDialogData(error)
                    this.setState({
                        code: error.code,
                        loadingData: false,
                        showDeleteModal: false,
                        showForceDeleteDialog: true,
                    })
                } else {
                    showError(error)
                }
            })
    }

    deleteStage(key: 'preStage' | 'postStage') {
        let { pipelineConfig } = { ...this.state }
        pipelineConfig[key].config = ''

        if (key === 'preStage') {
            pipelineConfig.preStageConfigMapSecretNames = {
                secrets: [],
                configMaps: [],
            }
            pipelineConfig.runPreStageInEnv = false
            this.setState({ pipelineConfig, showPreStage: !this.state.showPreStage })
        } else {
            pipelineConfig.postStageConfigMapSecretNames = {
                secrets: [],
                configMaps: [],
            }
            pipelineConfig.runPostStageInEnv = false
            this.setState({ showPostStage: !this.state.showPostStage })
        }
    }

    handleAdvanceClick = () => {
        let strategies = this.state.strategies.filter(
            (strategy) => strategy.deploymentTemplate != this.state.pipelineConfig.strategies[0].deploymentTemplate,
        )
        let state = { ...this.state }
        state.strategies = strategies
        state.isAdvanced = true
        this.setState(state)
    }

    closeCDDeleteModal = () => {
        this.setState({ showDeleteModal: false })
    }

    renderHeader() {
        let title = this.props.match.params.cdPipelineId ? 'Edit deployment pipeline' : 'Create deployment pipeline'
        return (
            <>
                <div className="p-20 flex flex-align-center flex-justify">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0">{title}</h2>
                    <button
                        type="button"
                        className="dc__transparent flex icon-dim-24"
                        onClick={() => {
                            this.props.close()
                        }}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="divider m-0"></div>
            </>
        )
    }

    renderDeploymentStrategy() {
        if (this.noStrategyAvailable) {
            return null
        }
        return (
            <div className="form__row">
                <p className="form__label form__label--caps">Deployment Strategy</p>
                <p className="deployment-strategy">
                    Add one or more deployment strategies. You can choose from selected strategy while deploying
                    manually to this environment.
                </p>
                <Select rootClassName="mb-16" onChange={(e) => this.selectStrategy(e.target.value)}>
                    <Select.Button rootClassName="select-button--deployment-strategy">
                        <span>
                            <Add className="icon-dim-24 mr-16 fcb-5 dc__vertical-align-middle" />
                            Add Deployment Strategy
                        </span>
                    </Select.Button>
                    {this.state.strategies.map((strategy) => {
                        return (
                            <Select.Option
                                rootClassName="select-option--deployment-strategy"
                                key={strategy.deploymentTemplate}
                                value={strategy.deploymentTemplate}
                            >
                                {strategy.deploymentTemplate}
                            </Select.Option>
                        )
                    })}
                </Select>
                {this.state.pipelineConfig.strategies.map((strategy) => {
                    return (
                        <div key={strategy.deploymentTemplate} className="deployment-strategy__info">
                            <div className="deployment-strategy__info-header">
                                <span>
                                    <span>{strategy.deploymentTemplate}</span>
                                    {strategy.default ? (
                                        <span className="default-strategy">Default</span>
                                    ) : (
                                        <span
                                            className="set-as-default"
                                            onClick={(event) => this.setDefaultStrategy(strategy.deploymentTemplate)}
                                        >
                                            Set Default
                                        </span>
                                    )}
                                </span>
                                <span className="deployment-strategy__controls">
                                    <button
                                        type="button"
                                        className="dc__transparent"
                                        onClick={(event) => this.toggleStrategy(strategy.deploymentTemplate)}
                                    >
                                        <img src={settings} alt="config" className="icon-dim-20" />
                                    </button>
                                    <button
                                        type="button"
                                        className="dc__transparent"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            this.deleteStrategy(strategy.deploymentTemplate)
                                        }}
                                    >
                                        <img src={trash} alt="trash" className="icon-dim-20" />
                                    </button>
                                </span>
                            </div>
                            {strategy.isCollapsed ? null : (
                                <div className="deployment-strategy__info-body">
                                    <textarea
                                        className="dc__code-textarea code-textarea--cd-pipeline"
                                        value={strategy.jsonStr}
                                        onChange={(event) =>
                                            this.handleStrategyChange(event, strategy.deploymentTemplate, 'json')
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    renderDeploymentStageDetails(key: 'preStage' | 'postStage') {
        let configmapKey
        if (key == 'preStage') configmapKey = 'preStageConfigMapSecretNames'
        else configmapKey = 'postStageConfigMapSecretNames'
        let selections = this.getSelectedConfigMapAndSecrets(configmapKey)
        let codeEditorBody =
            this.state.pipelineConfig[key].switch === SwitchItemValues.Config
                ? this.state.pipelineConfig[key].config
                : yamlJsParser.stringify(config[key], { indent: 2 })
        let runInEnv =
            key === 'preStage'
                ? this.state.pipelineConfig.runPreStageInEnv
                : this.state.pipelineConfig.runPostStageInEnv
        return (
            <div className="cd-stage mt-12">
                <div className="form__row">
                    <img
                        src={trash}
                        alt="delete"
                        className="delete-stage-icon cursor"
                        onClick={(e) => this.deleteStage(key)}
                    />
                    <label className="form__label form__label--sentence dc__bold">
                        When do you want this stage to trigger?
                    </label>
                    <RadioGroup
                        value={this.state.pipelineConfig[key].triggerType}
                        name={`${key}-trigger-type`}
                        onChange={(event) => {
                            this.handleStageConfigChange(event.target.value, key, 'triggerType')
                        }}
                    >
                        <RadioGroupItem value={TriggerType.Auto}> Automatic </RadioGroupItem>
                        <RadioGroupItem value={TriggerType.Manual}> Manual </RadioGroupItem>
                    </RadioGroup>
                </div>
                <div className="form__row">
                    <label className="form__label form__label--sentence dc__bold">Select Configmap and Secrets</label>
                    <ReactSelect
                        menuPortalTarget={this.state.isAdvanced ? null : document.getElementById('visible-modal')}
                        closeMenuOnScroll={true}
                        isMulti={true}
                        placeholder="Select Configmap and Secrets"
                        isClearable={true}
                        value={selections}
                        options={this.configMapAndSecrets}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.name}`}
                        onChange={(selected) => {
                            this.handleConfigmapAndSecretsChange(selected, configmapKey)
                        }}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        styles={{ ...styles }}
                    />
                </div>
                <div className="code-editor">
                    <CodeEditor
                        value={codeEditorBody}
                        height={300}
                        mode="yaml"
                        readOnly={this.state.pipelineConfig[key].switch !== SwitchItemValues.Config}
                        onChange={
                            this.state.pipelineConfig[key].switch === SwitchItemValues.Config
                                ? (resp) => {
                                      this.handleStageConfigChange(resp, key, 'config')
                                  }
                                : null
                        }
                    >
                        <CodeEditor.Header>
                            <Switch
                                value={this.state.pipelineConfig[key].switch}
                                name={`${key}`}
                                onChange={(event) => {
                                    this.handleStageConfigChange(event.target.value, key, 'switch')
                                }}
                            >
                                <SwitchItem value={SwitchItemValues.Config}> Config </SwitchItem>
                                <SwitchItem value={SwitchItemValues.Sample}> Sample Script</SwitchItem>
                            </Switch>
                            <CodeEditor.ValidationError />
                        </CodeEditor.Header>
                    </CodeEditor>
                </div>
                <div
                    className={
                        this.state.pipelineConfig.isClusterCdActive
                            ? 'dc__position-rel cd-checkbox'
                            : 'dc__position-rel cd-checkbox cd-checkbox-tooltip'
                    }
                >
                    <Checkbox
                        isChecked={runInEnv}
                        value={CHECKBOX_VALUE.CHECKED}
                        disabled={!this.state.pipelineConfig.isClusterCdActive}
                        onChange={(event) => {
                            this.handleRunInEnvCheckbox(event, key)
                        }}
                    >
                        <span className="mr-5">Execute in application Environment</span>
                    </Checkbox>
                    <span className="checkbox-tooltip-body">
                        This Environment is not configured to run on devtron worker.
                    </span>
                </div>
            </div>
        )
    }

    renderNamespaceInfo(namespaceEditable: boolean) {
        if (namespaceEditable) {
            return (
                <div className="dc__info-container info__container--cd-pipeline">
                    <Info />
                    <div className="flex column left">
                        <div className="dc__info-title">Set Namespace</div>
                        <div className="dc__info-subtitle">
                            The entered namespace will be applicable to selected environment across all the pipelines
                            for this application.
                        </div>
                    </div>
                </div>
            )
        } else return null
    }

    renderTriggerType() {
        return (
            <div className="form__row">
                <label className="form__label form__label--sentence dc__bold">
                    When do you want the pipeline to execute?*
                </label>
                <RadioGroup
                    value={this.state.pipelineConfig.triggerType}
                    name="trigger-type"
                    onChange={this.handleTriggerChange}
                >
                    <RadioGroupItem value={TriggerType.Auto}> Automatic </RadioGroupItem>
                    <RadioGroupItem value={TriggerType.Manual}> Manual </RadioGroupItem>
                </RadioGroup>
            </div>
        )
    }

    renderDeleteCDModal() {
        if (this.props.match.params.cdPipelineId) {
            if (this.state.showDeleteModal) {
                return (
                    <DeleteDialog
                        title={`Delete '${this.state.pipelineConfig.name}' ?`}
                        description={`Are you sure you want to delete this CD Pipeline from '${this.props.appName}' ?`}
                        delete={() => this.deleteCD(false)}
                        closeDelete={this.closeCDDeleteModal}
                    />
                )
            }
            if (!this.state.showDeleteModal && this.state.showForceDeleteDialog) {
                return (
                    <ForceDeleteDialog
                        forceDeleteDialogTitle={this.state.forceDeleteDialogTitle}
                        onClickDelete={() => this.deleteCD(true)}
                        closeDeleteModal={() => this.setState({ showForceDeleteDialog: false })}
                        forceDeleteDialogMessage={this.state.forceDeleteDialogMessage}
                    />
                )
            }
        }
        return null
    }

    renderSecondaryButton() {
        if (this.props.match.params.cdPipelineId) {
            let canDeletePipeline = this.props.downstreamNodeSize === 0
            let message =
                this.props.downstreamNodeSize > 0
                    ? 'This Pipeline cannot be deleted as it has connected CD pipeline'
                    : ''
            return (
                <ConditionalWrap
                    condition={!canDeletePipeline}
                    wrap={(children) => (
                        <Tippy className="default-tt" content={message}>
                            <div>{children}</div>
                        </Tippy>
                    )}
                >
                    <button
                        type="button"
                        className={`cta cta--workflow delete mr-16`}
                        disabled={!canDeletePipeline}
                        onClick={() => {
                            this.setState({ showDeleteModal: true })
                        }}
                    >
                        Delete Pipeline
                    </button>
                </ConditionalWrap>
            )
        } else {
            if (this.state.isAdvanced) {
                return (
                    <button
                        type="button"
                        className="cta cta--workflow cancel mr-16"
                        onClick={() => {
                            this.props.close()
                        }}
                    >
                        Cancel
                    </button>
                )
            } else {
                return (
                    <button
                        type="button"
                        className="cta cta--workflow cancel mr-16"
                        onClick={() => {
                            this.handleAdvanceClick()
                        }}
                    >
                        Advanced Options
                    </button>
                )
            }
        }
    }

    renderEnvAndNamespace() {
        let envId = this.state.pipelineConfig.environmentId
        let selectedEnv: Environment = this.state.environments.find((env) => env.id == envId)
        let namespaceEditable = false
        let namespaceErroObj = this.validationRules.namespace(this.state.pipelineConfig.namespace)
        let envErrorObj = this.validationRules.environment(this.state.pipelineConfig.environmentId)
        return (
            <>
                <div className="form__row form__row--flex mt-12">
                    <div className={`w-50`}>
                        <div className="form__label">Deploy to environment</div>
                        <ReactSelect
                            menuPortalTarget={this.state.isAdvanced ? null : document.getElementById('visible-modal')}
                            closeMenuOnScroll={true}
                            isDisabled={!!this.props.match.params.cdPipelineId}
                            placeholder="Select Environment"
                            options={this.state.environments}
                            value={selectedEnv}
                            getOptionLabel={(option) => `${option.name}`}
                            getOptionValue={(option) => `${option.id}`}
                            isMulti={false}
                            onChange={(selected: any) => this.selectEnvironment(selected)}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                                Option,
                            }}
                            styles={{ ...styles }}
                        />
                        {this.state.showError && !envErrorObj.isValid ? (
                            <span className="form__error">
                                <img src={error} className="form__icon" />
                                {envErrorObj.message}
                            </span>
                        ) : null}
                    </div>
                    <label className="flex-1 ml-16">
                        <span className="form__label">Namespace*</span>
                        <input
                            className="form__input"
                            autoComplete="off"
                            placeholder="Namespace"
                            type="text"
                            disabled={!namespaceEditable}
                            value={
                                selectedEnv && selectedEnv.namespace
                                    ? selectedEnv.namespace
                                    : this.state.pipelineConfig.namespace
                            }
                            onChange={(event) => {
                                this.handleNamespaceChange(event, selectedEnv)
                            }}
                        />
                        {this.state.showError && !namespaceErroObj.isValid ? (
                            <span className="form__error">
                                <img src={error} className="form__icon" />
                                {namespaceErroObj.message}
                            </span>
                        ) : null}
                    </label>
                </div>
                {this.renderNamespaceInfo(namespaceEditable)}
            </>
        )
    }

    renderAdvancedCD() {
        let nameErrorObj = this.validationRules.name(this.state.pipelineConfig.name)
        return (
            <>
                <div className="form__row">
                    <label className="form__label">Pipeline Name*</label>
                    <input
                        className="form__input"
                        autoComplete="off"
                        disabled={!!this.state.pipelineConfig.id}
                        placeholder="Pipeline name"
                        type="text"
                        value={this.state.pipelineConfig.name}
                        onChange={this.handlePipelineName}
                    />
                    {this.state.showError && !nameErrorObj.isValid ? (
                        <span className="form__error">
                            <img src={error} className="form__icon" />
                            {nameErrorObj.message}
                        </span>
                    ) : null}
                </div>
                <div className="divider mt-12 mb-12"></div>

                <div
                    className="flex left"
                    onClick={() => {
                        this.setState({ showPreStage: !this.state.showPreStage })
                    }}
                >
                    <div className="icon-dim-44 bcn-1 flex">
                        <PrePostCD className="icon-dim-24" />
                    </div>
                    <div className="ml-16 mr-16 flex-1">
                        <h4 className="fs-14 fw-6 lh-1-43 cn-9 mb-4">Pre-deployment Stage</h4>
                        <div className="form__label form__label--sentence m-0">
                            Configure actions like DB migration, that you want to run before the deployment.
                        </div>
                    </div>
                    <div className="icon-dim-44 flex">
                        <img
                            className="icon-dim-32 ml-auto"
                            src={dropdown}
                            alt="dropDown"
                            style={{ transform: this.state.showPreStage ? 'rotate(180deg)' : 'rotate(0)' }}
                        />
                    </div>
                </div>
                {this.state.showPreStage ? this.renderDeploymentStageDetails('preStage') : null}

                <div className="divider mt-12 mb-12"></div>
                <div
                    className="flex left"
                    onClick={() => {
                        this.setState({ showDeploymentStage: !this.state.showDeploymentStage })
                    }}
                >
                    <div className="icon-dim-44 bcn-1 flex">
                        <CD className="icon-dim-24" />
                    </div>
                    <div className="ml-16 mr-16 flex-1">
                        <h4 className="fs-14 fw-6 lh-1-43 cn-9 mb-4">Deployment Stage</h4>
                        <p className="form__label form__label--sentence m-0">
                            Configure deployment preferences for this pipeline.
                        </p>
                    </div>
                    <div className="icon-dim-44 flex">
                        <img
                            className="icon-dim-32 ml-auto"
                            src={dropdown}
                            alt="dropDown"
                            style={{ transform: this.state.showDeploymentStage ? 'rotate(180deg)' : 'rotate(0)' }}
                        />
                    </div>
                </div>
                {this.state.showDeploymentStage ? (
                    <>
                        {this.renderEnvAndNamespace()}
                        {this.renderTriggerType()}
                        {this.renderDeploymentStrategy()}
                    </>
                ) : null}
                <div className="divider mt-12 mb-12"></div>
                <div
                    className="flex left"
                    onClick={() => {
                        this.setState({ showPostStage: !this.state.showPostStage })
                    }}
                >
                    <div className="icon-dim-44 bcn-1 flex">
                        <PrePostCD className="icon-dim-24" />
                    </div>
                    <div className="ml-16 mr-16 flex-1">
                        <h4 className="fs-14 fw-6 lh-1-43 cn-9 mb-4">Post-deployment Stage</h4>
                        <p className="form__label form__label--sentence m-0">
                            Configure actions like Jira ticket close, that you want to run after the deployment.
                        </p>
                    </div>
                    <div className="icon-dim-44 flex">
                        <img
                            className="icon-dim-32 ml-auto"
                            src={dropdown}
                            alt="dropDown"
                            style={{ transform: this.state.showPostStage ? 'rotate(180deg)' : 'rotate(0)' }}
                        />
                    </div>
                </div>
                {this.state.showPostStage ? this.renderDeploymentStageDetails('postStage') : null}
                <div className="divider mt-12 mb-12"></div>
            </>
        )
    }

    renderBasicCD() {
        let strategyMenu = Object.keys(this.allStrategies).map((option) => {
            return { label: option, value: option }
        })
        let strategy = this.state.pipelineConfig.strategies[0]
            ? {
                  label: this.state.pipelineConfig.strategies[0]?.deploymentTemplate,
                  value: this.state.pipelineConfig.strategies[0]?.deploymentTemplate,
              }
            : undefined
        return (
            <>
                <p className="fs-14 fw-6 cn-9 mb-16">Select Environment</p>
                {this.renderEnvAndNamespace()}
                {!this.noStrategyAvailable && (
                    <>
                        <div className="divider mt-0 mb-0"></div>
                        <p className="fs-14 fw-6 cn-9 mb-16 mt-20">Deployment Strategy</p>
                        <p className="fs-13 fw-5 cn-7">Configure deployment preferences for this pipeline</p>
                        <ReactSelect
                            menuPortalTarget={document.getElementById('visible-modal')}
                            closeMenuOnScroll={true}
                            isSearchable={false}
                            isClearable={false}
                            isMulti={false}
                            placeholder="Select Strategy"
                            options={strategyMenu}
                            value={strategy}
                            onChange={(selected: any) => {
                                this.handleStrategy(selected.value)
                            }}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                                Option,
                            }}
                            styles={{ ...styles }}
                        />
                    </>
                )}
            </>
        )
    }

    renderCDPipelineBody() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        } else if (this.state.view == ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.code} />
        } else if (this.state.isAdvanced) {
            return this.renderAdvancedCD()
        } else {
            return this.renderBasicCD()
        }
    }

    render() {
        return (
            <VisibleModal className="">
                <form className="modal__body modal__body--ci br-0 modal__body--p-0" onSubmit={this.savePipeline}>
                    {this.renderHeader()}
                    <div className="p-20" style={{ maxHeight: 'calc(100vh - 164px)', overflowY: 'scroll' }}>
                        {this.renderCDPipelineBody()}
                    </div>
                    {this.state.view !== ViewType.LOADING && (
                        <div className="ci-button-container bcn-0 pt-12 pb-12 pl-20 pr-20 flex flex-justify">
                            {this.renderSecondaryButton()}
                            <ButtonWithLoader
                                rootClassName="cta cta--workflow flex-1"
                                onClick={this.savePipeline}
                                isLoading={this.state.loadingData}
                                loaderColor="white"
                            >
                                {this.props.match.params.cdPipelineId ? 'Update Pipeline' : 'Create Pipeline'}
                            </ButtonWithLoader>
                        </div>
                    )}
                </form>
                {this.renderDeleteCDModal()}
            </VisibleModal>
        )
    }
}
