import { Icon } from '@devtron-labs/devtron-fe-common-lib'
import { PermissionGroup } from '../../types'

export const getPermissionGroupIcon = ({
    superAdmin,
    hasAccessManagerPermission,
}: Pick<PermissionGroup, 'superAdmin' | 'hasAccessManagerPermission'>) => {
    if (!(superAdmin || hasAccessManagerPermission)) {
        return null
    }
    return (
        <Icon
            name={superAdmin ? 'ic-crown' : 'ic-user-key'}
            tooltipProps={{
                content: superAdmin
                    ? 'Group contains super admin permissions'
                    : 'Group contains access manager permissions',
                alwaysShowTippyOnHover: true,
                placement: 'right',
            }}
            color={null}
        />
    )
}
