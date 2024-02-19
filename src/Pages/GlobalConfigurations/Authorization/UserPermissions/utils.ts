import { DefaultUserKey } from '@devtron-labs/devtron-fe-common-lib'
import { User } from '../types'

// eslint-disable-next-line import/prefer-default-export
export const getIsAdminOrSystemUser = (userEmail: User['emailId']): boolean =>
    userEmail === DefaultUserKey.admin || userEmail === DefaultUserKey.system
