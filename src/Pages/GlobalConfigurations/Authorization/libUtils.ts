import { UserRoleGroup } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '../../../components/common'
import { User } from './types'

// Adding here to avoid circular import dependency
// These are being reused across with default values

export const getDefaultUserStatusAndTimeout: () => Pick<User, 'userStatus' | 'timeToLive'> =
    importComponentFromFELibrary('getDefaultUserStatusAndTimeout', () => ({}), 'function')

export const getDefaultStatusAndTimeout: () => Pick<UserRoleGroup, 'status' | 'timeToLive'> =
    importComponentFromFELibrary('getDefaultStatusAndTimeout', () => ({}), 'function')

export const getFormattedTimeToLive: (timeToLive: string) => string = importComponentFromFELibrary(
    'getFormattedTimeToLive',
    () => ({}),
    'function',
)
