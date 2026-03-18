import { DynamicDataTableProps, DynamicDataTableRowDataType, getUniqueId } from '@devtron-labs/devtron-fe-common-lib'

import { DEFAULT_LABEL_SELECTOR_OPERATOR, LABEL_OPERATORS_WITHOUT_VALUE } from './Constants'
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
                    label: operator,
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
