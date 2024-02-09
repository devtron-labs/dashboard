import { User } from '../types'
import { DefaultUserKey } from './constants'

// eslint-disable-next-line import/prefer-default-export
export const getIsAdminOrSystemUser = (userEmail: User['emailId']): boolean =>
    userEmail === DefaultUserKey.admin || userEmail === DefaultUserKey.system
