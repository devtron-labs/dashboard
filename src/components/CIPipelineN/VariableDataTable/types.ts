import { PluginVariableType } from '@Components/ciPipeline/types'
import { PipelineContext } from '@Components/workflowEditor/types'
import {
    DynamicDataTableHeaderType,
    DynamicDataTableRowType,
    RefVariableStageType,
    RefVariableType,
    SelectPickerOptionType,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

export interface VariableDataTableProps {
    type: PluginVariableType
    isCustomTask?: boolean
}

export interface VariableDataTableSelectPickerOptionType extends SelectPickerOptionType<string> {
    format?: VariableTypeFormat
    variableType?: RefVariableType
    refVariableStage?: RefVariableStageType
    refVariableName?: string
    refVariableStepIndex?: number
}

export type VariableDataKeys = 'variable' | 'format' | 'val'

export type VariableDataCustomState = {
    defaultValue: string
    variableDescription: string
    isVariableRequired: boolean
    choices: { id: number; value: string; error: string }[]
    askValueAtRuntime: boolean
    blockCustomValue: boolean
    valColumnSelectedValue: VariableDataTableSelectPickerOptionType
    fileInfo: {
        id: number
        mountDir: {
            value: string
            error: string
        }
        allowedExtensions: string
        maxUploadSize: string
        unit: SelectPickerOptionType<number>
    }
}

export type VariableDataRowType = DynamicDataTableRowType<VariableDataKeys, VariableDataCustomState>

export enum VariableDataTableActionType {
    // GENERAL ACTIONS
    ADD_ROW = 'add-row',
    UPDATE_ROW = 'update_row',
    DELETE_ROW = 'delete_row',
    UPDATE_VAL_COLUMN = 'update_val_column',
    UPDATE_FORMAT_COLUMN = 'update_format_column',
    UPDATE_FILE_UPLOAD_INFO = 'update_file_upload_info',

    // TABLE ROW ACTIONS
    ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS = 'add_choices_to_value_column_options',
    UPDATE_CHOICES = 'update_choices',
    UPDATE_ASK_VALUE_AT_RUNTIME = 'update_ask_value_at_runtime',
    UPDATE_ALLOW_CUSTOM_INPUT = 'update_allow_custom_input',
    UPDATE_FILE_MOUNT = 'update_file_mount',
    UPDATE_FILE_ALLOWED_EXTENSIONS = 'update_file_allowed_extensions',
    UPDATE_FILE_MAX_SIZE = 'update_file_max_size',

    // VARIABLE COLUMN ACTIONS
    UPDATE_VARIABLE_DESCRIPTION = 'update_variable_description',
    UPDATE_VARIABLE_REQUIRED = 'update_variable_required',
}

type VariableDataTableActionPropsMap = {
    [VariableDataTableActionType.ADD_ROW]: { rowId: number }
    [VariableDataTableActionType.UPDATE_ROW]: {
        actionValue: string
        headerKey: VariableDataKeys
        rowId: string | number
    }
    [VariableDataTableActionType.DELETE_ROW]: {
        rowId: string | number
    }
    [VariableDataTableActionType.UPDATE_VAL_COLUMN]: {
        actionValue: {
            value: string
            valColumnSelectedValue: VariableDataTableSelectPickerOptionType
        }
        rowId: string | number
    }
    [VariableDataTableActionType.UPDATE_FORMAT_COLUMN]: {
        actionValue: VariableTypeFormat
        rowId: string | number
    }
    [VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO]: {
        actionValue: Pick<VariableType, 'fileReferenceId'> & {
            fileName: string
            isLoading: boolean
        }
        rowId: string | number
    }

    [VariableDataTableActionType.UPDATE_ALLOW_CUSTOM_INPUT]: {
        actionValue: VariableDataCustomState['blockCustomValue']
        rowId: string | number
    }
    [VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME]: {
        actionValue: VariableDataCustomState['askValueAtRuntime']
        rowId: string | number
    }
    [VariableDataTableActionType.UPDATE_CHOICES]: {
        actionValue: (currentChoices: VariableDataCustomState['choices']) => VariableDataCustomState['choices']
        rowId: string | number
    }
    [VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS]: {
        rowId: string | number
    }
    [VariableDataTableActionType.UPDATE_FILE_MOUNT]: {
        rowId: string | number
        actionValue: {
            value: string
            error: string
        }
    }
    [VariableDataTableActionType.UPDATE_FILE_ALLOWED_EXTENSIONS]: {
        rowId: string | number
        actionValue: string
    }
    [VariableDataTableActionType.UPDATE_FILE_MAX_SIZE]: {
        rowId: string | number
        actionValue: {
            size: string
            unit: SelectPickerOptionType<number>
        }
    }

    [VariableDataTableActionType.UPDATE_VARIABLE_DESCRIPTION]: { actionValue: string; rowId: string | number }
    [VariableDataTableActionType.UPDATE_VARIABLE_REQUIRED]: { actionValue: boolean; rowId: string | number }
}

export type VariableDataTableAction<
    T extends keyof VariableDataTableActionPropsMap = keyof VariableDataTableActionPropsMap,
> = T extends keyof VariableDataTableActionPropsMap ? { actionType: T } & VariableDataTableActionPropsMap[T] : never

export type HandleRowUpdateActionProps = VariableDataTableAction

export interface VariableDataTablePopupMenuProps {
    heading: string
    showIcon?: boolean
    disableClose?: boolean
    onClose?: () => void
    children: JSX.Element
}

export interface ConfigOverlayProps {
    row: VariableDataRowType
    handleRowUpdateAction: (props: HandleRowUpdateActionProps) => void
}

export type GetValColumnRowPropsType = Pick<
    PipelineContext,
    | 'activeStageName'
    | 'formData'
    | 'globalVariables'
    | 'isCdPipeline'
    | 'selectedTaskIndex'
    | 'inputVariablesListFromPrevStep'
> &
    Pick<
        VariableType,
        'format' | 'value' | 'refVariableName' | 'refVariableStage' | 'valueConstraint' | 'description' | 'variableType'
    > & { type: PluginVariableType }

export interface GetVariableDataTableInitialRowsProps
    extends Omit<
        GetValColumnRowPropsType,
        'description' | 'format' | 'variableType' | 'value' | 'refVariableName' | 'refVariableStage' | 'valueConstraint'
    > {
    ioVariables: VariableType[]
    type: PluginVariableType
    isCustomTask: boolean
}

export interface GetValidateCellProps {
    pluginVariableType: PluginVariableType
    keysFrequencyMap: Record<string, number>
    key: VariableDataKeys
    row: VariableDataRowType
    value?: string
}

export interface ValidateVariableDataTableProps
    extends Pick<GetValidateCellProps, 'keysFrequencyMap' | 'pluginVariableType'> {
    rows: VariableDataRowType[]
    headers: DynamicDataTableHeaderType<VariableDataKeys>[]
}
