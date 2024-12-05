import { useContext, useState, useEffect, useRef } from 'react'

import {
    DynamicDataTable,
    DynamicDataTableProps,
    DynamicDataTableRowDataType,
    PluginType,
    RefVariableType,
    SelectPickerOptionType,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { PluginVariableType } from '@Components/ciPipeline/types'
import { ExtendedOptionType } from '@Components/app/types'

import {
    FILE_UPLOAD_SIZE_UNIT_OPTIONS,
    getVariableDataTableHeaders,
    VAL_COLUMN_CHOICES_DROPDOWN_LABEL,
} from './constants'
import { getSystemVariableIcon } from './helpers'
import {
    HandleRowUpdateActionProps,
    VariableDataCustomState,
    VariableDataKeys,
    VariableDataRowType,
    VariableDataTableActionType,
} from './types'
import {
    convertVariableDataTableToFormData,
    getEmptyVariableDataTableRow,
    getUploadFileConstraints,
    getValColumnRowProps,
    getValColumnRowValue,
    getVariableDataTableInitialRows,
} from './utils'

import { VariableDataTablePopupMenu } from './VariableDataTablePopupMenu'
import { VariableConfigOverlay } from './VariableConfigOverlay'
import { ValueConfigOverlay } from './ValueConfigOverlay'

export const VariableDataTable = ({
    type,
    isCustomTask = false,
}: {
    type: PluginVariableType
    isCustomTask?: boolean
}) => {
    // CONTEXTS
    const {
        inputVariablesListFromPrevStep,
        activeStageName,
        selectedTaskIndex,
        formData,
        globalVariables,
        isCdPipeline,
        formDataErrorObj,
        validateTask,
        setFormData,
        setFormDataErrorObj,
        calculateLastStepDetail,
        uploadFile,
    } = useContext(pipelineContext)

    // CONSTANTS
    const emptyRowParams = {
        inputVariablesListFromPrevStep,
        activeStageName,
        selectedTaskIndex,
        formData,
        globalVariables,
        isCdPipeline,
        type,
        description: null,
        format: VariableTypeFormat.STRING,
        variableType: RefVariableType.NEW,
        value: '',
        refVariableName: null,
        refVariableStage: null,
        valueConstraint: null,
        id: 0,
    }

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const ioVariables: VariableType[] =
        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]

    const ioVariablesError: { isValid: boolean; message: string }[] =
        formDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]

    // STATES
    const [rows, setRows] = useState<VariableDataRowType[]>([])

    // REFS
    const initialRowsSet = useRef('')

    useEffect(() => {
        setRows(
            ioVariables?.length
                ? getVariableDataTableInitialRows({ emptyRowParams, ioVariables, isCustomTask, type })
                : [getEmptyVariableDataTableRow(emptyRowParams)],
        )
        initialRowsSet.current = 'set'
    }, [])

    // useEffect(() => {
    //     console.log('meg', rows, ioVariables, formDataErrorObj)
    // }, [JSON.stringify(ioVariables)])

    // METHODS
    const handleRowUpdateAction = (rowAction: HandleRowUpdateActionProps) => {
        const { actionType } = rowAction

        setRows((prevRows) => {
            let updatedRows = [...prevRows]
            switch (actionType) {
                case VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS:
                    updatedRows = updatedRows.map((row) => {
                        const { id, data, customState } = row
                        const choicesOptions = customState.choices
                            .filter(({ value }) => !!value)
                            .map(({ value }) => ({ label: value, value }))

                        if (id === rowAction.rowId && choicesOptions.length > 0) {
                            return {
                                ...row,
                                data: {
                                    ...data,
                                    val:
                                        data.val.type === DynamicDataTableRowDataType.SELECT_TEXT
                                            ? {
                                                  ...data.val,
                                                  props: {
                                                      ...data.val.props,
                                                      options: data.val.props.options.map((option) =>
                                                          option.label === VAL_COLUMN_CHOICES_DROPDOWN_LABEL
                                                              ? {
                                                                    label: VAL_COLUMN_CHOICES_DROPDOWN_LABEL,
                                                                    options: choicesOptions,
                                                                }
                                                              : option,
                                                      ),
                                                  },
                                              }
                                            : data.val,
                                },
                            }
                        }

                        return row
                    })
                    break

                case VariableDataTableActionType.UPDATE_CHOICES:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  customState: {
                                      ...row.customState,
                                      choices: rowAction.actionValue(row.customState.choices),
                                  },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_ALLOW_CUSTOM_INPUT:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  data: {
                                      ...row.data,
                                      ...(row.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT
                                          ? {
                                                val: {
                                                    ...row.data.val,
                                                    props: {
                                                        ...row.data.val.props,
                                                        selectPickerProps: {
                                                            isCreatable:
                                                                row.data.format.value !== VariableTypeFormat.BOOL &&
                                                                row.data.format.value !== VariableTypeFormat.DATE &&
                                                                !row.customState?.blockCustomValue,
                                                        },
                                                    },
                                                },
                                            }
                                          : {}),
                                  },
                                  customState: { ...row.customState, blockCustomValue: rowAction.actionValue },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? { ...row, customState: { ...row.customState, askValueAtRuntime: rowAction.actionValue } }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_VARIABLE_DESCRIPTION:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  customState: { ...row.customState, variableDescription: rowAction.actionValue },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_VARIABLE_REQUIRED:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  data: {
                                      ...row.data,
                                      variable: { ...row.data.variable, required: rowAction.actionValue },
                                  },
                                  customState: { ...row.customState, isVariableRequired: rowAction.actionValue },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_FILE_MOUNT:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  customState: {
                                      ...row.customState,
                                      fileInfo: { ...row.customState.fileInfo, mountDir: rowAction.actionValue },
                                  },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_FILE_ALLOWED_EXTENSIONS:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  data:
                                      row.data.val.type === DynamicDataTableRowDataType.FILE_UPLOAD
                                          ? {
                                                ...row.data,
                                                val: {
                                                    ...row.data.val,
                                                    props: {
                                                        ...row.data.val.props,
                                                        fileTypes: rowAction.actionValue.split(','),
                                                    },
                                                },
                                            }
                                          : row.data,
                                  customState: {
                                      ...row.customState,
                                      fileInfo: {
                                          ...row.customState.fileInfo,
                                          allowedExtensions: rowAction.actionValue,
                                      },
                                  },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_FILE_MAX_SIZE:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  customState: {
                                      ...row.customState,
                                      fileInfo: {
                                          ...row.customState.fileInfo,
                                          maxUploadSize: rowAction.actionValue.size,
                                          unit: rowAction.actionValue.unit,
                                      },
                                  },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.ADD_ROW:
                    updatedRows = [
                        getEmptyVariableDataTableRow({ ...emptyRowParams, id: rowAction.actionValue }),
                        ...updatedRows,
                    ]
                    break

                case VariableDataTableActionType.DELETE_ROW:
                    updatedRows = updatedRows.filter((row) => row.id !== rowAction.rowId)
                    if (updatedRows.length === 0) {
                        updatedRows = [getEmptyVariableDataTableRow(emptyRowParams)]
                    }
                    break

                case VariableDataTableActionType.UPDATE_ROW:
                    updatedRows = rows.map<VariableDataRowType>((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  data: {
                                      ...row.data,
                                      [rowAction.headerKey]: {
                                          ...row.data[rowAction.headerKey],
                                          value: rowAction.actionValue,
                                      },
                                  },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  customState: {
                                      ...row.customState,
                                      fileInfo: {
                                          ...row.customState.fileInfo,
                                          id: rowAction.actionValue.fileReferenceId,
                                      },
                                  },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_VAL_COLUMN:
                    updatedRows = updatedRows.map((row) => {
                        if (
                            row.id === rowAction.rowId &&
                            row.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT
                        ) {
                            const { selectedValue, value } = rowAction.actionValue as {
                                selectedValue: SelectPickerOptionType<string> & ExtendedOptionType
                                value: string
                            }
                            const isSystemVariable =
                                !!selectedValue.refVariableStage ||
                                (selectedValue?.variableType && selectedValue.variableType !== RefVariableType.NEW)

                            return {
                                ...row,
                                data: {
                                    ...row.data,
                                    val: {
                                        ...row.data.val,
                                        value: getValColumnRowValue(
                                            row.data.val.value,
                                            row.data.format.value as VariableTypeFormat,
                                            value,
                                            selectedValue,
                                            isSystemVariable,
                                        ),
                                        props: {
                                            ...row.data.val.props,
                                            Icon: value && isSystemVariable ? getSystemVariableIcon() : null,
                                        },
                                    },
                                },
                                customState: {
                                    ...row.customState,
                                    selectedValue: rowAction.actionValue.selectedValue,
                                },
                            }
                        }

                        return row
                    })
                    break

                case VariableDataTableActionType.UPDATE_FORMAT_COLUMN:
                    updatedRows = updatedRows.map((row) => {
                        if (
                            row.id === rowAction.rowId &&
                            row.data.format.type === DynamicDataTableRowDataType.DROPDOWN
                        ) {
                            return {
                                ...row,
                                data: {
                                    ...row.data,
                                    format: {
                                        ...row.data.format,
                                        value: rowAction.actionValue.value,
                                    },
                                    val: getValColumnRowProps({
                                        ...emptyRowParams,
                                        activeStageName,
                                        formData,
                                        type,
                                        format: rowAction.actionValue.value as VariableTypeFormat,
                                        id: rowAction.rowId as number,
                                    }),
                                },
                                customState: {
                                    isVariableRequired: false,
                                    variableDescription: '',
                                    selectedValue: rowAction.actionValue.selectedValue,
                                    choices: [],
                                    blockCustomValue: false,
                                    askValueAtRuntime: false,
                                    fileInfo: {
                                        id: null,
                                        allowedExtensions: '',
                                        maxUploadSize: '',
                                        mountDir: {
                                            value: '/devtroncd',
                                            error: '',
                                        },
                                        unit: FILE_UPLOAD_SIZE_UNIT_OPTIONS[0],
                                    },
                                },
                            }
                        }
                        return row
                    })
                    break

                default:
                    break
            }

            const { updatedFormData, updatedFormDataErrorObj } = convertVariableDataTableToFormData({
                rows: updatedRows,
                activeStageName,
                formData,
                formDataErrorObj,
                selectedTaskIndex,
                type,
                validateTask,
                calculateLastStepDetail,
            })
            setFormDataErrorObj(updatedFormDataErrorObj)
            setFormData(updatedFormData)

            return updatedRows
        })
    }

    const dataTableHandleAddition = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.ADD_ROW,
            actionValue: rows.length,
        })
    }

    const dataTableHandleChange: DynamicDataTableProps<VariableDataKeys, VariableDataCustomState>['onRowEdit'] = (
        updatedRow,
        headerKey,
        value,
        extraData,
    ) => {
        if (headerKey === 'val' && updatedRow.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT) {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_VAL_COLUMN,
                actionValue: { value, selectedValue: extraData.selectedValue, files: extraData.files },
                rowId: updatedRow.id,
            })
        } else if (
            headerKey === 'val' &&
            updatedRow.data.val.type === DynamicDataTableRowDataType.FILE_UPLOAD &&
            extraData.files.length
        ) {
            // TODO: check this merge with UPDATE_FILE_UPLOAD_INFO after loading state
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_ROW,
                actionValue: value,
                headerKey,
                rowId: updatedRow.id,
            })

            uploadFile({
                file: extraData.files,
                ...getUploadFileConstraints({
                    unit: updatedRow.customState.fileInfo.unit.label as string,
                    allowedExtensions: updatedRow.customState.fileInfo.allowedExtensions,
                    maxUploadSize: updatedRow.customState.fileInfo.maxUploadSize,
                }),
            })
                .then((res) => {
                    handleRowUpdateAction({
                        actionType: VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO,
                        actionValue: { fileReferenceId: res.id },
                        rowId: updatedRow.id,
                    })
                })
                .catch(() => {
                    handleRowUpdateAction({
                        actionType: VariableDataTableActionType.UPDATE_ROW,
                        actionValue: '',
                        headerKey,
                        rowId: updatedRow.id,
                    })
                })
        } else if (headerKey === 'format' && updatedRow.data.format.type === DynamicDataTableRowDataType.DROPDOWN) {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_FORMAT_COLUMN,
                actionValue: { value, selectedValue: extraData.selectedValue },
                rowId: updatedRow.id,
            })
        } else {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_ROW,
                actionValue: value,
                headerKey,
                rowId: updatedRow.id,
            })
        }
    }

    const dataTableHandleDelete: DynamicDataTableProps<VariableDataKeys, VariableDataCustomState>['onRowDelete'] = (
        row,
    ) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.DELETE_ROW,
            rowId: row.id,
        })
    }

    const onActionButtonPopupClose = (rowId: string | number) => () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS,
            rowId,
        })
    }

    const validationSchema: DynamicDataTableProps<VariableDataKeys, VariableDataCustomState>['validationSchema'] = (
        _,
        key,
        { id },
    ) => {
        if (key === 'val') {
            const index = rows.findIndex((row) => row.id === id)
            if (index > -1 && ioVariablesError[index]) {
                const { isValid, message } = ioVariablesError[index]
                return { isValid, errorMessages: [message] }
            }
        }

        return { isValid: true, errorMessages: [] }
    }

    const actionButtonRenderer = (row: VariableDataRowType) => (
        <VariableDataTablePopupMenu
            heading={row.data.variable.value || 'Value configuration'}
            onClose={onActionButtonPopupClose(row.id)}
        >
            <ValueConfigOverlay row={row} handleRowUpdateAction={handleRowUpdateAction} />
        </VariableDataTablePopupMenu>
    )

    const getActionButtonConfig = (): DynamicDataTableProps<VariableDataKeys>['actionButtonConfig'] => {
        if (type === PluginVariableType.INPUT) {
            return {
                renderer: actionButtonRenderer,
                key: 'val',
                position: 'end',
            }
        }
        return null
    }

    const getTrailingCellIcon = (): DynamicDataTableProps<VariableDataKeys>['trailingCellIcon'] => ({
        variable:
            isCustomTask && type === PluginVariableType.INPUT
                ? (row: VariableDataRowType) => (
                      <VariableDataTablePopupMenu showIcon heading="Variable configuration">
                          <VariableConfigOverlay row={row} handleRowUpdateAction={handleRowUpdateAction} />
                      </VariableDataTablePopupMenu>
                  )
                : null,
    })

    return (
        <DynamicDataTable<VariableDataKeys, VariableDataCustomState>
            key={initialRowsSet.current}
            headers={getVariableDataTableHeaders(type)}
            rows={rows}
            readOnly={!isCustomTask && type === PluginVariableType.OUTPUT}
            isAdditionNotAllowed={!isCustomTask}
            isDeletionNotAllowed={!isCustomTask}
            trailingCellIcon={getTrailingCellIcon()}
            onRowEdit={dataTableHandleChange}
            onRowDelete={dataTableHandleDelete}
            onRowAdd={dataTableHandleAddition}
            // showError
            validationSchema={validationSchema}
            actionButtonConfig={getActionButtonConfig()}
        />
    )
}
