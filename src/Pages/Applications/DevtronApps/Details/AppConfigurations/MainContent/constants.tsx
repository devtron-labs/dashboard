import { importComponentFromFELibrary } from '@Components/common'
import { EnterpriseTag, OverrideMergeStrategyType, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', false, 'function')

export const DEFAULT_MERGE_STRATEGY: OverrideMergeStrategyType = OverrideMergeStrategyType.PATCH

export const MERGE_STRATEGY_OPTIONS: SelectPickerOptionType[] = [
    {
        label: (
            <div className="flexbox dc__gap-8">
                <span>Patch</span>
                {!isFELibAvailable && <EnterpriseTag />}
            </div>
        ),
        description: 'Override values for specific keys',
        value: OverrideMergeStrategyType.PATCH,
    },
    {
        label: 'Replace',
        description: 'Override complete configuration',
        value: OverrideMergeStrategyType.REPLACE,
    },
]
