import { InfoBlock } from '@devtron-labs/devtron-fe-common-lib'

import LearnMoreTippy from './LearnMoreTippy'

const Tippy = () => (
    <LearnMoreTippy
        heading="Auto-assign permissions"
        infoText="Upon user login, Devtron will check for Groups on SSO service provider associated with the user and assign them to Permission Groups with the same name in Devtron."
    />
)

export const PermissionGroupInfoBar = () => (
    <InfoBlock
        description={
            <>
                Users are auto-assigned a permission group upon SSO login. Ensure matching Permission Groups are created
                on Devtron and SSO service provider. <Tippy />
            </>
        }
    />
)

export const UserPermissionsInfoBar = () => (
    <InfoBlock
        description={
            <>
                User permissions are being managed via SSO service provider. Direct permissions cannot be assigned to
                users. <Tippy />
            </>
        }
    />
)
