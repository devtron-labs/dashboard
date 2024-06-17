import React from 'react'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import AppDetailsComponent from '../../v2/appDetails/AppDetails.component'

const ExternalFluxAppDetails = () => {
    return <AppDetailsComponent _init={noop} isExternalApp={false} loadingDetails={false} loadingResourceTree={false} />
}

export default ExternalFluxAppDetails
