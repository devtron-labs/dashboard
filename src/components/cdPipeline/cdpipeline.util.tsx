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

import { components } from 'react-select'
import {
    BuildStageVariable,
    ConditionType,
    DeploymentAppTypes,
    PluginType,
    RefVariableStageType,
    RefVariableType,
    ScriptType,
    StepType,
    TaskErrorObj,
    VariableType,
    PipelineFormType,
    InputOutputVariablesHeaderKeys,
    ConditionDataTableHeaderKeys,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-nav-search.svg'
import { ValidationRules } from '../ciPipeline/validationRules'
import { PipelineFormDataErrorType } from '../workflowEditor/types'
import { DELETE_ACTION } from '../../config'
import { PluginVariableType } from '@Components/ciPipeline/types'
import {
    MigrateArgoAppToCDPipelineRequiredBasePayloadType,
    MigrateArgoAppToCDPipelineRequiredPayloadType,
    MigrateToDevtronFormState,
} from './cdPipeline.types'

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-20 icon-n5" />
        </components.DropdownIndicator>
    )
}

export const NUMBER_OF_APPROVALS = 6

export const ValueContainer = (props) => {
    return (
        <span className="flex left w-100">
            <Search className="icon-dim-16 scn-6 ml-8" />
            <components.ValueContainer {...props}>{props.children}</components.ValueContainer>
        </span>
    )
}

