import { ErrorScreenNotAuthorized } from '@devtron-labs/devtron-fe-common-lib'
import React, { FunctionComponent } from 'react'
import { DeploymentWindowType } from './types'
import ProfileForm from '../BuildInfra/ProfileForm'
import { importComponentFromFELibrary } from '../../../components/common'

const DeploymentWindowRouterComponent = importComponentFromFELibrary('DeploymentWindowRouterComponent')

const DeploymentWindow: FunctionComponent<DeploymentWindowType> = ({ isSuperAdmin }) => {
    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    if (DeploymentWindowRouterComponent) {
        return <DeploymentWindowRouterComponent />
    }

    return <ProfileForm />
}

export default DeploymentWindow
