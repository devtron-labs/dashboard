import React, { useState, useEffect, useMemo, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Redirect, Route, Switch, useParams, useRouteMatch, useHistory, useLocation } from 'react-router'
import {
    ButtonWithLoader,
    FloatingVariablesSuggestions,
    importComponentFromFELibrary,
    sortObjectArrayAlphabetically,
} from '../common'
import {
    ServerErrors,
    showError,
    ConditionalWrap,
    VisibleModal,
    Drawer,
    DeleteDialog,
    DockerConfigOverrideType,
    RefVariableType,
    VariableType,
    MandatoryPluginDataType,
    MandatoryPluginDetailType,
    PluginDetailType,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    BuildStageVariable,
    BuildTabText,
    JobPipelineTabText,
    ModuleNameMap,
    TriggerType,
    URLS,
    ViewType,
    SourceTypeMap,
} from '../../config'
import {
    deleteCIPipeline,
    getGlobalVariable,
    getInitData,
    getInitDataWithCIPipeline,
    getPluginsData,
    saveCIPipeline,
} from '../ciPipeline/ciPipeline.service'
import { toast } from 'react-toastify'
import { ValidationRules } from '../ciPipeline/validationRules'
import { CIBuildType, CIPipelineBuildType, CIPipelineDataType, CIPipelineType } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import Tippy from '@tippyjs/react'
import { PreBuild } from './PreBuild'
import { Sidebar } from './Sidebar'
import { Build } from './Build'
import { ReactComponent as WarningTriangle } from '../../assets/icons/ic-warning.svg'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { MULTI_REQUIRED_FIELDS_MSG } from '../../config/constantMessaging'
import { LoadingState } from '../ciConfig/types'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { calculateLastStepDetailsLogic, checkUniqueness, validateTask } from '../cdPipeline/cdpipeline.util'
import { PipelineFormDataErrorType, PipelineFormType } from '../workflowEditor/types'
import { Environment } from '../cdPipeline/cdPipeline.types'
import { getEnvironmentListMinPublic } from '../../services/service'
import { DEFAULT_ENV } from '../app/details/triggerView/Constants'

const processPluginData = importComponentFromFELibrary('processPluginData', null, 'function')
const validatePlugins = importComponentFromFELibrary('validatePlugins', null, 'function')
const prepareFormData = importComponentFromFELibrary('prepareFormData', null, 'function')

