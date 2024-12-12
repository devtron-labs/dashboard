import {
    ConditionType,
    DynamicDataTableCellErrorType,
    DynamicDataTableHeaderType,
    DynamicDataTableRowDataType,
    getGoLangFormattedDateWithTimezone,
    IO_VARIABLES_VALUE_COLUMN_BOOL_OPTIONS,
    IO_VARIABLES_VALUE_COLUMN_DATE_OPTIONS,
    PluginType,
    RefVariableStageType,
    RefVariableType,
    SelectPickerOptionType,
    SystemVariableIcon,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { BuildStageVariable, PATTERNS } from '@Config/constants'
import { PipelineContext } from '@Components/workflowEditor/types'
import { PluginVariableType } from '@Components/ciPipeline/types'

import { excludeVariables } from '../Constants'
import { FILE_UPLOAD_SIZE_UNIT_OPTIONS, FORMAT_COLUMN_OPTIONS, VAL_COLUMN_DROPDOWN_LABEL } from './constants'
import {
    GetValColumnRowPropsType,
    GetVariableDataTableInitialRowsProps,
    VariableDataTableSelectPickerOptionType,
    VariableDataRowType,
    VariableDataKeys,
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
    const isBuildStagePostBuild = activeStageName === BuildStageVariable.PostBuild

    const previousStepVariables = []
    const preBuildStageVariables = []

    const defaultValues = (valueConstraint?.choices || []).map<SelectPickerOptionType<string>>((value) => ({
        label: value,
        value,
    }))

    if (format === VariableTypeFormat.BOOL) {
        defaultValues.push(...IO_VARIABLES_VALUE_COLUMN_BOOL_OPTIONS)
    }

    if (format === VariableTypeFormat.DATE) {
        defaultValues.push(...IO_VARIABLES_VALUE_COLUMN_DATE_OPTIONS)
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

    if (isBuildStagePostBuild) {
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
    }

    const filteredGlobalVariables = isBuildStagePostBuild
        ? globalVariables
        : globalVariables.filter(
              (variable) =>
                  (isCdPipeline && variable.stageType !== 'post-cd') || !excludeVariables.includes(variable.value),
          )

    const filteredGlobalVariablesBasedOnFormat = filteredGlobalVariables.filter(
        (variable) => variable.format === format,
    )
    const filteredPreBuildStageVariablesBasedOnFormat = preBuildStageVariables.filter(
        (variable) => variable.format === format,
    )
    const filteredPreviousStepVariablesBasedOnFormat = previousStepVariables.filter(
        (variable) => variable.format === format,
    )

    const isOptionsEmpty =
        !defaultValues.length &&
        (isBuildStagePostBuild
            ? !filteredPreBuildStageVariablesBasedOnFormat.length && !filteredPreviousStepVariablesBasedOnFormat.length
            : !filteredPreviousStepVariablesBasedOnFormat.length) &&
        !filteredGlobalVariablesBasedOnFormat.length

    if (isOptionsEmpty) {
        return []
    }

    return [
        {
            label: VAL_COLUMN_DROPDOWN_LABEL.CHOICES,
            options: defaultValues,
        },
        ...(!valueConstraint?.blockCustomValue
            ? [
                  ...(isBuildStagePostBuild
                      ? [
                            {
                                label: VAL_COLUMN_DROPDOWN_LABEL.PRE_BUILD_STAGE,
                                options: filteredPreBuildStageVariablesBasedOnFormat,
                            },
                            {
                                label: VAL_COLUMN_DROPDOWN_LABEL.POST_BUILD_STAGE,
                                options: filteredPreviousStepVariablesBasedOnFormat,
                            },
                        ]
                      : [
                            {
                                label: VAL_COLUMN_DROPDOWN_LABEL.PREVIOUS_STEPS,
                                options: filteredPreviousStepVariablesBasedOnFormat,
                            },
                        ]),
                  {
                      label: VAL_COLUMN_DROPDOWN_LABEL.SYSTEM_VARIABLES,
                      options: filteredGlobalVariablesBasedOnFormat,
                  },
              ]
            : []),
    ]
}

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

        const optionsForValColumn = getOptionsForValColumn({
            activeStageName,
            formData,
            globalVariables,
            isCdPipeline,
            selectedTaskIndex,
            inputVariablesListFromPrevStep,
            format,
            valueConstraint,
        })

        if (!optionsForValColumn.length) {
            return {
                type: DynamicDataTableRowDataType.TEXT,
                value,
                props: {
                    placeholder: 'Enter value or variable',
                },
            }
        }

        return {
            type: DynamicDataTableRowDataType.SELECT_TEXT,
            value: variableType === RefVariableType.NEW ? value : refVariableName || '',
            props: {
                placeholder: 'Enter value or variable',
                options: optionsForValColumn,
                selectPickerProps: {
                    isCreatable:
                        format !== VariableTypeFormat.BOOL &&
                        (!valueConstraint?.choices?.length || !valueConstraint.blockCustomValue),
                },
                Icon:
                    refVariableStage || (variableType && variableType !== RefVariableType.NEW) ? (
                        <SystemVariableIcon />
                    ) : null,
            },
        }
    }

    return {
        type: DynamicDataTableRowDataType.TEXT,
        value: description || 'No description available',
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

    return isDateFormat ? getGoLangFormattedDateWithTimezone(selectedValue.value) : value
}

export const getEmptyVariableDataTableRow = ({
    id,
    ...params
}: GetValColumnRowPropsType & { id: number }): VariableDataRowType => {
    const data: VariableDataRowType = {
        data: {
            variable: getVariableColumnRowProps(),
            format: getFormatColumnRowProps({ format: VariableTypeFormat.STRING, isCustomTask: true }),
            val: getValColumnRowProps(params),
        },
        id,
        customState: {
            defaultValue: '',
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
    ...restProps
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
            defaultValue,
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
                        tooltip: {
                            content: !isCustomTask && description,
                        },
                    },
                    format: getFormatColumnRowProps({ format, isCustomTask }),
                    val: getValColumnRowProps({
                        ...restProps,
                        type,
                        description,
                        format,
                        value,
                        variableType,
                        refVariableName,
                        refVariableStage,
                        valueConstraint,
                    }),
                },
                customState: {
                    defaultValue,
                    isVariableRequired: isInputVariableRequired,
                    variableDescription: description ?? '',
                    choices: (valueConstraint?.choices || []).map((choiceValue, index) => ({
                        id: index,
                        value: choiceValue,
                        error: '',
                    })),
                    askValueAtRuntime: isRuntimeArg ?? false,
                    blockCustomValue: valueConstraint?.blockCustomValue ?? false,
                    selectedValue: {
                        label: refVariableName || value,
                        value: refVariableName || value,
                        refVariableName,
                        refVariableStage,
                        variableType: refVariableName ? RefVariableType.GLOBAL : RefVariableType.NEW,
                    },
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

export const getVariableDataTableInitialCellError = (
    rows: VariableDataRowType[],
    headers: DynamicDataTableHeaderType<VariableDataKeys>[],
) =>
    rows.reduce((acc, curr) => {
        if (!acc[curr.id]) {
            acc[curr.id] = headers.reduce(
                (headerAcc, { key }) => ({ ...headerAcc, [key]: { isValid: true, errorMessages: [] } }),
                {},
            )
        }

        return acc
    }, {})

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
    cellError,
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
    cellError: DynamicDataTableCellErrorType<VariableDataKeys>
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
            value: data.val.value,
            format: data.format.value as VariableTypeFormat,
            name: data.variable.value,
            description: type === PluginVariableType.INPUT ? variableDescription : data.val.value,
            variableType: selectedIOVariable?.variableType ?? RefVariableType.NEW,
        }

        if (type === PluginVariableType.INPUT) {
            variableDetail.allowEmptyValue = !isVariableRequired
            variableDetail.isRuntimeArg = askValueAtRuntime

            if (
                (variableDetail.format === VariableTypeFormat.STRING ||
                    variableDetail.format === VariableTypeFormat.NUMBER) &&
                choices.length
            ) {
                variableDetail.valueConstraint = {
                    ...variableDetail.valueConstraint,
                    choices: choices.map(({ value }) => value),
                    blockCustomValue,
                }
            }

            if (variableDetail.format === VariableTypeFormat.FILE && fileInfo) {
                variableDetail.variableType = RefVariableType.NEW
                variableDetail.refVariableName = ''
                variableDetail.refVariableStage = null
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
                    variableDetail.value = ''
                    variableDetail.variableType = RefVariableType.GLOBAL
                    variableDetail.refVariableStepIndex = 0
                    variableDetail.refVariableName = selectedValue.label as string
                    variableDetail.format = selectedValue.format
                    variableDetail.refVariableStage = null
                } else {
                    if (variableDetail.format !== VariableTypeFormat.DATE) {
                        variableDetail.value = selectedValue.label as string
                    }
                    variableDetail.variableType = RefVariableType.NEW
                    variableDetail.refVariableName = ''
                    variableDetail.refVariableStage = null
                }
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

    const isValid = Object.values(cellError).reduce(
        (acc, curr) => acc && !Object.values(curr).some((item) => !item.isValid),
        true,
    )
    updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].isValid = isValid

    validateTask(
        updatedFormData[activeStageName].steps[selectedTaskIndex],
        updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex],
        { validateIOVariables: false },
    )

    return { updatedFormDataErrorObj, updatedFormData }
}
