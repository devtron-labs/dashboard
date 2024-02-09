import { SearchBarProps } from '@devtron-labs/devtron-fe-common-lib'
import { getPermissionGroupList } from '../../authorization.service'
import { PermissionGroup } from '../../types'

export interface PermissionGroupRowProps extends PermissionGroup {
    index: number
    refetchPermissionGroupList: () => void
}

export interface PermissionGroupListHeaderProps {
    disabled: boolean
    handleSearch: SearchBarProps['handleEnter']
    initialSearchText: SearchBarProps['initialSearchText']
    getDataToExport: () => ReturnType<typeof getPermissionGroupList>
}
