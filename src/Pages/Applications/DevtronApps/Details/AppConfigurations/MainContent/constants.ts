import { OverrideMergeStrategyType, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

export const DEFAULT_MERGE_STRATEGY: OverrideMergeStrategyType = OverrideMergeStrategyType.REPLACE

export const MERGE_STRATEGY_OPTIONS: SelectPickerOptionType[] = [
    {
        label: 'Patch',
        description: 'Override values for specific keys',
        value: OverrideMergeStrategyType.PATCH,
    },
    {
        label: 'Replace',
        description: 'Override complete configuration',
        value: OverrideMergeStrategyType.REPLACE,
    },
]
