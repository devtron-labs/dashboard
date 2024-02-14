import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
import { User } from '../../../types'

export interface UserPermissionGroupsSelectorProps {
    userData: User
    userGroups: OptionType[]
    setUserGroups: React.Dispatch<React.SetStateAction<OptionType[]>>
}
