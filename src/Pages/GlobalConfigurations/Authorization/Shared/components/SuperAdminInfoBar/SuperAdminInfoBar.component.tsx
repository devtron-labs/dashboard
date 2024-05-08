import React from 'react'
import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as InfoIcon } from '../../../../../../assets/icons/ic-info-filled.svg'

const SuperAdminInfoBar = () => (
    <InfoColourBar
        message="Super admins can perform all actions across the Devtron dashboard. Super admins can add more super admins."
        classname="info_bar"
        Icon={InfoIcon}
    />
)

export default SuperAdminInfoBar
