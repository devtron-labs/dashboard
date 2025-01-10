import { Toggle, Tooltip } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICVariable } from '@Icons/ic-variable.svg'
import { ToggleResolveScopedVariablesProps } from './types'

const ToggleResolveScopedVariables = ({
    resolveScopedVariables,
    handleToggleScopedVariablesView,
    isDisabled = false,
    showTooltip = true,
}: ToggleResolveScopedVariablesProps) => (
    <Tooltip
        alwaysShowTippyOnHover={showTooltip}
        content={resolveScopedVariables ? 'Hide variables value' : 'Show variables value'}
    >
        <div className="w-28 h-18">
            <Toggle
                selected={resolveScopedVariables}
                color={resolveScopedVariables ? 'var(--B300)' : 'var(--N200)'}
                onSelect={handleToggleScopedVariablesView}
                Icon={ICVariable}
                disabled={isDisabled}
                rootClassName="dc__toggle-square-toggle"
                iconClass={resolveScopedVariables ? 'scb-5' : 'scn-6'}
            />
        </div>
    </Tooltip>
)

export default ToggleResolveScopedVariables
