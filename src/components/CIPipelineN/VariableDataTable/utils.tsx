import moment from 'moment'

import {
    ConditionType,
    DynamicDataTableRowDataType,
    PluginType,
    RefVariableStageType,
    RefVariableType,
    SelectPickerOptionType,
    VariableType,
    VariableTypeFormat,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Var } from '@Icons/ic-var-initial.svg'
import { BuildStageVariable, PATTERNS } from '@Config/constants'
import { PipelineContext } from '@Components/workflowEditor/types'
import { PluginVariableType } from '@Components/ciPipeline/types'

import { excludeVariables, TIPPY_VAR_MSG } from '../Constants'
import {
    FILE_UPLOAD_SIZE_UNIT_OPTIONS,
    FORMAT_COLUMN_OPTIONS,
    VAL_COLUMN_BOOL_OPTIONS,
    VAL_COLUMN_CHOICES_DROPDOWN_LABEL,
    VAL_COLUMN_DATE_OPTIONS,
} from './constants'
import {
    GetValColumnRowPropsType,
    GetVariableDataTableInitialRowsProps,
    VariableDataTableSelectPickerOptionType,
    VariableDataRowType,
} from './types'

export const getOptionsForValColumn = ({
    inputVariablesListFromPrevStep,
    activeStageName,
    selectedTaskIndex,
    formData,
    globalVariables,
    isCdPipeline,
    format,
    valueConstraint,
}: Pick<
    PipelineContext,
    | 'activeStageName'
    | 'selectedTaskIndex'
    | 'inputVariablesListFromPrevStep'
    | 'formData'
    | 'globalVariables'
    | 'isCdPipeline'
> &
    Pick<VariableType, 'format' | 'valueConstraint'>) => {
    const previousStepVariables = []
    const defaultValues = (valueConstraint?.choices || []).map<SelectPickerOptionType<string>>((value) => ({
        label: value,
        value,
    }))

    if (format === VariableTypeFormat.BOOL) {
        defaultValues.push(...VAL_COLUMN_BOOL_OPTIONS)
    }

    if (format === VariableTypeFormat.DATE) {
        defaultValues.push(...VAL_COLUMN_DATE_OPTIONS)
    }

    if (format)
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
                label: VAL_COLUMN_CHOICES_DROPDOWN_LABEL,
                options: defaultValues,
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
            label: VAL_COLUMN_CHOICES_DROPDOWN_LABEL,
            options: defaultValues,
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

export const getSystemVariableIcon = () => (
    <Tooltip content={TIPPY_VAR_MSG} placement="left" animation="shift-away" alwaysShowTippyOnHover>
        <div className="flex">
            <Var className="icon-dim-18 icon-n4" />
        </div>
    </Tooltip>
)

export const getVariableColumnRowProps = () => {
    const data: VariableDataRowType['data']['variable'] = {
        value: '',
        type: DynamicDataTableRowDataType.TEXT,
        props: {
            placeholder: 'Enter variable name',
        },
    }

    return data
}

export const getFormatColumnRowProps = ({
    format,
    isCustomTask,
}: Pick<VariableType, 'format'> & { isCustomTask: boolean }): VariableDataRowType['data']['format'] => {
    if (isCustomTask) {
        return {
            value: format,
            type: DynamicDataTableRowDataType.DROPDOWN,
            props: {
                options: FORMAT_COLUMN_OPTIONS,
            },
        }
    }

    return {
        type: DynamicDataTableRowDataType.TEXT,
        value: format,
        disabled: true,
        props: {},
    }
}

export const getValColumnRowProps = ({
    format,
    type,
    variableType,
    value,
    refVariableName,
    refVariableStage,
    valueConstraint,
    description,
    activeStageName,
    formData,
    globalVariables,
    isCdPipeline,
    selectedTaskIndex,
    inputVariablesListFromPrevStep,
}: GetValColumnRowPropsType): VariableDataRowType['data']['format'] => {
    if (type === PluginVariableType.INPUT) {
        if (format === VariableTypeFormat.FILE) {
            return {
                type: DynamicDataTableRowDataType.FILE_UPLOAD,
                value,
                props: {
                    fileTypes: valueConstraint?.constraint?.fileProperty?.allowedExtensions || [],
                },
            }
        }

        return {
            type: DynamicDataTableRowDataType.SELECT_TEXT,
            value: variableType === RefVariableType.NEW ? value : refVariableName || '',
            props: {
                placeholder: 'Enter value or variable',
                options: getOptionsForValColumn({
                    activeStageName,
                    formData,
                    globalVariables,
                    isCdPipeline,
                    selectedTaskIndex,
                    inputVariablesListFromPrevStep,
                    format,
                    valueConstraint,
                }),
                selectPickerProps: {
                    isCreatable:
                        format !== VariableTypeFormat.BOOL &&
                        (!valueConstraint?.choices?.length || !valueConstraint.blockCustomValue),
                },
                Icon:
                    refVariableStage || (variableType && variableType !== RefVariableType.NEW)
                        ? getSystemVariableIcon()
                        : null,
            },
        }
    }

    return {
        type: DynamicDataTableRowDataType.TEXT,
        value: description,
        props: {},
    }
}

export const testValueForNumber = (value: string) => !value || PATTERNS.NUMBERS_WITH_SCOPE_VARIABLES.test(value)

export const checkForSystemVariable = (option: VariableDataTableSelectPickerOptionType) => {
    const isSystemVariable =
        !!option?.refVariableStage || (option?.variableType && option.variableType !== RefVariableType.NEW)

    return isSystemVariable
}

export const getValColumnRowValue = (
    format: VariableTypeFormat,
    value: string,
    selectedValue: VariableDataTableSelectPickerOptionType,
) => {
    const isSystemVariable = checkForSystemVariable(selectedValue)
    const isDateFormat = !isSystemVariable && value && format === VariableTypeFormat.DATE

    if (isDateFormat && selectedValue.description) {
        const now = moment()
        const formattedDate = now.format(selectedValue.value)
        const timezone = now.format('Z').replace(/([+/-])(\d{2})[:.](\d{2})/, '$1$2$3')
        return formattedDate.replace('Z', timezone)
    }

    return value
}

export const getEmptyVariableDataTableRow = (params: GetValColumnRowPropsType): VariableDataRowType => {
    const data: VariableDataRowType = {
        data: {
            variable: getVariableColumnRowProps(),
            format: getFormatColumnRowProps({ format: VariableTypeFormat.STRING, isCustomTask: true }),
            val: getValColumnRowProps(params),
        },
        id: params.id,
        customState: {
            variableDescription: '',
            isVariableRequired: false,
            choices: [],
            askValueAtRuntime: false,
            blockCustomValue: false,
            selectedValue: null,
            fileInfo: {
                id: null,
                mountDir: {
                    value: '/devtroncd',
                    error: '',
                },
                allowedExtensions: '',
                maxUploadSize: '',
                unit: FILE_UPLOAD_SIZE_UNIT_OPTIONS[0],
            },
        },
    }

    return data
}

export const getVariableDataTableInitialRows = ({
    ioVariables,
    type,
    isCustomTask,
    emptyRowParams,
}: GetVariableDataTableInitialRowsProps): VariableDataRowType[] =>
    (ioVariables || []).map(
        ({
            name,
            allowEmptyValue,
            description,
            format,
            variableType,
            value,
            refVariableName,
            refVariableStage,
            valueConstraint,
            isRuntimeArg,
            fileMountDir,
            fileReferenceId,
            id,
        }) => {
            const isInputVariableRequired = type === PluginVariableType.INPUT && !allowEmptyValue

            return {
                data: {
                    variable: {
                        ...getVariableColumnRowProps(),
                        value: name,
                        required: isInputVariableRequired,
                        disabled: !isCustomTask,
                        showTooltip: !isCustomTask && !!description,
                        tooltipText: description,
                    },
                    format: getFormatColumnRowProps({ format, isCustomTask }),
                    val: getValColumnRowProps({
                        ...emptyRowParams,
                        description,
                        format,
                        variableType,
                        value,
                        refVariableName,
                        refVariableStage,
                        valueConstraint,
                        id,
                    }),
                },
                customState: {
                    isVariableRequired: isInputVariableRequired,
                    variableDescription: description ?? '',
                    choices: (valueConstraint?.choices || []).map((choiceValue, index) => ({
                        id: index,
                        value: choiceValue,
                    })),
                    askValueAtRuntime: isRuntimeArg ?? false,
                    blockCustomValue: valueConstraint?.blockCustomValue ?? false,
                    selectedValue: null,
                    fileInfo: {
                        id: fileReferenceId,
                        mountDir: { value: fileMountDir, error: '' },
                        allowedExtensions:
                            valueConstraint?.constraint?.fileProperty?.allowedExtensions.join(', ') || '',
                        maxUploadSize: (
                            (valueConstraint?.constraint?.fileProperty?.maxUploadSize || null) / 1024 || ''
                        ).toString(),
                        unit: FILE_UPLOAD_SIZE_UNIT_OPTIONS[0],
                    },
                },
                id,
            }
        },
    )

export const getUploadFileConstraints = ({
    unit,
    allowedExtensions,
    maxUploadSize,
}: {
    unit: string
    allowedExtensions: string
    maxUploadSize: string
}) => {
    const unitMultiplier = unit === 'MB' ? 1024 : 1
    return {
        allowedExtensions: allowedExtensions
            .split(',')
            .map((value) => value.trim())
            .filter((value) => !!value),
        maxUploadSize: maxUploadSize ? parseFloat(maxUploadSize) * unitMultiplier * 1024 : null,
    }
}

export const convertVariableDataTableToFormData = ({
    rows,
    type,
    activeStageName,
    selectedTaskIndex,
    formData,
    formDataErrorObj,
    validateTask,
    calculateLastStepDetail,
}: Pick<
    PipelineContext,
    | 'activeStageName'
    | 'selectedTaskIndex'
    | 'formData'
    | 'formDataErrorObj'
    | 'validateTask'
    | 'calculateLastStepDetail'
> & {
    type: PluginVariableType
    rows: VariableDataRowType[]
}) => {
    const updatedFormData = structuredClone(formData)
    const updatedFormDataErrorObj = structuredClone(formDataErrorObj)

    const currentStepTypeVariable =
        updatedFormData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const ioVariables: VariableType[] =
        updatedFormData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]

    const updatedIOVariables = rows.map<VariableType>(({ data, customState, id }) => {
        const selectedIOVariable = ioVariables?.find((ioVariable) => ioVariable.id === id)
        const {
            askValueAtRuntime,
            blockCustomValue,
            choices,
            selectedValue,
            isVariableRequired,
            variableDescription,
            fileInfo,
        } = customState

        const variableDetail: VariableType = {
            ...selectedIOVariable,
            format: data.format.value as VariableTypeFormat,
            name: data.variable.value,
            description: variableDescription,
            allowEmptyValue: !isVariableRequired,
            isRuntimeArg: askValueAtRuntime,
        }

        if (choices.length) {
            variableDetail.valueConstraint = {
                ...variableDetail.valueConstraint,
                choices: choices.map(({ value }) => value),
                blockCustomValue,
            }
        }

        if (fileInfo) {
            variableDetail.value = data.val.value
            variableDetail.fileReferenceId = fileInfo.id
            variableDetail.fileMountDir = fileInfo.mountDir.value
            variableDetail.valueConstraint = {
                ...variableDetail.valueConstraint,
                constraint: {
                    fileProperty: getUploadFileConstraints({
                        allowedExtensions: fileInfo.allowedExtensions,
                        maxUploadSize: fileInfo.maxUploadSize,
                        unit: fileInfo.unit.label as string,
                    }),
                },
            }
        }

        if (selectedValue) {
            if (selectedValue.refVariableStepIndex) {
                variableDetail.value = ''
                variableDetail.variableType = RefVariableType.FROM_PREVIOUS_STEP
                variableDetail.refVariableStepIndex = selectedValue.refVariableStepIndex
                variableDetail.refVariableName = selectedValue.label as string
                variableDetail.format = selectedValue.format
                variableDetail.refVariableStage = selectedValue.refVariableStage
            } else if (selectedValue.variableType === RefVariableType.GLOBAL) {
                variableDetail.variableType = RefVariableType.GLOBAL
                variableDetail.refVariableStepIndex = 0
                variableDetail.refVariableName = selectedValue.label as string
                variableDetail.format = selectedValue.format
                variableDetail.value = ''
                variableDetail.refVariableStage = null
            } else {
                variableDetail.variableType = RefVariableType.NEW
                if (data.format.value === VariableTypeFormat.DATE) {
                    variableDetail.value = data.val.value
                } else {
                    variableDetail.value = selectedValue.label as string
                }
                variableDetail.refVariableName = ''
                variableDetail.refVariableStage = null
            }

            if (formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.PLUGIN_REF) {
                variableDetail.format = selectedIOVariable.format
            }
        }

        return variableDetail
    })

    updatedFormData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
        type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
    ] = updatedIOVariables

    if (type === PluginVariableType.OUTPUT) {
        calculateLastStepDetail(false, updatedFormData, activeStageName, selectedTaskIndex)
    }

    if (updatedIOVariables.length === 0) {
        const { conditionDetails } = updatedFormData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
        for (let i = 0; i < conditionDetails?.length; i++) {
            if (
                (type === PluginVariableType.OUTPUT &&
                    (conditionDetails[i].conditionType === ConditionType.PASS ||
                        conditionDetails[i].conditionType === ConditionType.FAIL)) ||
                (type === PluginVariableType.INPUT &&
                    (conditionDetails[i].conditionType === ConditionType.TRIGGER ||
                        conditionDetails[i].conditionType === ConditionType.SKIP))
            ) {
                conditionDetails.splice(i, 1)
                i -= 1
            }
        }
        updatedFormData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.conditionDetails = conditionDetails
    }

    validateTask(
        updatedFormData[activeStageName].steps[selectedTaskIndex],
        updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex],
    )

    return { updatedFormDataErrorObj, updatedFormData }
}
