import React, { useState, useEffect, createContext } from 'react'
import { NavLink } from 'react-router-dom'
import { ButtonWithLoader, ConditionalWrap, DeleteDialog, showError, VisibleModal } from '../common'
import { Redirect, Route, Switch, useParams, useRouteMatch, useLocation, useHistory } from 'react-router'
import { BuildStageVariable, BuildTabText, TriggerType, ViewType } from '../../config'
import {
    deleteCIPipeline,
    getGlobalVariable,
    getInitData,
    getInitDataWithCIPipeline,
    saveCIPipeline,
} from '../ciPipeline/ciPipeline.service'
import { toast } from 'react-toastify'
import { ServerErrors } from '../../modals/commonTypes'
import { ValidationRules } from '../ciPipeline/validationRules'
import {
    CIPipelineDataType,
    FormType,
    PluginType,
    RefVariableStageType,
    RefVariableType,
    StepType,
    TaskErrorObj,
    VariableType,
} from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import { PreBuild } from './PreBuild'
import { Sidebar } from './Sidebar'
import { Build } from './Build'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'

interface CIPipelineType {
    appName: string
    connectCDPipelines: number
    getWorkflows: () => void
    close: () => void
}

export const ciPipelineContext = createContext(null)

export default function CIPipeline({ appName, connectCDPipelines, getWorkflows, close }: CIPipelineType) {
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
    const title = ciPipelineId ? 'Edit build pipeline' : 'Create build pipeline'
    const [isAdvanced, setIsAdvanced] = useState<boolean>(
        activeStageName !== BuildStageVariable.PreBuild && !!ciPipelineId,
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
    const [formData, setFormData] = useState<FormType>({
        name: '',
        args: [{ key: '', value: '' }],
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
    useEffect(() => {
        setPageState(ViewType.LOADING)
        if (ciPipelineId) {
            getInitDataWithCIPipeline(appId, ciPipelineId, true)
                .then((response) => {
                    calculateLastStepDetail(false, response.form, BuildStageVariable.PreBuild)
                    calculateLastStepDetail(false, response.form, BuildStageVariable.PostBuild)
                    setFormData(response.form)
                    setCIPipeline(response.ciPipeline)
                    setIsAdvanced(true)
                    setPageState(ViewType.FORM)
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        } else {
            getInitData(appId, true)
                .then((response) => {
                    setFormData(response.result.form)
                    setPageState(ViewType.FORM)
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        }
    }, [])
    useEffect(() => {
        getGlobalVariable(Number(appId))
            .then((response) => {
                const _globalVariableOptions = response.result.map((variable) => {
                    variable.label = variable.name
                    variable.value = variable.name
                    variable.format = 'string'
                    delete variable.name
                    return variable
                })
                setGlobalVariables(_globalVariableOptions || [])
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
    }, [])

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
                    getWorkflows()
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
        if (ciPipelineId && showDeleteModal) {
            return (
                <DeleteDialog
                    title={`Delete '${formData.name}' ?`}
                    description={`Are you sure you want to delete this CI Pipeline from '${appName}' ?`}
                    closeDelete={closeCIDeleteModal}
                    delete={deletePipeline}
                />
            )
        }
        return null
    }

    const renderSecondaryButtton = () => {
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
                    className={`cta cta--workflow cancel mr-16`}
                    onClick={() => {
                        setIsAdvanced(true)
                    }}
                >
                    Advanced options
                </button>
            )
        }
    }

    const checkUniqueness = (): boolean => {
        const list = formData.preBuildStage.steps.concat(formData.postBuildStage.steps)
        const stageNameList = list.map((l) => {
            return l.name
        })
        const set = new Set()
        for (let i = 0; i < stageNameList.length; i++) {
            if (set.has(stageNameList[i])) {
                return false
            } else {
                set.add(stageNameList[i])
            }
        }
        return true
    }

    const savePipeline = () => {
        const isUnique = checkUniqueness()
        if (!isUnique) {
            toast.error('All task names must be unique')
            return
        }
        setLoadingData(true)
        setShowFormError(true)
        const errObj = validationRules.name(formData.name)
        let valid = formData.materials.reduce((isValid, mat) => {
            isValid = isValid && validationRules.sourceValue(mat.value).isValid
            return isValid
        }, true)
        valid = valid && errObj.isValid
        validateStage(BuildStageVariable.PreBuild)
        validateStage(BuildStageVariable.PostBuild)
        valid = valid && formDataErrorObj.preBuildStage.isValid && formDataErrorObj.postBuildStage.isValid
        const scanValidation = formData.scanEnabled || !window._env_.FORCE_SECURITY_SCANNING
        if (!scanValidation) {
            setLoadingData(false)
            toast.error('Scanning is mandatory, please enable scanning')
            return
        }
        if (!valid) {
            setLoadingData(false)
            toast.error('Some Required Fields are missing')
            return
        }
        const msg = ciPipeline.id ? 'Pipeline Updated' : 'Pipeline Created'
        saveCIPipeline(
            formData,
            ciPipeline,
            formData.materials,
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
            taskErrorobj.name = validationRules.taskName(taskData.name)
            taskErrorobj.isValid = taskErrorobj.name.isValid

            if (taskData.stepType) {
                const currentStepTypeVariable =
                    taskData.stepType === PluginType.INLINE ? 'inlineStepDetail' : 'pluginRefStepDetail'
                taskErrorobj[currentStepTypeVariable].inputVariables = []
                taskData[currentStepTypeVariable].inputVariables?.forEach((element, index) => {
                    taskErrorobj[currentStepTypeVariable].inputVariables.push(validationRules.inputVariable(element))
                    taskErrorobj.isValid =
                        taskErrorobj.isValid && taskErrorobj[currentStepTypeVariable].inputVariables[index].isValid
                })
                if (taskData.stepType === PluginType.INLINE) {
                    taskErrorobj[currentStepTypeVariable].outputVariables = []
                    taskData[currentStepTypeVariable].inputVariables?.forEach((element, index) => {
                        taskErrorobj[currentStepTypeVariable].outputVariables.push(
                            validationRules.outputVariable(element),
                        )
                        taskErrorobj.isValid =
                            taskErrorobj.isValid && taskErrorobj[currentStepTypeVariable].outputVariables[index].isValid
                    })

                    // For removing empty mapping from portMap
                    taskData[currentStepTypeVariable]['portMap'] =
                        taskData[currentStepTypeVariable]['portMap']?.filter(
                            (_port) => _port.portOnLocal && _port.portOnContainer,
                        ) || []
                }
            }
        }
    }

    const validateStage = (stageName: string): void => {
        const _formDataErrorObj = { ...formDataErrorObj }
        if (stageName === BuildStageVariable.Build) {
            _formDataErrorObj.name = validationRules.name(formData.name)
            _formDataErrorObj[BuildStageVariable.Build].isValid = _formDataErrorObj.name.isValid
        } else {
            const stepsLength = formData[stageName].steps.length
            let isStageValid = true
            for (let i = 0; i < stepsLength; i++) {
                if (!_formDataErrorObj[stageName]['steps'][i])
                    _formDataErrorObj[stageName]['steps'].push({ isValid: true })
                validateTask(formData[stageName]['steps'][i], _formDataErrorObj[stageName]['steps'][i])
                isStageValid = isStageValid && _formDataErrorObj[stageName]['steps'][i].isValid
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
    ): { index: number } => {
        const _formDataErrorObj = { ...formDataErrorObj }
        if (!_formData[activeStageName].steps) {
            _formData[activeStageName].steps = []
        }
        const stepsLength = _formData[activeStageName].steps?.length
        let index = 0
        let _outputVariablesFromPrevSteps: Map<string, VariableType> = new Map(),
            _inputVariablesListPerTask: Map<string, VariableType>[] = []
        for (let i = 0; i < stepsLength; i++) {
            if (!_formDataErrorObj[activeStageName]['steps'][i])
                _formDataErrorObj[activeStageName]['steps'].push({ isValid: true })
            _inputVariablesListPerTask.push(new Map(_outputVariablesFromPrevSteps))
            if (index <= _formData[activeStageName].steps[i].index) {
                index = _formData[activeStageName].steps[i].index
            }
            if (!_formData[activeStageName].steps[i].stepType) {
                continue
            }
            const currentStepTypeVariable =
                _formData[activeStageName].steps[i].stepType === PluginType.INLINE
                    ? 'inlineStepDetail'
                    : 'pluginRefStepDetail'
            if (!_formDataErrorObj[activeStageName]['steps'][i][currentStepTypeVariable]) {
                _formDataErrorObj[activeStageName]['steps'][i][currentStepTypeVariable] = {
                    inputVariables: [],
                    outputVariables: [],
                }
            }
            if (!_formDataErrorObj[activeStageName]['steps'][i][currentStepTypeVariable].inputVariables) {
                _formDataErrorObj[activeStageName]['steps'][i][currentStepTypeVariable].inputVariables = []
            }
            if (!_formDataErrorObj[activeStageName]['steps'][i][currentStepTypeVariable].outputVariables) {
                _formDataErrorObj[activeStageName]['steps'][i][currentStepTypeVariable].outputVariables = []
            }
            const outputVariablesLength =
                _formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables?.length
            for (let j = 0; j < outputVariablesLength; j++) {
                if (_formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables[j].name) {
                    _outputVariablesFromPrevSteps.set(
                        index +
                            '.' +
                            _formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables[j].name,
                        {
                            ..._formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables[j],
                            refVariableStepIndex: index,
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
                        variableDetail.refVariableUsed &&
                        variableDetail.variableType === RefVariableType.FROM_PREVIOUS_STEP &&
                        variableDetail.refVariableStage ===
                            (activeStageName === BuildStageVariable.PreBuild
                                ? RefVariableStageType.PRE_CI
                                : RefVariableStageType.POST_CI) &&
                        variableDetail.refVariableStepIndex > startIndex
                    ) {
                        variableDetail.refVariableUsed = false
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
            index++
        }
        const _inputVariablesListFromPrevStep = { ...inputVariablesListFromPrevStep }
        _inputVariablesListFromPrevStep[activeStageName] = _inputVariablesListPerTask
        setInputVariablesListFromPrevStep(_inputVariablesListFromPrevStep)
        setFormDataErrorObj(_formDataErrorObj)
        return { index: index }
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
        _formDataErrorObj[activeStageName]['steps'].push({
            name: { isValid: true, message: null },
            isValid: true,
        })
        setFormDataErrorObj(_formDataErrorObj)
        setSelectedTaskIndex(_formData[activeStageName].steps.length - 1)
    }

    const getNavLink = (toLink: string, stageName: string) => {
        return (
            <li className="tab-list__tab">
                <NavLink
                    replace
                    className="tab-list__tab-link fs-13 pt-5 pb-5 flexbox"
                    activeClassName="active"
                    to={toLink}
                    onClick={() => {
                        validateStage(activeStageName)
                    }}
                >
                    {BuildTabText[stageName]}
                    {!formDataErrorObj[stageName].isValid && <AlertTriangle className="icon-dim-16 mr-5 ml-5 mt-3" />}
                </NavLink>
            </li>
        )
    }

    return (
        <VisibleModal className="">
            {' '}
            <div
                className={`modal__body modal__body__ci_new_ui br-0 modal__body--p-0 ${
                    isAdvanced ? 'advanced-option-container' : 'bottom-border-radius'
                }`}
            >
                <div className="flex flex-align-center flex-justify bcn-0 pr-20">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">{title}</h2>
                    <button
                        type="button"
                        className="transparent flex icon-dim-24"
                        onClick={() => {
                            close()
                        }}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                {isAdvanced && (
                    <ul className="ml-20 tab-list w-90">
                        {isAdvanced && getNavLink(`pre-build`, BuildStageVariable.PreBuild)}
                        {getNavLink(`build`, BuildStageVariable.Build)}
                        {isAdvanced && getNavLink(`post-build`, BuildStageVariable.PostBuild)}
                    </ul>
                )}
                <hr className="divider m-0" />
                <ciPipelineContext.Provider
                    value={{
                        formData,
                        setFormData,
                        addNewTask,
                        configurationType,
                        setConfigurationType,
                        activeStageName,
                        selectedTaskIndex,
                        setSelectedTaskIndex,
                        calculateLastStepDetail,
                        setPageState,
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
                                <Sidebar />
                            </div>
                        )}
                        <Switch>
                            {isAdvanced && (
                                <Route path={`${path}/pre-build`}>
                                    <PreBuild />
                                </Route>
                            )}
                            {isAdvanced && (
                                <Route path={`${path}/post-build`}>
                                    <PreBuild />
                                </Route>
                            )}
                            <Route path={`${path}/build`}>
                                <Build
                                    showFormError={showFormError}
                                    isAdvanced={isAdvanced}
                                    ciPipelineId={ciPipeline.id}
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
                            {renderSecondaryButtton()}
                            {formData.ciPipelineEditable && (
                                <ButtonWithLoader
                                    rootClassName="cta cta--workflow"
                                    loaderColor="white"
                                    onClick={savePipeline}
                                    isLoading={loadingData}
                                >
                                    {text}
                                </ButtonWithLoader>
                            )}
                        </div>
                    </>
                )}
                {renderDeleteCIModal()}
            </div>
        </VisibleModal>
    )
}
