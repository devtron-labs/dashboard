import { SearchBarProps } from '@devtron-labs/devtron-fe-common-lib'
import { getUserList } from '../../authorization.service'
import { User } from '../../types'

export interface UserPermissionRowProps extends User {
    index: number
    showStatus: boolean
    refetchUserPermissionList: () => void
}

export interface UserPermissionListHeaderProps {
    disabled: boolean
    showStatus: boolean
    handleSearch: SearchBarProps['handleEnter']
    initialSearchText: SearchBarProps['initialSearchText']
    getDataToExport: () => ReturnType<typeof getUserList>
}
