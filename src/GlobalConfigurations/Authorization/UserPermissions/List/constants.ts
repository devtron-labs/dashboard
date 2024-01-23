import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../../config'
import { User } from '../../types'
import { DefaultUserKey } from '../constants'

export const userListLoading: User[] = Array.from(Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys()).map((index) => ({
    id: index,
    emailId: '',
    roleFilters: [],
    groups: [],
    superAdmin: false,
}))

export const DEFAULT_USER_TOOLTIP_CONTENT: Record<DefaultUserKey, string> = {
    [DefaultUserKey.admin]:
        'Actions performed by the administrator user are logged under the ‘admin’ user for auditing.',
    [DefaultUserKey.system]: 'Automated actions performed in Devtron are logged under the ‘system’ user for auditing.',
}

export enum SortableKeys {
    email = 'email_id',
    lastLogin = 'last_login',
}
