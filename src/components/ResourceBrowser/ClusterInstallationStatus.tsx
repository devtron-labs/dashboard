import { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { useAsync, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import ClusterSelector from './ResourceList/ClusterSelector'
import ResourcePageHeader from './ResourceList/ResourcePageHeader'
import { getClusterOptions } from './ResourceList/utils'
import { getClusterListing } from './ResourceBrowser.service'
import { ClusterOptionType } from './Types'
import { getClusterChangeRedirectionUrl } from './Utils'

const ClusterInstallationStatusDialog = importComponentFromFELibrary(
    'ClusterInstallationStatusDialog',
    null,
    'function',
)

const ClusterInstallationStatus = () => {
    const { replace } = useHistory()
    const { installationId } = useParams<{ installationId: string }>()

    const [isClusterListLoading, clusterList] = useAsync(() => getClusterListing(true))

    const clusterOptions = useMemo(() => getClusterOptions(clusterList), [clusterList, installationId])

    const onClusterChange = ({
        value,
        installationId: clusterInstallationId,
        isClusterInCreationPhase,
    }: ClusterOptionType) => {
        const path = getClusterChangeRedirectionUrl(
            isClusterInCreationPhase,
            isClusterInCreationPhase ? String(clusterInstallationId) : value,
        )

        replace({
            pathname: path,
        })
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'resource-browser': {
                    component: <span className="cb-5 fs-16 dc__capitalize">Resource Browser</span>,
                    linked: true,
                },
                'installation-cluster': {
                    component: (
                        <ClusterSelector
                            onChange={onClusterChange}
                            clusterList={clusterOptions}
                            clusterId={installationId}
                            isInstallationStatusView
                            isClusterListLoading={isClusterListLoading}
                        />
                    ),
                },
                ':installationId': {
                    component: null,
                },
            },
        },
        [clusterOptions, installationId],
    )

    return (
        <div className="flexbox-col flex-grow-1">
            <ResourcePageHeader breadcrumbs={breadcrumbs} />
            <div className="flex flex-grow-1">
                <ClusterInstallationStatusDialog key={installationId} installationId={installationId} />
            </div>
        </div>
    )
}

export default ClusterInstallationStatus
