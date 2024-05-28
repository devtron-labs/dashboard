import { DefaultUserKey } from '@devtron-labs/devtron-fe-common-lib'
import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../../../config'
import { User } from '../../types'
import { getDefaultUserStatusAndTimeout } from '../../libUtils'

export const userListLoading: User[] = Array.from(Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys()).map((index) => ({
    id: index,
    emailId: '',
    roleFilters: [],
    userRoleGroups: [],
    superAdmin: false,
    ...getDefaultUserStatusAndTimeout(),
}))

export const DEFAULT_USER_TOOLTIP_CONTENT: Record<DefaultUserKey, string> = {
    [DefaultUserKey.admin]:
        'Actions performed by the administrator user are logged under the ‘admin’ user for auditing.',
    [DefaultUserKey.system]: 'Automated actions performed in Devtron are logged under the ‘system’ user for auditing.',
}
