import {
    DynamicDataTableRowDataType,
    PluginType,
    RefVariableStageType,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'

import { BuildStageVariable, PATTERNS } from '@Config/constants'

import { PipelineContext } from '@Components/workflowEditor/types'
import { PluginVariableType } from '@Components/ciPipeline/types'
import { excludeVariables } from '../Constants'
import { FORMAT_COLUMN_OPTIONS } from './constants'
import { VariableDataRowType } from './types'

export const getValueColumnOptions = (
    {
        inputVariablesListFromPrevStep,
        activeStageName,
        selectedTaskIndex,
        formData,
        globalVariables,
        isCdPipeline,
        type,
    }: Pick<
        PipelineContext,
        | 'activeStageName'
        | 'selectedTaskIndex'
        | 'inputVariablesListFromPrevStep'
        | 'formData'
        | 'globalVariables'
        | 'isCdPipeline'
    > & { type: PluginVariableType },
    index: number,
) => {
    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const ioVariables: VariableType[] =
        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]

    const previousStepVariables = []
    const defaultVariables = (ioVariables[index]?.valueConstraint?.choices || []).map((value) => ({
        label: value,
        value,
    }))

    if (inputVariablesListFromPrevStep[activeStageName].length > 0) {
        inputVariablesListFromPrevStep[activeStageName][selectedTaskIndex].forEach((element) => {
            previousStepVariables.push({
                ...element,
                label: element.name,
                value: element.name,
                refVariableTaskName: formData[activeStageName]?.steps[element.refVariableStepIndex - 1].name,
            })
        })
    }

    if (activeStageName === BuildStageVariable.PostBuild) {
        const preBuildStageVariables = []
        const preBuildTaskLength = formData[BuildStageVariable.PreBuild]?.steps?.length
        if (preBuildTaskLength >= 1 && !isCdPipeline) {
            if (inputVariablesListFromPrevStep[BuildStageVariable.PreBuild].length > 0) {
                inputVariablesListFromPrevStep[BuildStageVariable.PreBuild][preBuildTaskLength - 1].forEach(
                    (element) => {
                        preBuildStageVariables.push({
                            ...element,
                            label: element.name,
                            value: element.name,
                            refVariableTaskName:
                                formData[BuildStageVariable.PreBuild]?.steps[element.refVariableStepIndex - 1].name,
                        })
                    },
                )
            }

            const stepTypeVariable =
                formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1].stepType === PluginType.INLINE
                    ? 'inlineStepDetail'
                    : 'pluginRefStepDetail'
            const preBuildStageLastTaskOutputVariables =
                formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1][stepTypeVariable]?.outputVariables
            const outputVariablesLength = preBuildStageLastTaskOutputVariables?.length || 0
            for (let j = 0; j < outputVariablesLength; j++) {
                if (preBuildStageLastTaskOutputVariables[j].name) {
                    const currentVariableDetails = preBuildStageLastTaskOutputVariables[j]
                    preBuildStageVariables.push({
                        ...currentVariableDetails,
                        label: currentVariableDetails.name,
                        value: currentVariableDetails.name,
                        refVariableStepIndex: preBuildTaskLength,
                        refVariableTaskName: formData[BuildStageVariable.PreBuild].steps[preBuildTaskLength - 1].name,
                        refVariableStage: RefVariableStageType.PRE_CI,
                    })
                }
            }
        }

        return [
            {
                label: 'Default variables',
                options: defaultVariables,
            },
            {
                label: 'From Pre-build Stage',
                options: preBuildStageVariables,
            },
            {
                label: 'From Post-build Stage',
                options: previousStepVariables,
            },
            {
                label: 'System variables',
                options: globalVariables,
            },
        ]
    }

    return [
        {
            label: 'Default variables',
            options: defaultVariables,
        },
        {
            label: 'From Previous Steps',
            options: previousStepVariables,
        },
        {
            label: 'System variables',
            options: globalVariables.filter(
                (variable) =>
                    (isCdPipeline && variable.stageType !== 'post-cd') || !excludeVariables.includes(variable.value),
            ),
        },
    ]
}

export const getVariableColumnRowProps = (): VariableDataRowType['data']['variable'] => {
    const data: VariableDataRowType['data']['variable'] = {
        value: '',
        type: DynamicDataTableRowDataType.TEXT,
        props: {},
    }

    return data
}

export const getFormatColumnRowProps = () => {
    const data: VariableDataRowType['data']['format'] = {
        value: FORMAT_COLUMN_OPTIONS[0].value,
        type: DynamicDataTableRowDataType.DROPDOWN,
        props: {
            options: FORMAT_COLUMN_OPTIONS,
        },
    }

    return data
}

export const getValColumnRowProps = (params: Parameters<typeof getValueColumnOptions>[0], index: number) => {
    const data: VariableDataRowType['data']['val'] = {
        value: '',
        type: DynamicDataTableRowDataType.SELECT_TEXT,
        props: {
            placeholder: 'Select source or input value',
            options: getValueColumnOptions(params, index),
        },
    }

    return data
}

export const getEmptyVariableDataTableRow = (
    params: Pick<
        PipelineContext,
        | 'activeStageName'
        | 'selectedTaskIndex'
        | 'inputVariablesListFromPrevStep'
        | 'formData'
        | 'globalVariables'
        | 'isCdPipeline'
    > & { type: PluginVariableType },
): VariableDataRowType => {
    const id = (Date.now() * Math.random()).toString(16)
    const data: VariableDataRowType = {
        data: {
            variable: getVariableColumnRowProps(),
            format: getFormatColumnRowProps(),
            val: getValColumnRowProps(params, -1),
        },
        id,
    }

    return data
}

export const validateChoice = (choice: string) => PATTERNS.STRING.test(choice)

export const getValidatedChoices = (choices: VariableDataRowType['customState']['choices']) => {
    let isValid = true

    const updatedChoices: VariableDataRowType['customState']['choices'] = choices.map((choice) => {
        const error = !validateChoice(choice.value) ? 'This is a required field' : ''
        if (isValid && !!error) {
            isValid = false
        }
        return { ...choice, error }
    })

    return { isValid, choices: updatedChoices }
}
