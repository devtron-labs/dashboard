import React from 'react'
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg'
import { components } from 'react-select'
import { ReactComponent as Search } from '../../assets/icons/ic-nav-search.svg'
import {
    BuildStageVariable,
    ConditionType,
    FormType,
    PluginType,
    RefVariableStageType,
    RefVariableType,
    ScriptType,
    StepType,
    TaskErrorObj,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ValidationRules } from '../ciPipeline/validationRules'
import { CDFormType, InputVariablesFromInputListType } from './cdPipeline.types'

export const styles = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
    }),
    menu: (base, state) => {
        return {
            ...base,
            backgroundColor: state.Selected ? 'white' : 'white',
        }
    },
    singleValue: (base, state) => {
        return {
            ...base,
            color: 'var(--N900)',
        }
    },
    multiValue: (base, state) => {
        return {
            ...base,
            backgroundColor: 'var(--N0)',
            border: '1px solid var(--N200)',
            borderRadius: '4px',
        }
    },
    option: (base, state) => {
        return {
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            paddingLeft: '8px',
        }
    },
}

export function Option(props) {
    const { selectOption, data } = props
    const style = { flex: '0 0', alignText: 'left' }
    const onClick = (e) => selectOption(data)
    return (
        <div className="flex left" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
            {props.isSelected ? (
                <Check onClick={onClick} className="icon-dim-16" style={style} />
            ) : (
                <span onClick={onClick} style={style} />
            )}
            <components.Option {...props} />
        </div>
    )
}

export function DropdownIndicator(props) {
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

export const validateTask = (taskData: StepType, taskErrorObj: TaskErrorObj): void => {
    const validationRules = new ValidationRules()
    if (taskData && taskErrorObj) {
        taskErrorObj.name = validationRules.requiredField(taskData.name)
        taskErrorObj.isValid = taskErrorObj.name.isValid

        if (taskData.stepType) {
            const inputVarMap: Map<string, boolean> = new Map()
            const outputVarMap: Map<string, boolean> = new Map()
            const currentStepTypeVariable =
                taskData.stepType === PluginType.INLINE ? 'inlineStepDetail' : 'pluginRefStepDetail'
            taskErrorObj[currentStepTypeVariable].inputVariables = []
            taskData[currentStepTypeVariable].inputVariables?.forEach((element, index) => {
                taskErrorObj[currentStepTypeVariable].inputVariables.push(
                    validationRules.inputVariable(element, inputVarMap),
                )
                taskErrorObj.isValid =
                    taskErrorObj.isValid && taskErrorObj[currentStepTypeVariable].inputVariables[index].isValid
                inputVarMap.set(element.name, true)
            })
            if (taskData.stepType === PluginType.INLINE) {
                taskErrorObj.inlineStepDetail.outputVariables = []
                taskData.inlineStepDetail.outputVariables?.forEach((element, index) => {
                    taskErrorObj.inlineStepDetail.outputVariables.push(
                        validationRules.outputVariable(element, outputVarMap),
                    )
                    taskErrorObj.isValid =
                        taskErrorObj.isValid && taskErrorObj.inlineStepDetail.outputVariables[index].isValid
                    outputVarMap.set(element.name, true)
                })
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
                taskData.pluginRefStepDetail.outputVariables?.forEach((element, index) => {
                    outputVarMap.set(element.name, true)
                })
            }

            taskErrorObj[currentStepTypeVariable]['conditionDetails'] = []
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
                taskErrorObj[currentStepTypeVariable]['conditionDetails'].push(validationRules.conditionDetail(element))
                taskErrorObj.isValid =
                    taskErrorObj.isValid && taskErrorObj[currentStepTypeVariable]['conditionDetails'][index].isValid
            })
        }
    }
}

export const checkUniqueness = (formData): boolean => {
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

export const calculateLastStepDetailsLogic = (
    _formData: FormType | CDFormType,
    activeStageName: string,
    _formDataErrorObj: any,
    isFromAddNewTask,
    startIndex: number,
    isFromMoveTask: boolean,
) => {
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
                    i + 1 + '.' + _formData[activeStageName].steps[i][currentStepTypeVariable].outputVariables[j].name,
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
