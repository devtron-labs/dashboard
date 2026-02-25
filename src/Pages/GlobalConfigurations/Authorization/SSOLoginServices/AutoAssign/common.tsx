import { InfoBlock } from '@devtron-labs/devtron-fe-common-lib'

export const PermissionGroupInfoBar = () => (
    <InfoBlock
        description={
            <>
                Users are auto-assigned a permission group upon SSO login. Ensure matching Permission Groups are created
                on Devtron and SSO service provider.
            </>
        }
    />
)

export const UserPermissionsInfoBar = () => (
    <InfoBlock
        description={
            <>
                User permissions are being managed via SSO service provider. Direct permissions cannot be assigned to
                users.
            </>
        }
    />
)
