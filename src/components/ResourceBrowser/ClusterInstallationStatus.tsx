/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { InfrastructureManagementIcon, useAsync, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'

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
                    component: <InfrastructureManagementIcon />,
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
