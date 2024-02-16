// TODO (v3): Remove this file

import { multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'
import { groupHeaderStyle } from '../../../../../../components/v2/common/ReactSelect.utils'

export const tempMultiSelectStyles = {
    ...multiSelectStyles,
    ...groupHeaderStyle,
    menu: (base, state) => ({
        ...base,
        top: 'auto',
        width: '140%',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
}

// TODO (v3): This should be from fe-lib
export const APPROVER_ACTION = { label: 'approver', value: 'approver' }
// TODO (v3): This should be from fe-lib
export const CONFIG_APPROVER_ACTION = { label: 'configApprover', value: 'configApprover' }
