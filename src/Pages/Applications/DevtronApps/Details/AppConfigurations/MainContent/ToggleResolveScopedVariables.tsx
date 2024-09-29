import { Toggle, Tooltip } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICViewVariableToggle } from '@Icons/ic-view-variable-toggle.svg'
import { ToggleResolveScopedVariablesProps } from './types'

const ToggleResolveScopedVariables = ({
    resolveScopedVariables,
    handleToggleScopedVariablesView,
    isDisabled = false,
}: ToggleResolveScopedVariablesProps) => (
    <Tooltip alwaysShowTippyOnHover content={resolveScopedVariables ? 'Hide variables value' : 'Show variables value'}>
        <div className="w-28 h-18">
            <Toggle
                selected={resolveScopedVariables}
                color="var(--B300)"
                onSelect={handleToggleScopedVariablesView}
                Icon={ICViewVariableToggle}
                disabled={isDisabled}
                rootClassName="dc__toggle-square-toggle"
                iconClass="scb-5"
            />
        </div>
    </Tooltip>
)

export default ToggleResolveScopedVariables
