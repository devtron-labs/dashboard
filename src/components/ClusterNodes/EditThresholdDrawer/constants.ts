import { ResourceDetail, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { NODE_RESOURCE_THRESHOLD_OPERATOR_MAP } from '../constants'
import { ThresholdTableHeaderKeys, ThresholdTableType } from './types'

export const THRESHOLD_TABLE_HEADERS: ThresholdTableType['headers'] = [
    {
        key: ThresholdTableHeaderKeys.RESOURCE,
        label: 'RESOURCE',
        width: '1fr',
    },
    {
        key: ThresholdTableHeaderKeys.INHERITED_THRESHOLD,
        label: 'INHERITED THRESHOLD',
        width: '200px',
    },
    {
        key: ThresholdTableHeaderKeys.OPERATOR,
        label: 'OPERATOR',
        width: '100px',
    },
    {
        key: ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD,
        label: 'OVERRIDE THRESHOLD',
        width: '232px',
    },
]

export const THRESHOLD_TABLE_OPERATOR_OPTIONS: SelectPickerOptionType<ResourceDetail['threshold']['operator']>[] = [
    {
        label: NODE_RESOURCE_THRESHOLD_OPERATOR_MAP.greaterThan,
        value: 'greaterThan',
    },
    {
        label: NODE_RESOURCE_THRESHOLD_OPERATOR_MAP.lessThan,
        value: 'lessThan',
    },
    {
        label: NODE_RESOURCE_THRESHOLD_OPERATOR_MAP.equalTo,
        value: 'equalTo',
    },
]
