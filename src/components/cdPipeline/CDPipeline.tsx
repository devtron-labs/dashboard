import React, { Component } from 'react'
import { SourceTypeMap, TriggerType, ViewType } from '../../config'
import {
    Select,
    ButtonWithLoader,
    isEmpty,
    DevtronSwitch as Switch,
    DevtronSwitchItem as SwitchItem,
    sortObjectArrayAlphabetically,
    RadioGroup as CommonRadioGroup,
    Toggle,
} from '../common'
import { toast } from 'react-toastify'
import { Info } from '../common/icons/Icons'
import {
    ErrorScreenManager,
    Progressing,
    showError,
    VisibleModal,
    Drawer,
    DeleteDialog,
    ForceDeleteDialog,
    ServerErrors,
    Checkbox,
    CHECKBOX_VALUE,
    InfoColourBar,
    RadioGroup,
    RadioGroupItem,
} from '@devtron-labs/devtron-fe-common-lib'
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
import { ReactComponent as Key } from '../../assets/icons/ic-key-bulb.svg'
import { ReactComponent as File } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as PrePostCD } from '../../assets/icons/ic-cd-stage.svg'
import { ReactComponent as CD } from '../../assets/icons/ic-CD.svg'
import { ReactComponent as BotIcon } from '../../assets/icons/ic-bot.svg'
import { ReactComponent as PersonIcon } from '../../assets/icons/ic-person.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as ApprovalIcon } from '../../assets/icons/ic-user-circle.svg'
import { ReactComponent as MultiApprovalIcon } from '../../assets/icons/ic-users.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-filled.svg'
import yamlJsParser from 'yaml'
import settings from '../../assets/icons/ic-settings.svg'
import trash from '../../assets/icons/misc/delete.svg'
import error from '../../assets/icons/misc/errorInfo.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import config from './sampleConfig.json'
import ReactSelect from 'react-select'
import { styles, DropdownIndicator, Option, NUMBER_OF_APPROVALS } from './cdpipeline.util'
import { EnvFormatOptions, formatHighlightedText, GroupHeading } from '../v2/common/ReactSelect.utils'
import './cdPipeline.scss'
import dropdown from '../../assets/icons/ic-chevron-down.svg'
import { ConditionalWrap, createClusterEnvGroup, getEmptyArrayOfLength } from '../common/helpers/Helpers'
import Tippy from '@tippyjs/react'
import { PipelineType } from '../app/details/triggerView/types'
import { DeploymentAppType } from '../v2/values/chartValuesDiff/ChartValuesView.type'
import { groupStyle } from '../secrets/secret.utils'
import {
    DEPLOY_IMAGE_EXTERNALSOURCE,
    EDIT_DEPLOYMENT_PIPELINE,
    CREATE_DEPLOYMENT_PIPELINE,
    MULTI_REQUIRED_FIELDS_MSG,
    TOAST_INFO,
    CONFIGMAPS_SECRETS,
} from '../../config/constantMessaging'

export const SwitchItemValues = {
    Sample: 'sample',
    Config: 'config',
}

