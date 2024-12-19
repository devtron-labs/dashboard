import { importComponentFromFELibrary } from '@Components/common'
import { EnterpriseTag, OverrideMergeStrategyType, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', false, 'function')

const IS_ENV_MERGE_STRATEGY_VALID =
    Object.values(OverrideMergeStrategyType).includes(window._env_.FEATURE_DEFAULT_MERGE_STRATEGY) &&
    !(!isFELibAvailable && window._env_.FEATURE_DEFAULT_MERGE_STRATEGY === OverrideMergeStrategyType.PATCH)

const FALLBACK_MERGE_STRATEGY: OverrideMergeStrategyType = isFELibAvailable
    ? OverrideMergeStrategyType.PATCH
    : OverrideMergeStrategyType.REPLACE

export const DEFAULT_MERGE_STRATEGY: OverrideMergeStrategyType = IS_ENV_MERGE_STRATEGY_VALID
    ? window._env_.FEATURE_DEFAULT_MERGE_STRATEGY
    : FALLBACK_MERGE_STRATEGY

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
