import React, { FunctionComponent } from 'react'
import {
    BUILD_INFRA_BREADCRUMB,
    BuildInfraDescriptor,
    BuildInfraFooter,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'
import './styles.scss'

export const BuildInfra: FunctionComponent = () => {
    const { breadcrumbs } = useBreadcrumb(BUILD_INFRA_BREADCRUMB)

    return (
        <div className="h-100 flexbox-col build-infra pl pr pt pb dc__content-space bcn-0">
            <div className="flexbox-col dc__gap-24 pt pr pb pl">
                <BuildInfraDescriptor breadCrumbs={breadcrumbs} />
            </div>

            <BuildInfraFooter disabled={false} />
        </div>
    )
}

export default BuildInfra
