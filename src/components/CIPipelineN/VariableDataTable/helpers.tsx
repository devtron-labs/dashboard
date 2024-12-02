import { Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Var } from '@Icons/ic-var-initial.svg'
import { TIPPY_VAR_MSG } from '../Constants'

export const getSystemVariableIcon = () => (
    <Tooltip content={TIPPY_VAR_MSG} placement="left" animation="shift-away" alwaysShowTippyOnHover>
        <div className="flex">
            <Var className="icon-dim-18 icon-n4" />
        </div>
    </Tooltip>
)
