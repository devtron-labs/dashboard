import React from 'react';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { components } from 'react-select';
import { ReactComponent as Search} from '../../assets/icons/ic-nav-search.svg'
import { ConditionType, PluginType, ScriptType, StepType, TaskErrorObj } from '@devtron-labs/devtron-fe-common-lib';
import { ValidationRules } from '../ciPipeline/validationRules';

export const styles = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
    }),
    menu: (base, state) => {
        return ({
            ...base,
            backgroundColor: state.Selected ? "white" : "white"
        })
    },
    singleValue: (base, state) => {
        return ({
            ...base,
            color: 'var(--N900)'
        })
    },
    multiValue: (base ,state) => {
        return({
            ...base,
            backgroundColor: 'var(--N0)',
            border: '1px solid var(--N200)',
            borderRadius: '4px'
        })
    },
    option: (base, state) => {
        return ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            paddingLeft: '8px',
        })
    }
}

export function Option(props) {
    const { selectOption, data } = props;
    const style = { flex: '0 0' , alignText: 'left' }
    const onClick = (e) => selectOption(data);
    return <div className="flex left" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
        {props.isSelected ? <Check onClick={onClick} className="icon-dim-16" style={style} />
            : <span onClick={onClick} style={style} />}
        <components.Option {...props} />
    </div>
};

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" />
    </components.DropdownIndicator>
}

export const NUMBER_OF_APPROVALS = 6

export const ValueContainer = (props) => {
    return (
        <components.ValueContainer {...props}>
            <div className="flex left w-100">
            <Search className='icon-dim-16 scn-6 mr-8' />
               {props.children}
            </div>
        </components.ValueContainer>
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
                            taskErrorObj.isValid &&
                            taskErrorObj.inlineStepDetail['mountCodeToContainerPath'].isValid
                    }

                    if (taskData.inlineStepDetail['mountDirectoryFromHost']) {
                        taskErrorObj.inlineStepDetail['mountPathMap'] = []
                        taskData.inlineStepDetail['mountPathMap']?.forEach((element, index) => {
                            taskErrorObj.inlineStepDetail['mountPathMap'].push(
                                validationRules.mountPathMap(element),
                            )
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
                taskErrorObj[currentStepTypeVariable]['conditionDetails'].push(
                    validationRules.conditionDetail(element),
                )
                taskErrorObj.isValid =
                    taskErrorObj.isValid && taskErrorObj[currentStepTypeVariable]['conditionDetails'][index].isValid
            })
        }
    }
}