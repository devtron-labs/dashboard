import { useHistory, useParams } from 'react-router-dom'
import { useAsync, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { useMemo } from 'react'
import ResourcePageHeader from './ResourceList/ResourcePageHeader'
import ClusterSelector from './ResourceList/ClusterSelector'
import { getClusterListing } from './ResourceBrowser.service'
import { getClusterOptions } from './ResourceList/utils'
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

    const [, clusterList] = useAsync(() => getClusterListing(true))

    const clusterOptions = useMemo(() => getClusterOptions(clusterList), [clusterList, installationId])

    const onClusterChange = ({ value, isInstallationCluster }: ClusterOptionType) => {
        const path = getClusterChangeRedirectionUrl(isInstallationCluster, value)

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