export const validateTask = (
    taskData: StepType,
    taskErrorObj: TaskErrorObj,
    options?: {
        isSaveAsPlugin?: boolean
        validateVariableDataTable?: boolean
        validateConditionDetails?: boolean
    },
) => {
    const { isSaveAsPlugin = false, validateVariableDataTable = true, validateConditionDetails = true } = options ?? {}
    const validationRules = new ValidationRules()
    if (taskData && taskErrorObj) {
        taskErrorObj.name = validationRules.requiredField(taskData.name)
        taskErrorObj.isValid = taskErrorObj.name.isValid

        if (taskData.stepType) {
            const currentStepTypeVariable =
                taskData.stepType === PluginType.INLINE ? 'inlineStepDetail' : 'pluginRefStepDetail'

            const inputVarMap = (taskData[currentStepTypeVariable].inputVariables ?? []).reduce((acc, curr) => {
                acc[curr.name] = (acc[curr.name] || 0) + 1
                return acc
            }, {})

            const outputVarMap = (taskData[currentStepTypeVariable].outputVariables ?? []).reduce((acc, curr) => {
                acc[curr.name] = (acc[curr.name] || 0) + 1
                return acc
            }, {})

            if (validateVariableDataTable) {
                taskErrorObj[currentStepTypeVariable].isInputVariablesValid = true
                taskErrorObj[currentStepTypeVariable].inputVariables = (
                    taskData[currentStepTypeVariable].inputVariables ?? []
                ).reduce((acc, element) => {
                    acc[element.id] = Object.values(InputOutputVariablesHeaderKeys).reduce((keyAcc, key) => {
                        const validationState =
                            !isSaveAsPlugin || key !== InputOutputVariablesHeaderKeys.VALUE
                                ? validationRules.validateInputOutputVariableCell({
                                      variable: element,
                                      key,
                                      type: PluginVariableType.INPUT,
                                      keysFrequencyMap: inputVarMap,
                                  })
                                : { isValid: true, errorMessages: [] }

                        taskErrorObj[currentStepTypeVariable].isInputVariablesValid =
                            taskErrorObj[currentStepTypeVariable].isInputVariablesValid && validationState.isValid
                        keyAcc[key] = validationState
                        return keyAcc
                    }, {})

                    return acc
                }, {})
            }

            taskErrorObj.isValid =
                taskErrorObj.isValid && (taskErrorObj[currentStepTypeVariable].isInputVariablesValid ?? true)

            if (taskData.stepType === PluginType.INLINE) {
                if (validateVariableDataTable) {
                    taskErrorObj[currentStepTypeVariable].isOutputVariablesValid = true
                    taskErrorObj[currentStepTypeVariable].outputVariables = (
                        taskData[currentStepTypeVariable].outputVariables ?? []
                    ).reduce((acc, element) => {
                        acc[element.id] = Object.values(InputOutputVariablesHeaderKeys).reduce((keyAcc, key) => {
                            const validationState = validationRules.validateInputOutputVariableCell({
                                variable: element,
                                key,
                                type: PluginVariableType.OUTPUT,
                                keysFrequencyMap: outputVarMap,
                            })
                            taskErrorObj[currentStepTypeVariable].isOutputVariablesValid =
                                taskErrorObj[currentStepTypeVariable].isOutputVariablesValid && validationState.isValid
                            keyAcc[key] = validationState
                            return keyAcc
                        }, {})

                        return acc
                    }, {})
                }

                taskErrorObj.isValid =
                    taskErrorObj.isValid && (taskErrorObj[currentStepTypeVariable].isOutputVariablesValid ?? true)

                if (taskData.inlineStepDetail['scriptType'] === ScriptType.SHELL) {
                    taskErrorObj.inlineStepDetail['script'] = validationRules.requiredField(
                        taskData.inlineStepDetail['script'],
                    )
                    taskErrorObj.isValid = taskErrorObj.isValid && taskErrorObj.inlineStepDetail['script'].isValid
                } else if (taskData.inlineStepDetail['scriptType'] === ScriptType.CONTAINERIMAGE) {
                    // For removing empty mapping from portMap
                    taskData.inlineStepDetail['portMap'] =
                        taskData.inlineStepDetail['portMap']?.filter(
                            (_port) => _port.portOnLocal && _port.portOnContainer,
                        ) || []
                    if (taskData.inlineStepDetail['isMountCustomScript']) {
                        taskErrorObj.inlineStepDetail['script'] = validationRules.requiredField(
                            taskData.inlineStepDetail['script'],
                        )
                        taskErrorObj.inlineStepDetail['storeScriptAt'] = validationRules.requiredField(
                            taskData.inlineStepDetail['storeScriptAt'],
                        )
                        taskErrorObj.isValid =
                            taskErrorObj.isValid &&
                            taskErrorObj.inlineStepDetail['script'].isValid &&
                            taskErrorObj.inlineStepDetail['storeScriptAt'].isValid
                    }

                    taskErrorObj.inlineStepDetail['containerImagePath'] = validationRules.requiredField(
                        taskData.inlineStepDetail['containerImagePath'],
                    )
                    taskErrorObj.isValid =
                        taskErrorObj.isValid && taskErrorObj.inlineStepDetail['containerImagePath'].isValid

                    if (taskData.inlineStepDetail['mountCodeToContainer']) {
                        taskErrorObj.inlineStepDetail['mountCodeToContainerPath'] = validationRules.requiredField(
                            taskData.inlineStepDetail['mountCodeToContainerPath'],
                        )
                        taskErrorObj.isValid =
                            taskErrorObj.isValid && taskErrorObj.inlineStepDetail['mountCodeToContainerPath'].isValid
                    }

                    if (taskData.inlineStepDetail['mountDirectoryFromHost']) {
                        taskErrorObj.inlineStepDetail['mountPathMap'] = []
                        taskData.inlineStepDetail['mountPathMap']?.forEach((element, index) => {
                            taskErrorObj.inlineStepDetail['mountPathMap'].push(validationRules.mountPathMap(element))
                            taskErrorObj.isValid =
                                taskErrorObj.isValid && taskErrorObj.inlineStepDetail['mountPathMap'][index].isValid
                        })
                    }
                }
            } else {
                taskData.pluginRefStepDetail.outputVariables?.forEach((element) => {
                    outputVarMap[element.name] = (outputVarMap[element.name] || 0) + 1
                })
            }

            if (validateConditionDetails) {
                taskErrorObj[currentStepTypeVariable].isConditionDetailsValid = true

                taskErrorObj[currentStepTypeVariable]['conditionDetails'] = (
                    taskData[currentStepTypeVariable].conditionDetails ?? []
                ).reduce((acc, element) => {
                    acc[element.id] = Object.values(ConditionDataTableHeaderKeys).reduce((keyAcc, key) => {
                        let _conditionOnVariable = element.conditionOnVariable

                        if (element.conditionOnVariable) {
                            if (
                                ((element.conditionType === ConditionType.FAIL ||
                                    element.conditionType === ConditionType.PASS) &&
                                    !outputVarMap[element.conditionOnVariable]) ||
                                ((element.conditionType === ConditionType.TRIGGER ||
                                    element.conditionType === ConditionType.SKIP) &&
                                    !inputVarMap[element.conditionOnVariable])
                            ) {
                                _conditionOnVariable = ''
                            }
                        }

                        const validationState = validationRules.validateConditionDataCell({
                            key,
                            condition: {
                                conditionalValue: element.conditionalValue,
                                conditionOnVariable: _conditionOnVariable,
                                conditionOperator: element.conditionOperator,
                            },
                        })

                        taskErrorObj[currentStepTypeVariable].isConditionDetailsValid =
                            taskErrorObj[currentStepTypeVariable].isConditionDetailsValid && validationState.isValid
                        keyAcc[key] = validationState

                        return keyAcc
                    }, {})

                    return acc
                }, {})
            }

            taskErrorObj.isValid =
                taskErrorObj.isValid && (taskErrorObj[currentStepTypeVariable].isConditionDetailsValid ?? true)
        }
    }
}

