import {
    DynamicDataTableCellErrorType,
    DynamicDataTableProps,
    DynamicDataTableRowDataType,
    getUniqueId,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    DEFAULT_LABEL_SELECTOR_OPERATOR,
    LABEL_OPERATOR_DISPLAY_TEXT,
    LABEL_OPERATORS_WITHOUT_VALUE,
} from './Constants'
import { AppListFilterLabelOperatorType, AppListFilterLabelTableHeaderType, AppListFilterLabelType } from './types'

export const getSelectorRowConfig = (
    selector?: AppListFilterLabelType,
): DynamicDataTableProps<AppListFilterLabelTableHeaderType>['rows'][number] => ({
    data: {
        [AppListFilterLabelTableHeaderType.KEY]: {
            value: selector?.key || '',
            type: DynamicDataTableRowDataType.TEXT,
            props: {
                placeholder: 'Key',
            },
        },
        [AppListFilterLabelTableHeaderType.OPERATOR]: {
            value: selector?.operator || DEFAULT_LABEL_SELECTOR_OPERATOR,
            type: DynamicDataTableRowDataType.DROPDOWN,
            props: {
                options: Object.values(AppListFilterLabelOperatorType).map((operator) => ({
                    label: LABEL_OPERATOR_DISPLAY_TEXT[operator] || operator,
                    value: operator,
                })),
                placeholder: 'Select operator',
            },
        },
        [AppListFilterLabelTableHeaderType.VALUE]: {
            value: selector?.value || '',
            type: DynamicDataTableRowDataType.TEXT,
            disabled: LABEL_OPERATORS_WITHOUT_VALUE.includes(selector?.operator),
            tooltip: {
                content: LABEL_OPERATORS_WITHOUT_VALUE.includes(selector?.operator)
                    ? 'Value not required for this operator'
                    : '',
            },
            props: {
                placeholder: 'Enter value',
            },
        },
    },
    id: selector?.id || getUniqueId(),
})

export const getEmptyLabelSelector = (): AppListFilterLabelType => ({
    key: '',
    value: '',
    operator: DEFAULT_LABEL_SELECTOR_OPERATOR,
    id: getUniqueId(),
})

export const validateLabelValue = (value: string, operator: AppListFilterLabelOperatorType): string | null => {
    if (LABEL_OPERATORS_WITHOUT_VALUE.includes(operator)) {
        return null
    }
    if (!value.trim()) {
        return 'Value is required for the selected operator'
    }
    return null
}

export const getSelectorsErrorState = (
    selectors: AppListFilterLabelType[],
): DynamicDataTableCellErrorType<AppListFilterLabelTableHeaderType> => {
    const cellErrors: DynamicDataTableCellErrorType<AppListFilterLabelTableHeaderType> = {}
    selectors.forEach((selector) => {
        const hasKey = !!selector.key.trim()
        const hasValue = !!(selector.value || '').trim()

        const keyError = !hasKey && hasValue ? 'Key is required' : null
        const valueError = hasKey ? validateLabelValue(selector.value || '', selector.operator) : null
        if (keyError || valueError) {
            cellErrors[selector.id] = {}
            if (keyError) {
                cellErrors[selector.id][AppListFilterLabelTableHeaderType.KEY] = {
                    isValid: false,
                    errorMessages: [keyError],
                }
            }
            if (valueError) {
                cellErrors[selector.id][AppListFilterLabelTableHeaderType.VALUE] = {
                    isValid: false,
                    errorMessages: [valueError],
                }
            }
        }
    })
    return cellErrors
}
