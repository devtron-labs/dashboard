import { DefaultUserKey } from '@devtron-labs/devtron-fe-common-lib'
import { User } from '../types'
import { importComponentFromFELibrary } from '../../../../components/common'
import { UserListFilter } from './List/types'

const getStatusFromSearchParams = importComponentFromFELibrary('getStatusFromSearchParams', null, 'function')

// eslint-disable-next-line import/prefer-default-export
export const getIsAdminOrSystemUser = (userEmail: User['emailId']): boolean =>
    userEmail === DefaultUserKey.admin || userEmail === DefaultUserKey.system

export const parseSearchParams = (searchParams: URLSearchParams): UserListFilter => ({
    status: getStatusFromSearchParams ? getStatusFromSearchParams(searchParams) : [],
})