export default class CDPipeline extends Component<CDPipelineProps, CDPipelineState> {
    allStrategies: { [key: string]: any } = {}
    isWebhookCD = window.location.href.includes('webhook')
    validationRules
    preStage
    postStage
    configMapAndSecrets = []
    noStrategyAvailable = false
    constructor(props) {
        super(props)
        const urlParams = new URLSearchParams(this.props.location.search)
        const parentPipelineTypeFromURL = urlParams.get('parentPipelineType')
        const parentPipelineType = parentPipelineTypeFromURL
            ? parentPipelineTypeFromURL.toLocaleUpperCase().replace('-', '_')
            : this.isWebhookCD
            ? SourceTypeMap.WEBHOOK
            : ''
        const parentPipelineId = urlParams.get('parentPipelineId')
        this.state = {
            view: ViewType.LOADING,
            loadingData: false,
            code: 0,
            showError: false,
            errorForm: {
                pipelineNameError: { isValid: true, message: '' },
                envNameError: { isValid: true, message: '' },
                nameSpaceError: { isValid: true, message: '' },
            },
            environments: [],
            strategies: [],
            pipelineConfig: {
                id: null,
                environmentId: 0,
                ciPipelineId: this.isWebhookCD ? 0 : +this.props.match.params.ciPipelineId,
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
                deploymentAppType: window._env_.HIDE_GITOPS_OR_HELM_OPTION ? '' : DeploymentAppType.Helm,
                deploymentAppCreated: false,
                userApprovalConfig: null,
            },
            showPreStage: false,
            showDeploymentStage: true,
            showPostStage: false,
            showManualApproval: false,
            requiredApprovals: '1',
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
                                            clusterName: env.cluster_name,
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
            deploymentAppType: pipelineConfigFromRes.deploymentAppType || '',
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
            showManualApproval: pipelineConfigFromRes.userApprovalConfig?.requiredCount >= 1,
            requiredApprovals: `${pipelineConfigFromRes.userApprovalConfig?.requiredCount || 1}`,
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

        const { pipelineConfig } = { ...this.state }
        pipelineConfig.strategies.push(newSelection)
        pipelineConfig.strategies = [newSelection]
        this.setState({ pipelineConfig })
    }

    selectEnvironment = (selection: Environment): void => {
        const { pipelineConfig, errorForm } = { ...this.state }

        if (selection) {
            let list = this.state.environments.map((item) => {
                return {
                    ...item,
                    active: item.id == selection.id,
                }
            })
            pipelineConfig.environmentId = selection.id
            pipelineConfig.namespace = selection.namespace
            errorForm.envNameError = this.validationRules.environment(selection.id)
            errorForm.nameSpaceError = this.validationRules.namespace(selection.namespace)

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
            this.setState({ environments: list, pipelineConfig, errorForm }, () => {
                getConfigMapAndSecrets(this.props.match.params.appId, this.state.pipelineConfig.environmentId)
                    .then((response) => {
                        this.configMapAndSecrets = response.result
                        this.setState({ view: ViewType.FORM, errorForm: errorForm })
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
            errorForm.envNameError = this.validationRules.environment(pipelineConfig.environmentId)
            this.setState({ environments: list, pipelineConfig, errorForm: errorForm })
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

    handleTriggerTypeChange = (selectedTriggerType: string) => {
        let { pipelineConfig } = { ...this.state }
        pipelineConfig.triggerType = selectedTriggerType
        this.setState({ pipelineConfig })
    }

    handleDeploymentAppTypeChange = (event) => {
        const { pipelineConfig } = { ...this.state }
        pipelineConfig.deploymentAppType = event.target.value
        this.setState({ pipelineConfig })
    }

    handlePipelineName = (event) => {
        const { pipelineConfig, errorForm } = { ...this.state }
        pipelineConfig.name = event.target.value
        errorForm.pipelineNameError = this.validationRules.name(pipelineConfig.name)
        this.setState({ pipelineConfig, errorForm })
    }

    handleNamespaceChange = (event, environment): void => {
        const { pipelineConfig } = { ...this.state }
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
        const { pipelineConfig, errorForm } = { ...this.state }
        errorForm.pipelineNameError = this.validationRules.name(pipelineConfig.name)
        errorForm.nameSpaceError = this.validationRules.namespace(pipelineConfig.namespace)
        errorForm.envNameError = this.validationRules.environment(pipelineConfig.environmentId)
        this.setState({ errorForm })
        let valid =
            !!pipelineConfig.environmentId &&
            errorForm.pipelineNameError.isValid &&
            !!pipelineConfig.namespace &&
            !!pipelineConfig.triggerType &&
            !!(pipelineConfig.deploymentAppType || window._env_.HIDE_GITOPS_OR_HELM_OPTION)
        if (!pipelineConfig.name || !pipelineConfig.namespace) {
            toast.error(MULTI_REQUIRED_FIELDS_MSG)
            return
        }
        if (!valid) {
            this.setState({ loadingData: false })
            return
        }

        this.setState({ loadingData: true })
        const pipeline = {
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
            userApprovalConfig: this.state.showManualApproval
                ? {
                      requiredCount: parseInt(this.state.requiredApprovals),
                  }
                : null,
        }
        let request = {
            appId: parseInt(this.props.match.params.appId),
        }
        pipeline.preStage.config = pipeline.preStage.config.replace(/^\s+|\s+$/g, '')
        pipeline.postStage.config = pipeline.postStage.config.replace(/^\s+|\s+$/g, '')

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
                        this.state.pipelineConfig.parentPipelineType !== PipelineType.WEBHOOK,
                        this.state.pipelineConfig.environmentId,
                        envName,
                        this.props.match.params.cdPipelineId
                            ? 'Deployment pipeline updated'
                            : 'Deployment pipeline created',
                        !this.props.match.params.cdPipelineId,
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
        const isPartialDelete =
            this.state.pipelineConfig?.deploymentAppType === DeploymentAppType.GitOps &&
            this.state.pipelineConfig.deploymentAppCreated &&
            !force
        const payload = {
            action: isPartialDelete ? CD_PATCH_ACTION.DEPLOYMENT_PARTIAL_DELETE : CD_PATCH_ACTION.DELETE,
            appId: parseInt(this.props.match.params.appId),
            pipeline: {
                id: this.state.pipelineConfig.id,
            },
        }

        deleteCDPipeline(payload, force)
            .then((response) => {
                if (response.result) {
                    toast.success(TOAST_INFO.PIPELINE_DELETION_INIT)
                    this.setState({ loadingData: false })
                    this.props.close()
                    if (this.isWebhookCD) {
                        this.props.refreshParentWorkflows()
                    }
                    this.props.getWorkflows()
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
        const title =
            this.isWebhookCD && this.props.match.params.workflowId === '0'
                ? DEPLOY_IMAGE_EXTERNALSOURCE
                : this.props.match.params.cdPipelineId
                ? EDIT_DEPLOYMENT_PIPELINE
                : CREATE_DEPLOYMENT_PIPELINE
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
        function getOptionLabel(option) {
            if (option.type === CONFIGMAPS_SECRETS.configmaps) {
                return (
                    <div className="dropdown__option">
                        <File className="icon-dim-16" />
                        <span className="ml-8 fs-12 dc__align-center">{option.name}</span>
                    </div>
                )
            } else {
                return (
                    <div className="dropdown__option">
                        <Key className="icon-dim-16" />
                        <span className="ml-8 fs-12 dc__align-center">{option.name}</span>
                    </div>
                )
            }
        }

        function getOptionValue(option) {
            return `${option.name}${option.type}`
        }

        const onChangeOption = (selected) => {
            this.handleConfigmapAndSecretsChange(selected, configmapKey)
        }
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
                        formatOptionLabel={getOptionLabel}
                        getOptionValue={getOptionValue}
                        onChange={onChangeOption}
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

    renderDeploymentAppType() {
        return (
            <div className="form__row">
                <label className="form__label form__label--sentence dc__bold">How do you want to deploy?</label>
                <RadioGroup
                    value={
                        this.state.pipelineConfig.deploymentAppType
                            ? this.state.pipelineConfig.deploymentAppType
                            : DeploymentAppType.Helm
                    }
                    name="deployment-app-type"
                    onChange={this.handleDeploymentAppTypeChange}
                    disabled={!!this.props.match.params.cdPipelineId}
                >
                    <RadioGroupItem value={DeploymentAppType.Helm}> Helm </RadioGroupItem>
                    <RadioGroupItem value={DeploymentAppType.GitOps}> GitOps </RadioGroupItem>
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
                    !this.isWebhookCD && (
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
                )
            }
        }
    }

    singleOption = (props) => {
        return <EnvFormatOptions {...props} environmentfieldName="name" />
    }

    handleFormatHighlightedText = (opt: Environment, { inputValue }) => {
        return formatHighlightedText(opt, inputValue, 'name')
    }

    renderEnvNamespaceAndTriggerType() {
        let envId = this.state.pipelineConfig.environmentId
        let selectedEnv: Environment = this.state.environments.find((env) => env.id == envId)
        let namespaceEditable = false
        const envList = createClusterEnvGroup(this.state.environments, 'clusterName')

        return (
            <>
                <div className="form__row form__row--flex">
                    <div className="w-50 mr-8">
                        <div className="form__label">Environment*</div>
                        <ReactSelect
                            menuPortalTarget={this.state.isAdvanced ? null : document.getElementById('visible-modal')}
                            closeMenuOnScroll={true}
                            isDisabled={!!this.props.match.params.cdPipelineId}
                            placeholder="Select Environment"
                            options={envList}
                            value={selectedEnv}
                            getOptionLabel={(option) => `${option.name}`}
                            getOptionValue={(option) => `${option.id}`}
                            isMulti={false}
                            onChange={(selected: any) => this.selectEnvironment(selected)}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                                SingleValue: this.singleOption,
                                GroupHeading,
                            }}
                            styles={{
                                ...groupStyle(),
                                control: (base) => ({ ...base, border: '1px solid #d6dbdf' }),
                            }}
                            formatOptionLabel={this.handleFormatHighlightedText}
                        />
                        {!this.state.errorForm.envNameError.isValid ? (
                            <span className="form__error">
                                <img src={error} className="form__icon" />
                                {this.state.errorForm.envNameError.message}
                            </span>
                        ) : null}
                    </div>
                    <label className="flex-1 ml-8">
                        <span className="form__label">Namespace</span>
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

                        {!this.state.errorForm.nameSpaceError.isValid ? (
                            <span className="form__error">
                                <img src={error} className="form__icon" />
                                {this.state.errorForm.nameSpaceError.message}
                            </span>
                        ) : null}
                    </label>
                </div>
                {this.renderNamespaceInfo(namespaceEditable)}
                {this.renderTriggerType()}
            </>
        )
    }

    renderTriggerType() {
        return (
            <>
                <p className="fs-14 fw-6 cn-9 mb-8">When do you want to deploy</p>
                <div className="flex mb-20">
                    <div
                        className={`flex dc__content-start pointer w-50 pt-8 pr-16 pb-8 pl-16 br-4 mr-8 bw-1${
                            this.state.pipelineConfig.triggerType === TriggerType.Auto ? ' bcb-1 eb-2' : ' bcn-0 en-2'
                        }`}
                        onClick={() => this.handleTriggerTypeChange(TriggerType.Auto)}
                    >
                        <BotIcon className="icon-dim-20 mr-12" />
                        <div>
                            <div>Automatic</div>
                            <div>Deploy everytime a new image is received</div>
                        </div>
                    </div>
                    <div
                        className={`flex dc__content-start pointer w-50 pt-8 pr-16 pb-8 pl-16 br-4 ml-8 bw-1${
                            this.state.pipelineConfig.triggerType === TriggerType.Manual ? ' bcb-1 eb-2' : ' bcn-0 en-2'
                        }`}
                        onClick={() => this.handleTriggerTypeChange(TriggerType.Manual)}
                    >
                        <PersonIcon className="icon-dim-20 mr-12" />
                        <div>
                            <div>Manual</div>
                            <div>Select and deploy from available images</div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    renderWebhookWarning() {
        return (
            <InfoColourBar
                message={
                    <div>
                        <span className="fw-6">Connecting to external CI service: </span>A webhook url and sample JSON
                        will be generated after the pipeline is created.
                    </div>
                }
                classname="bw-1 bcv-1 ev-2 bcv-1 fs-12 mt-20"
                Icon={Help}
                iconClass="fcv-5 h-20"
            />
        )
    }

    toggleManualApproval = (): void => {
        this.setState({
            showManualApproval: !this.state.showManualApproval,
            requiredApprovals: `${this.state.pipelineConfig.userApprovalConfig?.requiredCount || 1}`,
        })
    }

    onChangeRequiredApprovals = (e: any): void => {
        this.setState({ requiredApprovals: e.currentTarget.value })
    }

    renderManualApproval = () => {
        return (
            <CommonRadioGroup
                className="manual-approvals-switch flex left"
                name="required-approvals"
                initialTab={this.state.requiredApprovals}
                disabled={false}
                onChange={this.onChangeRequiredApprovals}
            >
                {getEmptyArrayOfLength(6).map((e, idx) => {
                    return (
                        <CommonRadioGroup.Radio value={`${idx + 1}`}>
                            {idx === 0 ? (
                                <ApprovalIcon className="icon-dim-12 mr-6" />
                            ) : (
                                <MultiApprovalIcon className="icon-dim-12 mr-6" />
                            )}
                            {idx + 1}
                        </CommonRadioGroup.Radio>
                    )
                })}
            </CommonRadioGroup>
        )
    }

    renderManualApprovalWrapper = () => {
        return (
            <>
                <div className="flex left">
                    <div className="icon-dim-44 bcn-1 br-8 flex">
                        <ApprovalIcon className="icon-dim-24" />
                    </div>
                    <div className="ml-16 mr-16 flex-1">
                        <h4 className="fs-14 fw-6 lh-1-43 cn-9 mb-4">Manual approval</h4>
                        <div className="form__label form__label--sentence m-0">
                            When enabled, only approved images will be available to be deployed by this deployment
                            pipeline.
                        </div>
                    </div>
                    <div style={{ width: '32px', height: '20px' }}>
                        <Toggle selected={this.state.showManualApproval} onSelect={this.toggleManualApproval} />
                    </div>
                </div>
                {this.state.showManualApproval && (
                    <div className="mt-5 mb-16 ml-60">
                        <div className="cn-9 fs-13 fw-4 lh-20 mb-6">Required number of approvals</div>
                        {this.renderManualApproval()}
                        <div className="flex left mt-12">
                            <InfoIcon className="manual-approval-info-icon icon-dim-20 mr-8" /> All users having
                            ‘Approver’ permission for this application and environment can approve.
                        </div>
                    </div>
                )}
                <div className="divider mt-12 mb-12"></div>
            </>
        )
    }

    renderAdvancedCD() {
        return (
            <>
                <div className="form__row">
                    <label className="form__label dc__required-field">Pipeline Name</label>
                    <input
                        className="form__input"
                        autoComplete="off"
                        disabled={!!this.state.pipelineConfig.id}
                        placeholder="Pipeline name"
                        type="text"
                        value={this.state.pipelineConfig.name}
                        onChange={this.handlePipelineName}
                    />
                    {!this.state.errorForm.pipelineNameError.isValid ? (
                        <span className="form__error">
                            <img src={error} className="form__icon" />
                            {this.state.errorForm.pipelineNameError.message}
                        </span>
                    ) : null}
                </div>
                <div className="divider mt-12 mb-12"></div>
                {this.renderManualApprovalWrapper()}
                <div
                    className="flex left"
                    onClick={() => {
                        this.setState({ showPreStage: !this.state.showPreStage })
                    }}
                >
                    <div className="icon-dim-44 bcn-1 br-8 flex">
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
                    <div className="icon-dim-44 bcn-1 br-8 flex">
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
                        {this.renderEnvNamespaceAndTriggerType()}
                        {!window._env_.HIDE_GITOPS_OR_HELM_OPTION && this.renderDeploymentAppType()}
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
                    <div className="icon-dim-44 bcn-1 br-8 flex">
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
                <p className="fs-14 fw-6 cn-9 mb-12">Deploy to environment</p>
                {this.renderEnvNamespaceAndTriggerType()}
                {!window._env_.HIDE_GITOPS_OR_HELM_OPTION && this.renderDeploymentAppType()}
                {!this.noStrategyAvailable && (
                    <>
                        <p className="fs-14 fw-6 cn-9 mb-12">Deployment Strategy</p>
                        <p className="fs-13 fw-5 cn-7 mb-8">Configure deployment preferences for this pipeline</p>
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
                {this.isWebhookCD && !this.state.pipelineConfig.parentPipelineId && this.renderWebhookWarning()}
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

    renderCDPipelineModal() {
        return (
            <>
                <form
                    className={
                        this.props.match.params.cdPipelineId || this.state.isAdvanced
                            ? 'bcn-0'
                            : 'modal__body modal__body__ci_new_ui br-0 modal__body--p-0 bottom-border-radius'
                    }
                    onSubmit={this.savePipeline}
                >
                    {this.renderHeader()}
                    <div
                        className="p-20"
                        style={{
                            height:
                                this.props.match.params.cdPipelineId || this.state.isAdvanced
                                    ? 'calc(100vh - 125px)'
                                    : 'auto',
                            maxHeight:
                                this.props.match.params.cdPipelineId || this.state.isAdvanced
                                    ? 'auto'
                                    : 'calc(100vh - 164px)',
                            overflowY: 'scroll',
                        }}
                    >
                        {this.renderCDPipelineBody()}
                    </div>

                    <div
                        className={`ci-button-container bcn-0 pt-12 pb-12 pl-20 pr-20 flex bottom-border-radius ${
                            this.isWebhookCD && !this.props.match.params.cdPipelineId ? 'right' : 'flex-justify'
                        }`}
                    >
                        {this.renderSecondaryButton()}
                        <ButtonWithLoader
                            rootClassName="cta cta--workflow"
                            onClick={this.savePipeline}
                            isLoading={this.state.loadingData}
                            loaderColor="white"
                        >
                            {this.props.match.params.cdPipelineId ? 'Update Pipeline' : 'Create Pipeline'}
                        </ButtonWithLoader>
                    </div>
                </form>
                {this.renderDeleteCDModal()}
            </>
        )
    }

    render() {
        return this.props.match.params.cdPipelineId || this.state.isAdvanced ? (
            <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
                {this.renderCDPipelineModal()}
            </Drawer>
        ) : (
            <VisibleModal className="">{this.renderCDPipelineModal()}</VisibleModal>
        )
    }
}
