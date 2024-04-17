import { ErrorScreenNotAuthorized } from '@devtron-labs/devtron-fe-common-lib'
import React, { FunctionComponent } from 'react'
import { DeploymentWindowType } from './types'
import ProfileForm from '../BuildInfra/ProfileForm'
import DeploymentWindowRouter from './DeploymentWindowRouter'

const DeploymentWindow: FunctionComponent<DeploymentWindowType> = ({ isSuperAdmin }) => {
    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    if (DeploymentWindowRouter) {
        return <DeploymentWindowRouter />
    }

    return <ProfileForm />
}

export default DeploymentWindow
