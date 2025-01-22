/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { Redirect, Route, Switch, useParams, useRouteMatch, useHistory, useLocation } from 'react-router-dom'
import {
    ServerErrors,
    showError,
    ConditionalWrap,
    VisibleModal,
    Drawer,
    DeleteDialog,
    RefVariableType,
    VariableType,
    MandatoryPluginDataType,
    ButtonWithLoader,
    PluginDataStoreType,
    ProcessPluginDataReturnType,
    PluginDetailPayloadType,
    DEFAULT_PLUGIN_DATA_STORE,
    getPluginsDetail,
    ErrorScreenManager,
    getUpdatedPluginStore,
    TabProps,
    TabGroup,
    ModuleNameMap,
    SourceTypeMap,
    DEFAULT_ENV,
    getEnvironmentListMinPublic,
    ModuleStatus,
    PipelineFormType,
    ToastVariantType,
    ToastManager,
    ProcessPluginDataParamsType,
    ResourceKindType,
    uploadCIPipelineFile,
    getGlobalVariables,
    TriggerType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import {
    FloatingVariablesSuggestions,
    getParsedBranchValuesForPlugin,
    getPluginIdsFromBuildStage,
    importComponentFromFELibrary,
    sortObjectArrayAlphabetically,
} from '../common'
import { BuildStageVariable, BuildTabText, JobPipelineTabText, URLS, ViewType } from '../../config'
import {
    deleteCIPipeline,
    getInitData,
    getInitDataWithCIPipeline,
    saveCIPipeline,
} from '../ciPipeline/ciPipeline.service'
import { ValidationRules } from '../ciPipeline/validationRules'
import { CIBuildType, CIPipelineBuildType, CIPipelineDataType, CIPipelineType } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { PreBuild } from './PreBuild'
import { Sidebar } from './Sidebar'
import { Build } from './Build'
import { ReactComponent as WarningTriangle } from '../../assets/icons/ic-warning.svg'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { MULTI_REQUIRED_FIELDS_MSG } from '../../config/constantMessaging'
import { LoadingState } from '../ciConfig/types'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { calculateLastStepDetailsLogic, checkUniqueness, validateTask } from '../cdPipeline/cdpipeline.util'
import { PipelineContext, PipelineFormDataErrorType } from '../workflowEditor/types'
import { EnvironmentWithSelectPickerType } from './types'

const processPluginData: (params: ProcessPluginDataParamsType) => Promise<ProcessPluginDataReturnType> =
    importComponentFromFELibrary('processPluginData', null, 'function')
const validatePlugins = importComponentFromFELibrary('validatePlugins', null, 'function')
export default function CIPipeline({
    appName,
    connectCDPipelines,
    getWorkflows,
    close,
    deleteWorkflow,
    isJobView,
    isJobCI,
    changeCIPayload,
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
    const [errorCode, setErrorCode] = useState<number>(null)
    const saveOrUpdateButtonTitle = ciPipelineId ? 'Update Pipeline' : 'Create Pipeline'
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
    const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(0)
    const [globalVariables, setGlobalVariables] = useState<PipelineContext['globalVariables']>([])
    const [inputVariablesListFromPrevStep, setInputVariablesListFromPrevStep] = useState<{
        preBuildStage: Map<string, VariableType>[]
        postBuildStage: Map<string, VariableType>[]
    }>({ preBuildStage: [], postBuildStage: [] })
    const [isSecurityModuleInstalled, setSecurityModuleInstalled] = useState<boolean>(false)
    const [selectedEnv, setSelectedEnv] = useState<EnvironmentWithSelectPickerType>()
    const [environments, setEnvironments] = useState<EnvironmentWithSelectPickerType[]>([])
    // NOTE: don't want to show the warning until fetch; therefore true by default
    const [isBlobStorageConfigured, setIsBlobStorageConfigured] = useState(true)
    const [formData, setFormData] = useState<PipelineFormType>({
        name: '',
        args: [],
        materials: [],
        triggerType: window._env_.DEFAULT_CI_TRIGGER_TYPE_MANUAL ? TriggerType.Manual : TriggerType.Auto,
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
        customTag: {
            tagPattern: '',
            counterX: '0',
        },
        defaultTag: [],
        enableCustomTag: false,
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
        customTag: {
            message: [],
            isValid: true,
        },
        counterX: {
            message: '',
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
        pipelineType: '',
        customTag: {
            tagPattern: '',
            counterX: '',
        },
    })
    const validationRules = new ValidationRules()
    const [mandatoryPluginData, setMandatoryPluginData] = useState<MandatoryPluginDataType>(null)
    const [pluginDataStore, setPluginDataStore] = useState<PluginDataStoreType>(
        structuredClone(DEFAULT_PLUGIN_DATA_STORE),
    )
    const [availableTags, setAvailableTags] = useState<string[]>([])
    const [hideScopedVariableWidget, setHideScopedVariableWidget] = useState<boolean>(false)
    const [disableParentModalClose, setDisableParentModalClose] = useState<boolean>(false)

    const selectedBranchRef = useRef(null)

    const handlePluginDataStoreUpdate: PipelineContext['handlePluginDataStoreUpdate'] = (updatedPluginDataStore) => {
        const { parentPluginStore, pluginVersionStore } = updatedPluginDataStore

        setPluginDataStore((prevPluginDataStore) =>
            getUpdatedPluginStore(prevPluginDataStore, parentPluginStore, pluginVersionStore),
        )
    }

    const handleHideScopedVariableWidgetUpdate: PipelineContext['handleHideScopedVariableWidgetUpdate'] = (
        hideScopedVariableWidgetValue: boolean,
    ) => {
        setHideScopedVariableWidget(hideScopedVariableWidgetValue)
    }

    const handleDisableParentModalCloseUpdate: PipelineContext['handleDisableParentModalCloseUpdate'] = (
        disableParentModalCloseValue: boolean,
    ) => {
        setDisableParentModalClose(disableParentModalCloseValue)
    }

    const handleUpdateAvailableTags: PipelineContext['handleUpdateAvailableTags'] = (tags) => {
        setAvailableTags(tags)
    }

    const getSecurityModuleStatus = async (): Promise<void> => {
        try {
            const { result } = await getModuleInfo(ModuleNameMap.SECURITY)
            if (result?.status === ModuleStatus.INSTALLED) {
                setSecurityModuleInstalled(true)
            }
        } catch (error) {
            showError(error)
        }
    }

    // mandatory plugins are applicable for job ci but not jobs
    const areMandatoryPluginPossible = !isJobView && !!processPluginData

    // NOTE: Wrap this method in try catch block to handle error
    const getMandatoryPluginData = async (
        _formData: PipelineFormType,
        /**
         * ids required to fetch in case we have a plugin in step
         */
        requiredPluginIds?: PluginDetailPayloadType['pluginIds'],
    ): Promise<void> => {
        if (areMandatoryPluginPossible) {
            let branchName = ''
            if (_formData?.materials?.length) {
                for (const material of _formData.materials) {
                    const canApplyPluginOnBranch =
                        material.type !== SourceTypeMap.WEBHOOK && (!material.isRegex || material.value)
                    if (canApplyPluginOnBranch) {
                        branchName += `${branchName ? ',' : ''}${getParsedBranchValuesForPlugin(material.value)}`
                    }
                }
            }
            if (selectedBranchRef.current !== branchName) {
                selectedBranchRef.current = branchName
                const { mandatoryPluginData: processedPluginData, pluginDataStore: updatedPluginDataStore } =
                    await processPluginData({
                        formData: _formData,
                        pluginDataStoreState: pluginDataStore,
                        appId: +appId,
                        appName,
                        ciPipelineId: +ciPipelineId,
                        branchName,
                        requiredPluginIds,
                        resourceKind: ResourceKindType.ciPipeline,
                    })

                setMandatoryPluginData(processedPluginData)
                handlePluginDataStoreUpdate(updatedPluginDataStore)
            }
        }
    }

    // NOTE: Wrap this component in try catch block to handle error
    const getInitialPlugins = async (_formData: PipelineFormType): Promise<void> => {
        const preBuildPluginIds = getPluginIdsFromBuildStage(_formData.preBuildStage)
        const postBuildPluginIds = getPluginIdsFromBuildStage(_formData.postBuildStage)

        const uniquePluginIds = [...new Set([...preBuildPluginIds, ...postBuildPluginIds])]

        if (areMandatoryPluginPossible) {
            await getMandatoryPluginData(_formData, uniquePluginIds)
            return
        }

        if (!uniquePluginIds?.length) {
            return
        }

        const {
            pluginStore: { parentPluginStore, pluginVersionStore },
        } = await getPluginsDetail({ appId: +appId, pluginIds: uniquePluginIds })

        handlePluginDataStoreUpdate(getUpdatedPluginStore(pluginDataStore, parentPluginStore, pluginVersionStore))
    }

    const getEnvironments = async (envId: number): Promise<void> => {
        envId = envId || 0
        try {
            const list = []
            list.push({
                id: 0,
                clusterName: '',
                clusterId: null,
                name: DEFAULT_ENV,
                active: false,
                isClusterActive: false,
                description: 'System default',
            })
            const environmentResponse = await getEnvironmentListMinPublic()
            const environmentResult = environmentResponse?.result ?? []
            environmentResult.forEach((env) => {
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
                }
            })
            const _selectedEnv = list.find((env) => env.id == envId)
            _selectedEnv.label = _selectedEnv.name
            _selectedEnv.value = _selectedEnv
            setSelectedEnv(_selectedEnv)
            sortObjectArrayAlphabetically(list, 'name')
            setEnvironments(list)
        } catch (error) {
            showError(error)
        }
    }

    const callGlobalVariables = async () => {
        try {
            const globalVariableOptions = await getGlobalVariables({ appId: Number(appId) })
            setGlobalVariables(globalVariableOptions)
        } catch {
            // HANDLED IN SERVICE
        }
    }

    const getPluginData = async (_formData?: PipelineFormType): Promise<void> => {
        try {
            await getMandatoryPluginData(_formData ?? formData)
        } catch (error) {
            // Do nothing
        }
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
        const { stepsLength, _inputVariablesListPerTask } = calculateLastStepDetailsLogic(
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

    const handleValidateMandatoryPlugins: PipelineContext['handleValidateMandatoryPlugins'] = ({
        newFormData = formData,
        newPluginDataStore = pluginDataStore,
    }) => {
        if (!validatePlugins || !mandatoryPluginData?.pluginData?.length) {
            return
        }

        setMandatoryPluginData(validatePlugins(newFormData, mandatoryPluginData.pluginData, newPluginDataStore))
    }

    const validateStage = (
        stageName: string,
        _formData: PipelineFormType,
        formDataErrorObject?: PipelineFormDataErrorType,
        clonedPluginDataStore: typeof pluginDataStore = pluginDataStore,
    ): void => {
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
                if (!_formDataErrorObj[stageName].steps[i]) {
                    _formDataErrorObj[stageName].steps.push({ isValid: true })
                }
                validateTask(_formData[stageName].steps[i], _formDataErrorObj[stageName].steps[i])
                isStageValid = isStageValid && _formDataErrorObj[stageName].steps[i].isValid
            }
            handleValidateMandatoryPlugins({
                newFormData: _formData,
                newPluginDataStore: clonedPluginDataStore,
            })
            _formDataErrorObj[stageName].isValid = isStageValid
        }
        setFormDataErrorObj(_formDataErrorObj)
    }

    const handleOnMountAPICalls = async () => {
        try {
            setPageState(ViewType.LOADING)
            await getSecurityModuleStatus()
            if (ciPipelineId) {
                const ciPipelineResponse = await getInitDataWithCIPipeline(appId, ciPipelineId, true)
                if (ciPipelineResponse) {
                    const preBuildVariable = calculateLastStepDetail(
                        false,
                        ciPipelineResponse.form,
                        BuildStageVariable.PreBuild,
                    ).calculatedStageVariables
                    const postBuildVariable = calculateLastStepDetail(
                        false,
                        ciPipelineResponse.form,
                        BuildStageVariable.PostBuild,
                    ).calculatedStageVariables
                    setInputVariablesListFromPrevStep({
                        preBuildStage: preBuildVariable,
                        postBuildStage: postBuildVariable,
                    })
                    validateStage(BuildStageVariable.PreBuild, ciPipelineResponse.form)
                    validateStage(BuildStageVariable.Build, ciPipelineResponse.form)
                    validateStage(BuildStageVariable.PostBuild, ciPipelineResponse.form)
                    setFormData(ciPipelineResponse.form)
                    setIsBlobStorageConfigured(ciPipelineResponse.isBlobStorageConfigured)
                    setCIPipeline(ciPipelineResponse.ciPipeline)
                    await getInitialPlugins(ciPipelineResponse.form)
                    await getEnvironments(ciPipelineResponse.ciPipeline.environmentId)
                    setIsAdvanced(true)
                }
            } else {
                const ciPipelineResponse = await getInitData(appId, true, isJobCard)
                if (ciPipelineResponse) {
                    setFormData(ciPipelineResponse.result.form)
                    await getInitialPlugins(ciPipelineResponse.result.form)
                    await getEnvironments(0)
                }
            }
            await callGlobalVariables()
            setPageState(ViewType.FORM)
        } catch (error) {
            setPageState(ViewType.ERROR)
            setErrorCode(error?.code)
            showError(error)
        }
    }

    useEffect(() => {
        handleOnMountAPICalls()
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
            const editCIPipelineURL: string = location.pathname.replace(
                `/${URLS.APP_CI_CONFIG}/`,
                `/${URLS.APP_JOB_CI_CONFIG}/`,
            )
            history.push(editCIPipelineURL)
        }
    }, [location.pathname, ciPipeline.pipelineType])

    const handleClose = () => {
        if (disableParentModalClose) {
            return null
        }

        close()
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
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Pipeline Deleted',
                    })
                    setPageState(ViewType.FORM)
                    handleClose()
                    deleteWorkflow(appId, Number(workflowId))
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
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
                        className="cta cta--workflow delete mr-16"
                        disabled={!canDeletePipeline}
                        onClick={() => {
                            setShowDeleteModal(true)
                        }}
                    >
                        Delete Pipeline
                    </button>
                </ConditionalWrap>
            )
        }
        if (!isAdvanced) {
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
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'All task names must be unique',
            })
            return
        }
        setApiInProgress(true)
        validateStage(BuildStageVariable.PreBuild, formData)
        validateStage(BuildStageVariable.Build, formData)
        validateStage(BuildStageVariable.PostBuild, formData)
        const scanValidation =
            isJobCard || !isSecurityModuleInstalled || formData.scanEnabled || !window._env_.FORCE_SECURITY_SCANNING
        if (!scanValidation) {
            setApiInProgress(false)
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Scanning is mandatory, please enable scanning',
            })
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
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: MULTI_REQUIRED_FIELDS_MSG,
                })
            }
            return
        }

        const msg = ciPipeline.id ? 'Pipeline Updated' : 'Pipeline Created'

        // here we check for the case where the pipeline is multigit and user selects pullrequest or tag creation(webhook)
        // in that case we only send the webhook data not the other one.
        let _materials = formData.materials
        if (formData.materials.length > 1) {
            for (const material of formData.materials) {
                if (material.type === SourceTypeMap.WEBHOOK) {
                    _materials = [material]
                    break
                }
            }
        }

        const _ciPipeline = ciPipeline
        if (selectedEnv && selectedEnv.id !== 0) {
            _ciPipeline.environmentId = selectedEnv.id
        } else {
            _ciPipeline.environmentId = undefined
        }
        if (!isJobView) {
            let ciPipelineType: CIPipelineBuildType = CIPipelineBuildType.CI_BUILD
            if (ciPipeline.isExternal) {
                ciPipelineType = CIPipelineBuildType.CI_LINKED
            } else if (isJobCI) {
                ciPipelineType = CIPipelineBuildType.CI_JOB
            }
            _ciPipeline.pipelineType = ciPipeline.id ? ciPipeline.pipelineType : ciPipelineType
        }
        if (isJobView) {
            _ciPipeline.pipelineType = CIPipelineBuildType.CI_BUILD
        }
        saveCIPipeline(
            {
                ...formData,
                materials: _materials,
                scanEnabled: !isJobCard && isSecurityModuleInstalled ? formData.scanEnabled : false,
            },
            _ciPipeline,
            _materials,
            +appId,
            +workflowId,
            false,
            formData.webhookConditionList,
            formData.ciPipelineSourceTypeOptions,
            changeCIPayload,
        )
            .then((response) => {
                if (response) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: msg,
                    })
                    setApiInProgress(false)
                    handleClose()
                    getWorkflows()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                setApiInProgress(false)
            })
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

    const getNavLink = (toLink: string, stageName: string): TabProps => {
        const showError = !formDataErrorObj[stageName].isValid
        const showWarning =
            mandatoryPluginData &&
            ((stageName === BuildStageVariable.PreBuild && !mandatoryPluginData.isValidPre) ||
                (stageName === BuildStageVariable.PostBuild && !mandatoryPluginData.isValidPost))

        return {
            id: `${isJobCard ? JobPipelineTabText[stageName] : BuildTabText[stageName]}-tab`,
            label: isJobCard ? JobPipelineTabText[stageName] : BuildTabText[stageName],
            tabType: 'navLink',
            props: {
                to: toLink,
                replace: true,
                onClick: () => {
                    validateStage(activeStageName, formData)
                },
                'data-testid': `${toLink}-button`,
            },
            showError,
            showWarning,
        }
    }

    const uploadFile: PipelineContext['uploadFile'] = ({ allowedExtensions, file, maxUploadSize }) =>
        uploadCIPipelineFile({
            appId: +appId,
            envId: isJobView ? selectedEnv?.id : null,
            ciPipelineId: +ciPipelineId,
            file,
            allowedExtensions,
            maxUploadSize,
        })

    const contextValue = useMemo(
        () => ({
            formData,
            setFormData,
            loadingState,
            setLoadingState,
            addNewTask,
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
            pluginDataStore,
            handlePluginDataStoreUpdate,
            pageState,
            availableTags,
            handleUpdateAvailableTags,
            handleHideScopedVariableWidgetUpdate,
            handleDisableParentModalCloseUpdate,
            handleValidateMandatoryPlugins,
            mandatoryPluginData,
            isBlobStorageConfigured,
            uploadFile,
        }),
        [
            formData,
            activeStageName,
            loadingState,
            formDataErrorObj,
            inputVariablesListFromPrevStep,
            selectedTaskIndex,
            pageState,
            globalVariables,
            pluginDataStore,
            availableTags,
            mandatoryPluginData,
            isBlobStorageConfigured,
        ],
    )

    const renderCIPipelineModalContent = () => {
        if (pageState === ViewType.ERROR) {
            return <ErrorScreenManager code={errorCode} reload={handleOnMountAPICalls} />
        }

        return (
            <>
                {isAdvanced && (
                    <div className="ml-20 w-90">
                        <TabGroup
                            tabs={
                                isJobCard
                                    ? [
                                          getNavLink(`build`, BuildStageVariable.Build),
                                          getNavLink(`pre-build`, BuildStageVariable.PreBuild),
                                      ]
                                    : [
                                          getNavLink(`pre-build`, BuildStageVariable.PreBuild),
                                          getNavLink(`build`, BuildStageVariable.Build),
                                          getNavLink(`post-build`, BuildStageVariable.PostBuild),
                                      ]
                            }
                            hideTopPadding
                            alignActiveBorderWithContainer
                        />
                    </div>
                )}
                <hr className="divider m-0" />
                <pipelineContext.Provider value={contextValue}>
                    <div className={`ci-pipeline-advance ${isAdvanced ? 'pipeline-container' : ''}`}>
                        {isAdvanced && (
                            <div className="sidebar-container">
                                <Sidebar
                                    isJobView={isJobView}
                                    isJobCI={isJobCI}
                                    setInputVariablesListFromPrevStep={setInputVariablesListFromPrevStep}
                                    environments={environments}
                                    selectedEnv={selectedEnv}
                                    setSelectedEnv={setSelectedEnv}
                                />
                            </div>
                        )}
                        <Switch>
                            {isAdvanced && (
                                <Route path={`${path}/pre-build`}>
                                    <PreBuild isJobView={isJobCard} />
                                </Route>
                            )}
                            {isAdvanced && (
                                <Route path={`${path}/post-build`}>
                                    <PreBuild />
                                </Route>
                            )}
                            <Route path={`${path}/build`}>
                                <Build
                                    pageState={pageState}
                                    showFormError={showFormError}
                                    isAdvanced={isAdvanced}
                                    ciPipeline={ciPipeline}
                                    isSecurityModuleInstalled={isSecurityModuleInstalled}
                                    isJobView={isJobCard}
                                    getPluginData={getPluginData}
                                />
                            </Route>
                            <Redirect to={`${path}/build`} />
                        </Switch>
                    </div>
                </pipelineContext.Provider>
                {pageState !== ViewType.LOADING && (
                    <div
                        className={`ci-button-container bg__primary pt-12 pb-12 pl-20 pr-20 flex bottom-border-radius ${
                            ciPipelineId || !isAdvanced ? 'flex-justify' : 'justify-right'
                        } `}
                    >
                        {renderSecondaryButton()}
                        {formData.ciPipelineEditable && (
                            <ButtonWithLoader
                                rootClassName="cta cta--workflow"
                                dataTestId="build-pipeline-button"
                                onClick={savePipeline}
                                disabled={
                                    apiInProgress ||
                                    (formData.isDockerConfigOverridden &&
                                        formData.dockerConfigOverride?.ciBuildConfig?.ciBuildType &&
                                        formData.dockerConfigOverride.ciBuildConfig.ciBuildType !==
                                            CIBuildType.SELF_DOCKERFILE_BUILD_TYPE &&
                                        (loadingState.loading || loadingState.failed)) ||
                                    formDataErrorObj.customTag.message.length > 0 ||
                                    formDataErrorObj.counterX?.message.length > 0
                                }
                                isLoading={apiInProgress}
                            >
                                {saveOrUpdateButtonTitle}
                            </ButtonWithLoader>
                        )}
                    </div>
                )}
                {ciPipelineId && showDeleteModal && renderDeleteCIModal()}
            </>
        )
    }

    const renderCIPipelineModal = () => {
        return (
            <div
                className={`modal__body modal__body__ci_new_ui br-0 modal__body--p-0 ${
                    isAdvanced ? 'advanced-option-container' : 'bottom-border-radius'
                }`}
            >
                <div className="flex flex-align-center flex-justify bg__primary py-12 px-20">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0" data-testid="build-pipeline-heading">
                        {title}
                    </h2>

                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={handleClose}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>

                {renderCIPipelineModalContent()}
            </div>
        )
    }

    const renderFloatingVariablesWidget = () => {
        if (
            !window._env_.ENABLE_SCOPED_VARIABLES ||
            activeStageName === BuildStageVariable.Build ||
            hideScopedVariableWidget
        ) {
            return <></>
        }

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

            <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px" onEscape={handleClose}>
                {renderCIPipelineModal()}
            </Drawer>
        </>
    ) : (
        <VisibleModal className="">{renderCIPipelineModal()}</VisibleModal>
    )
}