const checkStepsUniqueness = (list): boolean => {
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
                const { conditionDetails } = taskData.inlineStepDetail
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

export const checkUniqueness = (formData, isCDPipeline?: boolean): boolean => {
    if (isCDPipeline) {
        const preStageValidation: boolean = checkStepsUniqueness(formData.preBuildStage.steps)
        const postStageValidation: boolean = checkStepsUniqueness(formData.postBuildStage.steps)
        return preStageValidation && postStageValidation
    }
    const list = formData.preBuildStage.steps.concat(formData.postBuildStage.steps)
    return checkStepsUniqueness(list)
}

/**
 * @description This method adds the output variables of the previous steps to the input variables of the next steps
 */
export const calculateLastStepDetailsLogic = (
    _formData: PipelineFormType,
    activeStageName: string,
    _formDataErrorObj: PipelineFormDataErrorType,
    isFromAddNewTask,
    startIndex: number,
    isFromMoveTask: boolean,
    isCDPipeline?: boolean,
    globalVariables?: { label: string; value: string; format: string; stageType: string }[],
) => {
    if (!_formData[activeStageName].steps) {
        _formData[activeStageName].steps = []
    }
    const stepsLength = _formData[activeStageName].steps?.length
    const _outputVariablesFromPrevSteps: Map<string, VariableType> = new Map()
    const _inputVariablesListPerTask: Map<string, VariableType>[] = []
    for (let i = 0; i < stepsLength; i++) {
        if (!_formDataErrorObj[activeStageName].steps[i]) {
            _formDataErrorObj[activeStageName].steps.push({ isValid: true })
        }
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
                    `${i + 1}.${_formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables[j].name}`,
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
                const variableDetail = _formData[activeStageName].steps[i][currentStepTypeVariable].inputVariables[key]
                if (isCDPipeline) {
                    if (
                        !globalVariables
                            .filter((variable) => variable.stageType !== 'post-cd')
                            .find((variables) => variables.value === variableDetail.refVariableName)
                    ) {
                        variableDetail.refVariableName = ''
                    }
                }
                if (
                    variableDetail.variableType === RefVariableType.FROM_PREVIOUS_STEP &&
                    ((variableDetail.refVariableStage ===
                        (activeStageName === BuildStageVariable.PreBuild
                            ? RefVariableStageType.PRE_CI
                            : RefVariableStageType.POST_CI) &&
                        variableDetail.refVariableStepIndex > startIndex) ||
                        (activeStageName === BuildStageVariable.PreBuild &&
                            variableDetail.refVariableStage === RefVariableStageType.POST_CI))
                ) {
                    variableDetail.refVariableStepIndex = 0
                    variableDetail.refVariableName = ''
                    variableDetail.variableType = RefVariableType.NEW
                    delete variableDetail.refVariableStage
                }
            }
        }
    }
    if (isFromAddNewTask || isFromMoveTask) {
        _inputVariablesListPerTask.push(new Map(_outputVariablesFromPrevSteps))
    }

    return { stepsLength, _inputVariablesListPerTask }
}

