import { importComponentFromFELibrary, validateEmail } from '../../../../components/common'
import { authorizationSelectStyles } from '../shared/components/userGroups/UserGroup'
import { User } from '../types'
import { DefaultUserKey } from './constants'
import { UserListFilter } from './List/types'

const getStatusFromSearchParams = importComponentFromFELibrary('getStatusFromSearchParams', null, 'function')

// eslint-disable-next-line import/prefer-default-export
export const getIsAdminOrSystemUser = (userEmail: User['emailId']): boolean =>
    userEmail === DefaultUserKey.admin || userEmail === DefaultUserKey.system

export const parseSearchParams = (searchParams: URLSearchParams): UserListFilter => ({
    status: getStatusFromSearchParams ? getStatusFromSearchParams(searchParams) : [],
})

export const getCreatableChipStyle = () => ({
    ...authorizationSelectStyles,
    multiValue: (base, state) => ({
        ...base,
        border: validateEmail(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
        borderRadius: `4px`,
        background: validateEmail(state.data.value) ? 'white' : 'var(--R100)',
        height: '28px',
        margin: 0,
        paddingLeft: '2px 4px',
        fontSize: '12px',
    }),
    control: (base, state) => ({
        ...authorizationSelectStyles.control(base, state),
        minHeight: '36px',
        height: 'auto',
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '34px',
    }),
    valueContainer: (base) => ({
        ...authorizationSelectStyles.valueContainer(base),
        gap: '4px',
        paddingBlock: '4px',
    }),
})
