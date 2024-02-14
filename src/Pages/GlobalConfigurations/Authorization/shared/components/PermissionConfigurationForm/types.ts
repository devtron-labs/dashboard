import { PermissionType } from '../../../constants'
import { PermissionGroup, User } from '../../../types'
import { AppPermissionsType } from '../userGroups/userGroups.types'
import { UserPermissionGroupsSelectorProps } from '../UserPermissionGroupsSelector/types'

export type PermissionConfigurationFormProps = {
    permissionType: PermissionType
    handlePermissionType: (e) => void
    showUserPermissionGroupSelector?: boolean
    appPermissionProps: Omit<AppPermissionsType, 'data'>
} & (
    | {
          data: User
          showUserPermissionGroupSelector: true
          userPermissionGroupSelectorProps: Omit<UserPermissionGroupsSelectorProps, 'userData'>
      }
    | {
          data: PermissionGroup
          showUserPermissionGroupSelector?: false
          userPermissionGroupSelectorProps?: never
      }
)