export default function CIPipeline({
    appName,
    connectCDPipelines,
    getWorkflows,
    close,
    deleteWorkflow,
    isJobView,
    isJobCI,
}: CIPipelineType) {
    let { appId, workflowId, ciPipelineId } = useParams<{ appId: string; workflowId: string; ciPipelineId: string }>()
    if (ciPipelineId === '0') {
        ciPipelineId = null
    }
    const location = useLocation()
    let activeStageName = BuildStageVariable.Build
    if (location.pathname.indexOf('/pre-build') >= 0) {
        activeStageName = BuildStageVariable.PreBuild
    } else if (location.pathname.indexOf('/post-build') >= 0) {
        activeStageName = BuildStageVariable.PostBuild
    }
    const { path } = useRouteMatch()
    const history = useHistory()
    const [pageState, setPageState] = useState(ViewType.LOADING)
    const text = ciPipelineId ? 'Update Pipeline' : 'Create Pipeline'
    const isJobCard = isJobCI || isJobView // constant for common elements of both Job and CI_JOB
    const title = `${ciPipelineId ? 'Edit ' : 'Create '}${isJobCard ? 'job' : 'build'} pipeline`
    const [isAdvanced, setIsAdvanced] = useState<boolean>(
        isJobCard || (activeStageName !== BuildStageVariable.PreBuild && !!ciPipelineId),
    )
    const [showFormError, setShowFormError] = useState<boolean>(false)
    const [loadingState, setLoadingState] = useState<LoadingState>({
        loading: false,
        failed: false,
    })
    const [apiInProgress, setApiInProgress] = useState<boolean>(false)
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const [configurationType, setConfigurationType] = useState<string>('GUI')
    const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(0)
    const [globalVariables, setGlobalVariables] = useState<{ label: string; value: string; format: string }[]>([])
    const [inputVariablesListFromPrevStep, setInputVariablesListFromPrevStep] = useState<{
        preBuildStage: Map<string, VariableType>[]
        postBuildStage: Map<string, VariableType>[]
    }>({ preBuildStage: [], postBuildStage: [] })
    const [presetPlugins, setPresetPlugins] = useState<PluginDetailType[]>([])
    const [sharedPlugins, setSharedPlugins] = useState<PluginDetailType[]>([])
    const [isSecurityModuleInstalled, setSecurityModuleInstalled] = useState<boolean>(false)
    const [selectedEnv, setSelectedEnv] = useState<Environment>()
    const [environments, setEnvironments] = useState([])
    const [formData, setFormData] = useState<PipelineFormType>({
        name: '',
        args: [],
        materials: [],
        triggerType: TriggerType.Auto,
        scanEnabled: false,
        gitHost: undefined,
        webhookEvents: [],
        ciPipelineSourceTypeOptions: [],
        webhookConditionList: [],
        ciPipelineEditable: true,
        preBuildStage: {
            id: 0,
            steps: [],
        },
        postBuildStage: {
            id: 0,
            steps: [],
        },
    })
    const [formDataErrorObj, setFormDataErrorObj] = useState<PipelineFormDataErrorType>({
        name: { isValid: true },
        preBuildStage: {
            steps: [],
            isValid: true,
        },
        buildStage: {
            isValid: true,
        },
        postBuildStage: {
            steps: [],
            isValid: true,
        },
    })
    const [ciPipeline, setCIPipeline] = useState<CIPipelineDataType>({
        active: true,
        ciMaterial: [],
        dockerArgs: {},
        externalCiConfig: {},
        id: 0,
        isExternal: false,
        isManual: false,
        name: '',
        linkedCount: 0,
        scanEnabled: false,
        environmentId: 0,
        pipelineType: "",
    })
    const validationRules = new ValidationRules()
    const [isDockerConfigOverridden, setDockerConfigOverridden] = useState(false)
    const [mandatoryPluginData, setMandatoryPluginData] = useState<MandatoryPluginDataType>(null)
    const selectedBranchRef = useRef(null)

    const mandatoryPluginsMap: Record<number, MandatoryPluginDetailType> = useMemo(() => {
        const _mandatoryPluginsMap: Record<number, MandatoryPluginDetailType> = {}
        if (mandatoryPluginData?.pluginData.length) {
            for (const plugin of mandatoryPluginData.pluginData) {
                _mandatoryPluginsMap[plugin.id] = plugin
            }
        }
        return _mandatoryPluginsMap
    }, [mandatoryPluginData])

    useEffect(() => {
        getInitialData()
        getGlobalVariables()
    }, [])

    useEffect(() => {
        if (
            location.pathname.includes(`/${URLS.APP_CI_CONFIG}/`) &&
            ciPipelineId &&
            typeof Storage !== 'undefined' &&
            localStorage.getItem('takeMeThereClicked')
        ) {
            localStorage.removeItem('takeMeThereClicked')
        }
        // redirect to ci-job based on pipeline type
        if (
            location.pathname.includes(`/${URLS.APP_CI_CONFIG}/`) &&
            ciPipelineId &&
            ciPipeline.pipelineType === CIPipelineBuildType.CI_JOB 
        ) {
            const editCIPipelineURL: string = location.pathname.replace(`/${URLS.APP_CI_CONFIG}/`, `/${URLS.APP_JOB_CI_CONFIG}/`)
            history.push(editCIPipelineURL)
        }
    }, [location.pathname, ciPipeline.pipelineType])

    const getEnvironments = (envId) => {
        envId = envId || 0
        getEnvironmentListMinPublic()
            .then((response) => {
                let list = []
                list.push({
                    id: 0,
                    clusterName: '',
                    clusterId: null,
                    name: DEFAULT_ENV,
                    active: false,
                    isClusterActive: false,
                    description: 'System default',
                })
                response.result?.forEach((env) => {
                    if (env.cluster_name !== 'default_cluster' && env.isClusterCdActive) {
                        list.push({
                            id: env.id,
                            clusterName: env.cluster_name,
                            clusterId: env.cluster_id,
                            name: env.environment_name,
                            active: false,
                            isClusterActive: env.isClusterActive,
                            description: env.description,
                        })
                        const _selectedEnv = list.find((env) => env.id == envId)
                        setSelectedEnv(_selectedEnv)
                    }
                })
                sortObjectArrayAlphabetically(list, 'name')
                setEnvironments(list)
            })
            .catch((error) => {
                showError(error)
            })
    }

    const calculateLastStepDetail = (
        isFromAddNewTask: boolean,
        _formData: PipelineFormType,
        activeStageName: string,
        startIndex?: number,
        isFromMoveTask?: boolean,
    ): {
        index: number
        calculatedStageVariables: Map<string, VariableType>[]
    } => {
        const _formDataErrorObj = { ...formDataErrorObj }
        let { stepsLength, _inputVariablesListPerTask } = calculateLastStepDetailsLogic(
            _formData,
            activeStageName,
            _formDataErrorObj,
            isFromAddNewTask,
            startIndex,
            isFromMoveTask,
        )
        const _inputVariablesListFromPrevStep = { ...inputVariablesListFromPrevStep }
        _inputVariablesListFromPrevStep[activeStageName] = _inputVariablesListPerTask
        setInputVariablesListFromPrevStep(_inputVariablesListFromPrevStep)
        setFormDataErrorObj(_formDataErrorObj)
        return { index: stepsLength + 1, calculatedStageVariables: _inputVariablesListPerTask }
    }

    const getInitialData = (): void => {
        setPageState(ViewType.LOADING)
        getSecurityModuleStatus()
        if (ciPipelineId) {
            getInitDataWithCIPipeline(appId, ciPipelineId, true)
                .then((ciResponse) => {
                    const preBuildVariable = calculateLastStepDetail(
                        false,
                        ciResponse.form,
                        BuildStageVariable.PreBuild,
                    ).calculatedStageVariables
                    const postBuildVariable = calculateLastStepDetail(
                        false,
                        ciResponse.form,
                        BuildStageVariable.PostBuild,
                    ).calculatedStageVariables
                    setInputVariablesListFromPrevStep({
                        preBuildStage: preBuildVariable,
                        postBuildStage: postBuildVariable,
                    })
                    validateStage(BuildStageVariable.PreBuild, ciResponse.form)
                    validateStage(BuildStageVariable.Build, ciResponse.form)
                    validateStage(BuildStageVariable.PostBuild, ciResponse.form)
                    setFormData(ciResponse.form)
                    setCIPipeline(ciResponse.ciPipeline)
                    setIsAdvanced(true)
                    setPageState(ViewType.FORM)
                    getAvailablePlugins(ciResponse.form)
                    getEnvironments(ciResponse.ciPipeline.environmentId)
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        } else {
            getInitData(appId, true, !isJobCard)
                .then((ciResponse) => {
                    setFormData(ciResponse.result.form)
                    setPageState(ViewType.FORM)
                    getAvailablePlugins(ciResponse.form)
                    getEnvironments(0)
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        }
    }

    const getGlobalVariables = (): void => {
        getGlobalVariable(Number(appId))
            .then((response) => {
                const _globalVariableOptions = response.result?.map((variable) => {
                    variable.label = variable.name
                    variable.value = variable.name
                    variable.format = variable.format
                    variable.description = variable.description || ''
                    variable.variableType = RefVariableType.GLOBAL
                    delete variable.name
                    return variable
                })
                setGlobalVariables(_globalVariableOptions || [])
            })
            .catch((error: ServerErrors) => {
                if (error.code !== 403) {
                    showError(error)
                }
            })
    }

    const getAvailablePlugins = (_formData: PipelineFormType): void => {
        getPluginsData(Number(appId))
            .then((response) => {
                const _presetPlugin = []
                const _sharedPlugin = []
                const pluginListLength = response?.result?.length || 0
                for (let i = 0; i < pluginListLength; i++) {
                    const pluginData = response.result[i]
                    if (pluginData.type === 'PRESET') {
                        _presetPlugin.push(pluginData)
                    } else {
                        _sharedPlugin.push(pluginData)
                    }
                }
                setPresetPlugins(_presetPlugin)
                setSharedPlugins(_sharedPlugin)
                getMandatoryPluginData(_formData, [..._presetPlugin, ..._sharedPlugin])
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
    }

    const getSecurityModuleStatus = async (): Promise<void> => {
        try {
            const { result } = await getModuleInfo(ModuleNameMap.SECURITY)
            if (result?.status === ModuleStatus.INSTALLED) {
                setSecurityModuleInstalled(true)
            }
        } catch (error) {}
    }

    const getMandatoryPluginData = (_formData: PipelineFormType, pluginList: PluginDetailType[]): void => {
        if (!isJobCard && processPluginData && prepareFormData && pluginList.length) {
            let branchName = ''
            if (_formData?.materials?.length) {
                for (const material of _formData.materials) {
                    if (!material.isRegex || material.value) {
                        branchName += `${branchName ? ',' : ''}${material.value}`
                    }
                }
            }
            if (selectedBranchRef.current !== branchName) {
                selectedBranchRef.current = branchName
                processPluginData(_formData, pluginList, appId, ciPipelineId, branchName)
                    .then((response: MandatoryPluginDataType) => {
                        setMandatoryPluginData(response)
                        if (_formData) {
                            setFormData(prepareFormData(_formData, response?.pluginData ?? []))
                        }
                    })
                    .catch((error: ServerErrors) => {
                        showError(error)
                    })
            }
        }
    }

    const getPluginData = (_formData?: PipelineFormType): void => {
        getMandatoryPluginData(_formData ?? formData, [...presetPlugins, ...sharedPlugins])
    }

    const deletePipeline = (): void => {
        deleteCIPipeline(
            formData,
            ciPipeline,
            formData.materials,
            Number(appId),
            Number(workflowId),
            false,
            formData.webhookConditionList,
        )
            .then((response) => {
                if (response) {
                    toast.success('Pipeline Deleted')
                    setPageState(ViewType.FORM)
                    close()
                    deleteWorkflow(appId, Number(workflowId))
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                setPageState(ViewType.ERROR)
            })
    }

    const closeCIDeleteModal = (): void => {
        setShowDeleteModal(false)
    }

    const renderDeleteCIModal = () => {
        return (
            <DeleteDialog
                title={`Delete '${formData.name}' ?`}
                description={`Are you sure you want to delete this CI Pipeline from '${appName}' ?`}
                closeDelete={closeCIDeleteModal}
                delete={deletePipeline}
            />
        )
    }

    const renderSecondaryButton = () => {
        if (ciPipelineId) {
            const canDeletePipeline = connectCDPipelines === 0 && ciPipeline.linkedCount === 0
            const message =
                connectCDPipelines > 0
                    ? 'This Pipeline cannot be deleted as it has connected CD pipeline'
                    : 'This pipeline has linked CI pipelines'
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
                        data-testid="ci-delete-pipeline-button"
                        type="button"
                        className={`cta cta--workflow delete mr-16`}
                        disabled={!canDeletePipeline}
                        onClick={() => {
                            setShowDeleteModal(true)
                        }}
                    >
                        Delete Pipeline
                    </button>
                </ConditionalWrap>
            )
        } else if (!isAdvanced) {
            return (
                <button
                    type="button"
                    data-testid="create-build-pipeline-advanced-options-button"
                    className="cta cta--workflow cancel mr-16 flex"
                    onClick={() => {
                        setIsAdvanced(true)
                    }}
                >
                    Advanced options
                    {mandatoryPluginData && (!mandatoryPluginData.isValidPre || !mandatoryPluginData.isValidPost) && (
                        <WarningTriangle className="ml-6 icon-dim-16 warning-icon-y7-imp" />
                    )}
                </button>
            )
        }
    }

    const savePipeline = () => {
        const isUnique = checkUniqueness(formData)
        if (!isUnique) {
            toast.error('All task names must be unique')
            return
        }
        setApiInProgress(true)
        validateStage(BuildStageVariable.PreBuild, formData)
        validateStage(BuildStageVariable.Build, formData)
        validateStage(BuildStageVariable.PostBuild, formData)
        const scanValidation =
            !isSecurityModuleInstalled || formData.scanEnabled || !window._env_.FORCE_SECURITY_SCANNING
        if (!scanValidation) {
            setApiInProgress(false)
            toast.error('Scanning is mandatory, please enable scanning')
            return
        }

        if (
            !formDataErrorObj.buildStage.isValid ||
            !formDataErrorObj.preBuildStage.isValid ||
            !formDataErrorObj.postBuildStage.isValid
        ) {
            setApiInProgress(false)
            const branchNameNotPresent = formData.materials.some((_mat) => !_mat.value)
            if (formData.name === '' || branchNameNotPresent) {
                toast.error(MULTI_REQUIRED_FIELDS_MSG)
            }
            return
        }

        const msg = ciPipeline.id ? 'Pipeline Updated' : 'Pipeline Created'

        // Reset allow override flag to false if config matches with global
        if (!ciPipeline.isDockerConfigOverridden && !isDockerConfigOverridden) {
            formData.isDockerConfigOverridden = false
            formData.dockerConfigOverride = {} as DockerConfigOverrideType
        }
        //here we check for the case where the pipeline is multigit and user selects pullrequest or tag creation(webhook)
        //in that case we only send the webhook data not the other one.
        let _materials = formData.materials
        if (formData.materials.length > 1) {
            for (let material of formData.materials) {
                if (material.type === SourceTypeMap.WEBHOOK) {
                    _materials = [material]
                    break
                }
            }
        }

        let _ciPipeline = ciPipeline
        if (selectedEnv && selectedEnv.id !== 0) {
            _ciPipeline.environmentId = selectedEnv.id
        } else {
            _ciPipeline.environmentId = undefined
        }
        if (!isJobView) {
            let ciPipelineType: CIPipelineBuildType = CIPipelineBuildType.CI_BUILD
            if (ciPipeline.isExternal) {
                ciPipelineType = CIPipelineBuildType.CI_EXTERNAL
            } else if (isJobCI) {
                ciPipelineType = CIPipelineBuildType.CI_JOB
            }
            _ciPipeline.pipelineType = ciPipeline.id ? ciPipeline.pipelineType : ciPipelineType
        }
        saveCIPipeline(
            {
                ...formData,
                materials: _materials,
                scanEnabled: isSecurityModuleInstalled ? formData.scanEnabled : false,
            },
            _ciPipeline,
            _materials,
            +appId,
            +workflowId,
            false,
            formData.webhookConditionList,
            formData.ciPipelineSourceTypeOptions,
        )
            .then((response) => {
                if (response) {
                    toast.success(msg)
                    setApiInProgress(false)
                    close()
                    getWorkflows()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                setApiInProgress(false)
            })
    }

    const validateStage = (stageName: string, _formData: PipelineFormType, formDataErrorObject?): void => {
        const _formDataErrorObj = {
            ...(formDataErrorObject ?? formDataErrorObj),
            name: validationRules.name(_formData.name),
        } // validating name always as it's a mandatory field
        if (stageName === BuildStageVariable.Build) {
            _formDataErrorObj[BuildStageVariable.Build].isValid = _formDataErrorObj.name.isValid

            let valid = _formData.materials.reduce((isValid, mat) => {
                isValid =
                    isValid &&
                    validationRules.sourceValue(mat.regex || mat.value, mat.type !== SourceTypeMap.WEBHOOK).isValid
                return isValid
            }, true)
            if (_formData.materials.length > 1) {
                const _isWebhook = _formData.materials.some((_mat) => _mat.type === SourceTypeMap.WEBHOOK)
                if (_isWebhook) {
                    valid = true
                    _formDataErrorObj.name.isValid = true
                }
            }

            _formDataErrorObj[BuildStageVariable.Build].isValid = _formDataErrorObj.name.isValid && valid
            if (!_formDataErrorObj[BuildStageVariable.Build].isValid) {
                setShowFormError(true)
            }
        } else {
            const stepsLength = _formData[stageName].steps.length
            let isStageValid = true
            for (let i = 0; i < stepsLength; i++) {
                if (!_formDataErrorObj[stageName].steps[i]) _formDataErrorObj[stageName].steps.push({ isValid: true })
                validateTask(_formData[stageName].steps[i], _formDataErrorObj[stageName].steps[i])
                isStageValid = isStageValid && _formDataErrorObj[stageName].steps[i].isValid
            }
            if (
                mandatoryPluginData?.pluginData?.length &&
                (sharedPlugins.length || presetPlugins.length) &&
                validatePlugins
            ) {
                setMandatoryPluginData(
                    validatePlugins(formData, mandatoryPluginData.pluginData, [...sharedPlugins, ...presetPlugins]),
                )
            }
            _formDataErrorObj[stageName].isValid = isStageValid
        }
        setFormDataErrorObj(_formDataErrorObj)
    }

    const addNewTask = () => {
        const _formData = { ...formData }
        const detailsFromLastStep = calculateLastStepDetail(true, _formData, activeStageName)

        const stage = {
            id: detailsFromLastStep.index,
            index: detailsFromLastStep.index,
            name: `Task ${detailsFromLastStep.index}`,
            description: '',
            stepType: '',
            directoryPath: '',
        }
        _formData[activeStageName].steps.push(stage)
        setFormData(_formData)
        const _formDataErrorObj = { ...formDataErrorObj }
        _formDataErrorObj[activeStageName].steps.push({
            name: { isValid: true, message: null },
            isValid: true,
        })
        setFormDataErrorObj(_formDataErrorObj)
        setSelectedTaskIndex(_formData[activeStageName].steps.length - 1)
    }

    const getNavLink = (toLink: string, stageName: string) => {
        const showAlert = !formDataErrorObj[stageName].isValid
        const showWarning =
            mandatoryPluginData &&
            ((stageName === BuildStageVariable.PreBuild && !mandatoryPluginData.isValidPre) ||
                (stageName === BuildStageVariable.PostBuild && !mandatoryPluginData.isValidPost))
        return (
            <li className="tab-list__tab">
                <NavLink
                    data-testid={`${toLink}-button`}
                    replace
                    className="tab-list__tab-link fs-13 pt-5 pb-5 flexbox"
                    activeClassName="active"
                    to={toLink}
                    onClick={() => {
                        validateStage(activeStageName, formData)
                    }}
                >
                    {isJobCard ? JobPipelineTabText[stageName] : BuildTabText[stageName]}
                    {(showAlert || showWarning) && (
                        <WarningTriangle
                            className={`icon-dim-16 mr-5 ml-5 mt-3 ${
                                showAlert ? 'alert-icon-r5-imp' : 'warning-icon-y7-imp'
                            }`}
                        />
                    )}
                </NavLink>
            </li>
        )
    }

    const contextValue = useMemo(() => {
        return {
            formData,
            setFormData,
            loadingState,
            setLoadingState,
            addNewTask,
            configurationType,
            setConfigurationType,
            activeStageName,
            selectedTaskIndex,
            setSelectedTaskIndex,
            calculateLastStepDetail,
            inputVariablesListFromPrevStep,
            appId,
            formDataErrorObj,
            setFormDataErrorObj,
            validateTask,
            validateStage,
            globalVariables,
        }
    }, [
        formData,
        activeStageName,
        loadingState,
        formDataErrorObj,
        inputVariablesListFromPrevStep,
        selectedTaskIndex,
        configurationType,
        pageState,
        globalVariables,
    ])

    const renderCIPipelineModal = () => {
        return (
            <div
                className={`modal__body modal__body__ci_new_ui br-0 modal__body--p-0 ${
                    isAdvanced ? 'advanced-option-container' : 'bottom-border-radius'
                }`}
            >
                <div className="flex flex-align-center flex-justify bcn-0 pt-16 pr-20 pb-16 pl-20">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0" data-testid="build-pipeline-heading">
                        {title}
                    </h2>

                    <button
                        type="button"
                        className="dc__transparent flex icon-dim-24"
                        onClick={() => {
                            close()
                        }}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>

                {isAdvanced && (
                    <ul className="ml-20 tab-list w-90">
                        {isJobCard ? (
                            <>
                                {getNavLink(`build`, BuildStageVariable.Build)}
                                {getNavLink(`pre-build`, BuildStageVariable.PreBuild)}
                            </>
                        ) : (
                            <>
                                {isAdvanced && getNavLink(`pre-build`, BuildStageVariable.PreBuild)}
                                {getNavLink(`build`, BuildStageVariable.Build)}
                                {isAdvanced && getNavLink(`post-build`, BuildStageVariable.PostBuild)}
                            </>
                        )}
                    </ul>
                )}
                <hr className="divider m-0" />
                <pipelineContext.Provider value={contextValue}>
                    <div className={`ci-pipeline-advance ${isAdvanced ? 'pipeline-container' : ''}`}>
                        {isAdvanced && (
                            <div className="sidebar-container">
                                <Sidebar
                                    isJobView={isJobView}
                                    isJobCI={isJobCI}
                                    mandatoryPluginData={mandatoryPluginData}
                                    pluginList={[...presetPlugins, ...sharedPlugins]}
                                    setInputVariablesListFromPrevStep={setInputVariablesListFromPrevStep}
                                    mandatoryPluginsMap={mandatoryPluginsMap}
                                    environments={environments}
                                    selectedEnv={selectedEnv}
                                    setSelectedEnv={setSelectedEnv}
                                />
                            </div>
                        )}
                        <Switch>
                            {isAdvanced && (
                                <Route path={`${path}/pre-build`}>
                                    <PreBuild
                                        presetPlugins={presetPlugins}
                                        sharedPlugins={sharedPlugins}
                                        isJobView={isJobCard}
                                        mandatoryPluginsMap={mandatoryPluginsMap}
                                    />
                                </Route>
                            )}
                            {isAdvanced && (
                                <Route path={`${path}/post-build`}>
                                    <PreBuild
                                        presetPlugins={presetPlugins}
                                        sharedPlugins={sharedPlugins}
                                        mandatoryPluginsMap={mandatoryPluginsMap}
                                    />
                                </Route>
                            )}
                            <Route path={`${path}/build`}>
                                <Build
                                    pageState={pageState}
                                    showFormError={showFormError}
                                    isAdvanced={isAdvanced}
                                    ciPipeline={ciPipeline}
                                    isSecurityModuleInstalled={isSecurityModuleInstalled}
                                    setDockerConfigOverridden={setDockerConfigOverridden}
                                    isJobView={isJobCard}
                                    getPluginData={getPluginData}
                                />
                            </Route>
                            <Redirect to={`${path}/build`} />
                        </Switch>
                    </div>
                </pipelineContext.Provider>
                {pageState !== ViewType.LOADING && (
                    <>
                        <div
                            className={`ci-button-container bcn-0 pt-12 pb-12 pl-20 pr-20 flex bottom-border-radius ${
                                ciPipelineId || !isAdvanced ? 'flex-justify' : 'justify-right'
                            } `}
                        >
                            {renderSecondaryButton()}
                            {formData.ciPipelineEditable && (
                                <ButtonWithLoader
                                    rootClassName="cta cta--workflow"
                                    loaderColor="white"
                                    dataTestId="build-pipeline-button"
                                    onClick={savePipeline}
                                    disabled={
                                        apiInProgress ||
                                        (formData.isDockerConfigOverridden &&
                                            formData.dockerConfigOverride?.ciBuildConfig?.ciBuildType &&
                                            formData.dockerConfigOverride.ciBuildConfig.ciBuildType !==
                                                CIBuildType.SELF_DOCKERFILE_BUILD_TYPE &&
                                            (loadingState.loading || loadingState.failed))
                                    }
                                    isLoading={apiInProgress}
                                >
                                    {text}
                                </ButtonWithLoader>
                            )}
                        </div>
                    </>
                )}
                {ciPipelineId && showDeleteModal && renderDeleteCIModal()}
            </div>
        )
    }

    const renderFloatingVariablesWidget = () => {
        if (!window._env_.ENABLE_SCOPED_VARIABLES || activeStageName === BuildStageVariable.Build) return <></>

        return (
            <div className="flexbox">
                <div className="floating-scoped-variables-widget">
                    <FloatingVariablesSuggestions
                        zIndex={21}
                        appId={appId}
                        envId={selectedEnv?.id ? String(selectedEnv.id) : null}
                        clusterId={selectedEnv?.clusterId}
                    />
                </div>
            </div>
        )
    }

    return ciPipelineId || isAdvanced ? (
        <>
            {renderFloatingVariablesWidget()}

            <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
                {renderCIPipelineModal()}
            </Drawer>
        </>
    ) : (
        <VisibleModal className="">{renderCIPipelineModal()}</VisibleModal>
    )
}
