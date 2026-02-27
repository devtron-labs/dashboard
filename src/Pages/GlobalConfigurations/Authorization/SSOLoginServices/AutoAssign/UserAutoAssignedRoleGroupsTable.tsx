import { GenericEmptyState, UserRoleGroupsTable } from '@devtron-labs/devtron-fe-common-lib'

import { UserPermissionsInfoBar } from './common'
import { UserAutoAssignedRoleGroupsTableProps } from './types'

const UserAutoAssignedRoleGroupsTable = ({ roleGroups }: UserAutoAssignedRoleGroupsTableProps) => (
    <>
        <UserPermissionsInfoBar />
        {roleGroups?.length ? (
            <UserRoleGroupsTable roleGroups={roleGroups} showStatus={false} handleDelete={null} />
        ) : (
            <GenericEmptyState
                imgName="empty-state-key"
                title="No permissions found"
                subTitle="User permissions are being managed via SSO service provider. Direct permissions cannot be assigned to users."
                classname="flex-grow-1"
            />
        )}
    </>
)

export default UserAutoAssignedRoleGroupsTable
