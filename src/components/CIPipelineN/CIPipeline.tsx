import React, { useState, useEffect, createContext, useMemo, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Redirect, Route, Switch, useParams, useRouteMatch, useLocation } from 'react-router'
import { ButtonWithLoader, importComponentFromFELibrary } from '../common'
import {
    ServerErrors,
    showError,
    ConditionalWrap,
    VisibleModal,
    Drawer,
    DeleteDialog,
    ConditionType,
    DockerConfigOverrideType,
    FormType,
    PluginType,
    RefVariableStageType,
    RefVariableType,
    ScriptType,
    StepType,
    VariableType,
    MandatoryPluginDataType,
    TaskErrorObj,
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
import { CIPipelineDataType, CIPipelineType } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import { PreBuild } from './PreBuild'
import { Sidebar } from './Sidebar'
import { Build } from './Build'
import { ReactComponent as WarningTriangle } from '../../assets/icons/ic-warning.svg'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { MULTI_REQUIRED_FIELDS_MSG } from '../../config/constantMessaging'

const processPluginData = importComponentFromFELibrary('processPluginData', null, 'function')
const validatePlugins = importComponentFromFELibrary('validatePlugins', null, 'function')
const prepareFormData = importComponentFromFELibrary('prepareFormData', null, 'function')

export const ciPipelineContext = createContext(null)

export default function CIPipeline({
    appName,
    connectCDPipelines,
    getWorkflows,
    close,
    deleteWorkflow,
    isJobView,
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
    const [pageState, setPageState] = useState(ViewType.LOADING)
    const text = ciPipelineId ? 'Update Pipeline' : 'Create Pipeline'
    const title = `${ciPipelineId ? 'Edit ' : 'Create '}${isJobView ? 'job' : 'build'} pipeline`
    const [isAdvanced, setIsAdvanced] = useState<boolean>(
        isJobView || (activeStageName !== BuildStageVariable.PreBuild && !!ciPipelineId),
    )
    const [showFormError, setShowFormError] = useState<boolean>(false)
    const [loadingData, setLoadingData] = useState<boolean>(false)
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
    const [formData, setFormData] = useState<FormType>({
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
    const [formDataErrorObj, setFormDataErrorObj] = useState({
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
    }, [location.pathname])

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
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        } else {
            getInitData(appId, true, !isJobView)
                .then((ciResponse) => {
                    setFormData(ciResponse.result.form)
                    setPageState(ViewType.FORM)
                    getAvailablePlugins(ciResponse.form)
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
                const _globalVariableOptions = response.result.map((variable) => {
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
                showError(error)
            })
    }

    const getAvailablePlugins = (_formData: FormType): void => {
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

    const getMandatoryPluginData = (_formData: FormType, pluginList: PluginDetailType[]): void => {
        if (processPluginData && prepareFormData) {
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
                        if (response?.pluginData?.length) {
                            setMandatoryPluginData(response)
                        }
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

    const getPluginData = (): void => {
        getMandatoryPluginData(formData, [...presetPlugins, ...sharedPlugins])
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
    const checkUniqueness = (): boolean => {
        const list = formData.preBuildStage.steps.concat(formData.postBuildStage.steps)
        const stageNameList = list.map((taskData) => {
            if (taskData.stepType === PluginType.INLINE) {
                if (taskData.inlineStepDetail['scriptType'] === ScriptType.CONTAINERIMAGE) {
                    if (!taskData.inlineStepDetail['isMountCustomScript']) {
                        taskData.inlineStepDetail['script'] = null
                        taskData.inlineStepDetail['storeScriptAt'] = null
                    }

                    if (!taskData.inlineStepDetail['mountCodeToContainer']) {
                        taskData.inlineStepDetail['mountCodeToContainerPath'] = null
                    }

                    if (!taskData.inlineStepDetail['mountDirectoryFromHost']) {
                        taskData.inlineStepDetail['mountPathMap'] = null
                    }
                    taskData.inlineStepDetail.outputVariables = null
                    let conditionDetails = taskData.inlineStepDetail.conditionDetails
                    for (let i = 0; i < conditionDetails?.length; i++) {
                        if (
                            conditionDetails[i].conditionType === ConditionType.PASS ||
                            conditionDetails[i].conditionType === ConditionType.FAIL
                        ) {
                            conditionDetails.splice(i, 1)
                            i--
                        }
                    }
                    taskData.inlineStepDetail.conditionDetails = conditionDetails
                }
            }
            return taskData.name
        })

        // Below code is to check if all the task name from pre-stage and post-stage is unique
        return stageNameList.length === new Set(stageNameList).size
    }
    const savePipeline = () => {
        const isUnique = checkUniqueness()
        if (!isUnique) {
            toast.error('All task names must be unique')
            return
        }
        setLoadingData(true)
        validateStage(BuildStageVariable.PreBuild, formData)
        validateStage(BuildStageVariable.Build, formData)
        validateStage(BuildStageVariable.PostBuild, formData)
        const scanValidation =
            !isSecurityModuleInstalled || formData.scanEnabled || !window._env_.FORCE_SECURITY_SCANNING
        if (!scanValidation) {
            setLoadingData(false)
            toast.error('Scanning is mandatory, please enable scanning')
            return
        }

        if (
            !formDataErrorObj.buildStage.isValid ||
            !formDataErrorObj.preBuildStage.isValid ||
            !formDataErrorObj.postBuildStage.isValid
        ) {
            setLoadingData(false)
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

        saveCIPipeline(
            {
                ...formData,
                materials: _materials,
                scanEnabled: isSecurityModuleInstalled ? formData.scanEnabled : false,
            },
            ciPipeline,
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
                    setLoadingData(false)
                    close()
                    getWorkflows()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                setLoadingData(false)
            })
    }

    const validateTask = (taskData: StepType, taskErrorobj: TaskErrorObj): void => {
        if (taskData && taskErrorobj) {
            taskErrorobj.name = validationRules.requiredField(taskData.name)
            taskErrorobj.isValid = taskErrorobj.name.isValid

            if (taskData.stepType) {
                const inputVarMap: Map<string, boolean> = new Map()
                const outputVarMap: Map<string, boolean> = new Map()
                const currentStepTypeVariable =
                    taskData.stepType === PluginType.INLINE ? 'inlineStepDetail' : 'pluginRefStepDetail'
                taskErrorobj[currentStepTypeVariable].inputVariables = []
                taskData[currentStepTypeVariable].inputVariables?.forEach((element, index) => {
                    taskErrorobj[currentStepTypeVariable].inputVariables.push(
                        validationRules.inputVariable(element, inputVarMap),
                    )
                    taskErrorobj.isValid =
                        taskErrorobj.isValid && taskErrorobj[currentStepTypeVariable].inputVariables[index].isValid
                    inputVarMap.set(element.name, true)
                })
                if (taskData.stepType === PluginType.INLINE) {
                    taskErrorobj.inlineStepDetail.outputVariables = []
                    taskData.inlineStepDetail.outputVariables?.forEach((element, index) => {
                        taskErrorobj.inlineStepDetail.outputVariables.push(
                            validationRules.outputVariable(element, outputVarMap),
                        )
                        taskErrorobj.isValid =
                            taskErrorobj.isValid && taskErrorobj.inlineStepDetail.outputVariables[index].isValid
                        outputVarMap.set(element.name, true)
                    })
                    if (taskData.inlineStepDetail['scriptType'] === ScriptType.SHELL) {
                        taskErrorobj.inlineStepDetail['script'] = validationRules.requiredField(
                            taskData.inlineStepDetail['script'],
                        )
                        taskErrorobj.isValid = taskErrorobj.isValid && taskErrorobj.inlineStepDetail['script'].isValid
                    } else if (taskData.inlineStepDetail['scriptType'] === ScriptType.CONTAINERIMAGE) {
                        // For removing empty mapping from portMap
                        taskData.inlineStepDetail['portMap'] =
                            taskData.inlineStepDetail['portMap']?.filter(
                                (_port) => _port.portOnLocal && _port.portOnContainer,
                            ) || []
                        if (taskData.inlineStepDetail['isMountCustomScript']) {
                            taskErrorobj.inlineStepDetail['script'] = validationRules.requiredField(
                                taskData.inlineStepDetail['script'],
                            )
                            taskErrorobj.inlineStepDetail['storeScriptAt'] = validationRules.requiredField(
                                taskData.inlineStepDetail['storeScriptAt'],
                            )
                            taskErrorobj.isValid =
                                taskErrorobj.isValid &&
                                taskErrorobj.inlineStepDetail['script'].isValid &&
                                taskErrorobj.inlineStepDetail['storeScriptAt'].isValid
                        }

                        taskErrorobj.inlineStepDetail['containerImagePath'] = validationRules.requiredField(
                            taskData.inlineStepDetail['containerImagePath'],
                        )
                        taskErrorobj.isValid =
                            taskErrorobj.isValid && taskErrorobj.inlineStepDetail['containerImagePath'].isValid

                        if (taskData.inlineStepDetail['mountCodeToContainer']) {
                            taskErrorobj.inlineStepDetail['mountCodeToContainerPath'] = validationRules.requiredField(
                                taskData.inlineStepDetail['mountCodeToContainerPath'],
                            )
                            taskErrorobj.isValid =
                                taskErrorobj.isValid &&
                                taskErrorobj.inlineStepDetail['mountCodeToContainerPath'].isValid
                        }

                        if (taskData.inlineStepDetail['mountDirectoryFromHost']) {
                            taskErrorobj.inlineStepDetail['mountPathMap'] = []
                            taskData.inlineStepDetail['mountPathMap']?.forEach((element, index) => {
                                taskErrorobj.inlineStepDetail['mountPathMap'].push(
                                    validationRules.mountPathMap(element),
                                )
                                taskErrorobj.isValid =
                                    taskErrorobj.isValid && taskErrorobj.inlineStepDetail['mountPathMap'][index].isValid
                            })
                        }
                    }
                } else {
                    taskData.pluginRefStepDetail.outputVariables?.forEach((element, index) => {
                        outputVarMap.set(element.name, true)
                    })
                }

                taskErrorobj[currentStepTypeVariable]['conditionDetails'] = []
                taskData[currentStepTypeVariable].conditionDetails?.forEach((element, index) => {
                    if (element.conditionOnVariable) {
                        if (
                            ((element.conditionType === ConditionType.FAIL ||
                                element.conditionType === ConditionType.PASS) &&
                                !outputVarMap.get(element.conditionOnVariable)) ||
                            ((element.conditionType === ConditionType.TRIGGER ||
                                element.conditionType === ConditionType.SKIP) &&
                                !inputVarMap.get(element.conditionOnVariable))
                        ) {
                            element.conditionOnVariable = ''
                        }
                    }
                    taskErrorobj[currentStepTypeVariable]['conditionDetails'].push(
                        validationRules.conditionDetail(element),
                    )
                    taskErrorobj.isValid =
                        taskErrorobj.isValid && taskErrorobj[currentStepTypeVariable]['conditionDetails'][index].isValid
                })
            }
        }
    }

    const validateStage = (stageName: string, _formData: FormType): void => {
        const _formDataErrorObj = { ...formDataErrorObj, name: validationRules.name(_formData.name) } // validating name always as it's a mandatory field
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

    const calculateLastStepDetail = (
        isFromAddNewTask: boolean,
        _formData: FormType,
        activeStageName: string,
        startIndex?: number,
    ): {
        index: number
        calculatedStageVariables: Map<string, VariableType>[]
    } => {
        const _formDataErrorObj = { ...formDataErrorObj }
        if (!_formData[activeStageName].steps) {
            _formData[activeStageName].steps = []
        }
        const stepsLength = _formData[activeStageName].steps?.length
        let _outputVariablesFromPrevSteps: Map<string, VariableType> = new Map(),
            _inputVariablesListPerTask: Map<string, VariableType>[] = []
        for (let i = 0; i < stepsLength; i++) {
            if (!_formDataErrorObj[activeStageName].steps[i])
                _formDataErrorObj[activeStageName].steps.push({ isValid: true })
            _inputVariablesListPerTask.push(new Map(_outputVariablesFromPrevSteps))
            _formData[activeStageName].steps[i].index = i + 1
            if (!_formData[activeStageName].steps[i].stepType) {
                continue
            }

            if (
                _formData[activeStageName].steps[i].stepType === PluginType.INLINE &&
                _formData[activeStageName].steps[i].inlineStepDetail.scriptType === ScriptType.CONTAINERIMAGE &&
                _formData[activeStageName].steps[i].inlineStepDetail.script &&
                !_formData[activeStageName].steps[i].inlineStepDetail.isMountCustomScript
            ) {
                _formData[activeStageName].steps[i].inlineStepDetail.isMountCustomScript = true
            }
            const currentStepTypeVariable =
                _formData[activeStageName].steps[i].stepType === PluginType.INLINE
                    ? 'inlineStepDetail'
                    : 'pluginRefStepDetail'
            if (!_formDataErrorObj[activeStageName].steps[i][currentStepTypeVariable]) {
                _formDataErrorObj[activeStageName].steps[i][currentStepTypeVariable] = {
                    inputVariables: [],
                    outputVariables: [],
                }
            }
            if (!_formDataErrorObj[activeStageName].steps[i][currentStepTypeVariable].inputVariables) {
                _formDataErrorObj[activeStageName].steps[i][currentStepTypeVariable].inputVariables = []
            }
            if (!_formDataErrorObj[activeStageName].steps[i][currentStepTypeVariable].outputVariables) {
                _formDataErrorObj[activeStageName].steps[i][currentStepTypeVariable].outputVariables = []
            }
            const outputVariablesLength =
                _formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables?.length
            for (let j = 0; j < outputVariablesLength; j++) {
                if (_formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables[j].name) {
                    _outputVariablesFromPrevSteps.set(
                        i +
                            1 +
                            '.' +
                            _formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables[j].name,
                        {
                            ..._formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables[j],
                            refVariableStepIndex: i + 1,
                            refVariableStage:
                                activeStageName === BuildStageVariable.PreBuild
                                    ? RefVariableStageType.PRE_CI
                                    : RefVariableStageType.POST_CI,
                        },
                    )
                }
            }
            if (
                !isFromAddNewTask &&
                i >= startIndex &&
                _formData[activeStageName].steps[i][currentStepTypeVariable].inputVariables
            ) {
                for (const key in _formData[activeStageName].steps[i][currentStepTypeVariable].inputVariables) {
                    const variableDetail =
                        _formData[activeStageName].steps[i][currentStepTypeVariable].inputVariables[key]
                    if (
                        variableDetail.variableType === RefVariableType.FROM_PREVIOUS_STEP &&
                        variableDetail.refVariableStage ===
                            (activeStageName === BuildStageVariable.PreBuild
                                ? RefVariableStageType.PRE_CI
                                : RefVariableStageType.POST_CI) &&
                        variableDetail.refVariableStepIndex > startIndex
                    ) {
                        variableDetail.refVariableStepIndex = 0
                        variableDetail.refVariableName = ''
                        variableDetail.variableType = RefVariableType.NEW
                        delete variableDetail.refVariableStage
                    }
                }
            }
        }
        if (isFromAddNewTask) {
            _inputVariablesListPerTask.push(new Map(_outputVariablesFromPrevSteps))
        }
        const _inputVariablesListFromPrevStep = { ...inputVariablesListFromPrevStep }
        _inputVariablesListFromPrevStep[activeStageName] = _inputVariablesListPerTask
        setInputVariablesListFromPrevStep(_inputVariablesListFromPrevStep)
        setFormDataErrorObj(_formDataErrorObj)
        return { index: stepsLength + 1, calculatedStageVariables: _inputVariablesListPerTask }
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
                    {isJobView ? JobPipelineTabText[stageName] : BuildTabText[stageName]}
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
                        {isJobView ? (
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
                <ciPipelineContext.Provider
                    value={{
                        formData,
                        setFormData,
                        setLoadingData,
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
                    }}
                >
                    <div className={`ci-pipeline-advance ${isAdvanced ? 'pipeline-container' : ''}`}>
                        {isAdvanced && (
                            <div className="sidebar-container">
                                <Sidebar
                                    isJobView={isJobView}
                                    mandatoryPluginData={mandatoryPluginData}
                                    pluginList={[...presetPlugins, ...sharedPlugins]}
                                    setInputVariablesListFromPrevStep={setInputVariablesListFromPrevStep}
                                    mandatoryPluginsMap={mandatoryPluginsMap}
                                />
                            </div>
                        )}
                        <Switch>
                            {isAdvanced && (
                                <Route path={`${path}/pre-build`}>
                                    <PreBuild
                                        presetPlugins={presetPlugins}
                                        sharedPlugins={sharedPlugins}
                                        isJobView={isJobView}
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
                                    isJobView={isJobView}
                                    getPluginData={getPluginData}
                                />
                            </Route>
                            <Redirect to={`${path}/build`} />
                        </Switch>
                    </div>
                </ciPipelineContext.Provider>
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
                                    isLoading={loadingData}
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

    return ciPipelineId || isAdvanced ? (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            {renderCIPipelineModal()}
        </Drawer>
    ) : (
        <VisibleModal className="">{renderCIPipelineModal()}</VisibleModal>
    )
}
