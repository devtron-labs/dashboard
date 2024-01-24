import React, { FunctionComponent } from 'react'
import { ErrorScreenNotAuthorized } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '../../../components/common'
import { BuildInfraProps } from './types'
import ProfileForm from './ProfileForm'

const BuildInfraRouter = importComponentFromFELibrary('BuildInfraRouter')

export const BuildInfra: FunctionComponent<BuildInfraProps> = ({ isSuperAdmin }) => {
    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    if (BuildInfraRouter) {
        return <BuildInfraRouter />
    }

    return <ProfileForm />
}

export default BuildInfra
