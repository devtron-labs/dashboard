// TODO (v3): Remove this file

import { getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'
import { groupHeaderStyle } from '../../../../../../components/v2/common/ReactSelect.utils'

const _selectStyles = getCommonSelectStyle()

export const authorizationSelectStyles = {
    ..._selectStyles,
    ...groupHeaderStyle,
    control: (base, state) => ({
        ..._selectStyles.control(base, state),
        height: '36px',
    }),
    option: (base, state) => ({
        ..._selectStyles.option(base, state),
        ...(state.isSelected && {
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        })
    }),
}

// TODO (v3): This should be from fe-lib
export const APPROVER_ACTION = { label: 'approver', value: 'approver' }
// TODO (v3): This should be from fe-lib
export const CONFIG_APPROVER_ACTION = { label: 'configApprover', value: 'configApprover' }