// Handle delete cd node

export const handleDeletePipeline = (
    deleteAction: DELETE_ACTION,
    deleteCD: (force: boolean, cascadeDelete: boolean) => void,
    deploymentAppType,
) => {
    switch (deleteAction) {
        case DELETE_ACTION.DELETE:
            return deleteCD(false, true)
        case DELETE_ACTION.NONCASCADE_DELETE:
            return deploymentAppType === DeploymentAppTypes.GITOPS ? deleteCD(false, false) : deleteCD(false, true)
        case DELETE_ACTION.FORCE_DELETE:
            return deleteCD(true, false)
    }
}

export const handleDeleteCDNodePipeline = (
    deleteCD: (force: boolean, cascadeDelete: boolean) => void,
    deploymentAppType: DeploymentAppTypes,
) => {
    handleDeletePipeline(DELETE_ACTION.DELETE, deleteCD, deploymentAppType)
}

export const filterInvalidConditionDetails = (
    conditionDetails: StepType['pluginRefStepDetail']['conditionDetails'],
    inputVariableCount: number,
    outputVariableCount: number,
): StepType['pluginRefStepDetail']['conditionDetails'] => {
    if (!inputVariableCount && !outputVariableCount) {
        return []
    }

    return (
        conditionDetails?.filter((conditionDetail) => {
            const isInputVariableCondition =
                conditionDetail.conditionType === ConditionType.TRIGGER ||
                conditionDetail.conditionType === ConditionType.SKIP
            const isOutputVariableCondition =
                conditionDetail.conditionType === ConditionType.PASS ||
                conditionDetail.conditionType === ConditionType.FAIL

            if (isInputVariableCondition && !inputVariableCount) {
                return false
            }

            if (isOutputVariableCondition && !outputVariableCount) {
                return false
            }

            return true
        }) || []
    )
}

export const getNamespacePlaceholder = (isVirtualEnvironment: boolean, namespace: string): string => {
    if (isVirtualEnvironment && !namespace) {
        return 'Not available'
    }
    return 'Will be auto-populated based on environment'
}

export const getMigrateToDevtronRequiredPayload = (
    migrateToDevtronFormState: MigrateToDevtronFormState,
): MigrateArgoAppToCDPipelineRequiredPayloadType => {
    const { migrateFromHelmFormState, migrateFromArgoFormState, deploymentAppType, triggerType } =
        migrateToDevtronFormState
    const requiredFormState =
        deploymentAppType === DeploymentAppTypes.GITOPS ? migrateFromArgoFormState : migrateFromHelmFormState
    const {
        environmentId,
        environmentName,
        namespace: destinationNamespace,
    } = requiredFormState.validationResponse.destination

    const basePayload: MigrateArgoAppToCDPipelineRequiredBasePayloadType = {
        triggerType,
        environmentId,
        environmentName,
        namespace: destinationNamespace,
        deploymentAppName: requiredFormState.appName,
    }

    if (deploymentAppType === DeploymentAppTypes.GITOPS) {
        return {
            ...basePayload,
            deploymentAppType,
            applicationObjectClusterId: requiredFormState.clusterId,
            applicationObjectNamespace: requiredFormState.namespace,
        }
    }

    return {
        ...basePayload,
        deploymentAppType,
    }
}
