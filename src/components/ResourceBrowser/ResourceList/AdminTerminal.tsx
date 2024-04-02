import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Progressing, ErrorScreenManager, Reload, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import ClusterTerminal from '../../ClusterNodes/ClusterTerminal'
import { createGroupSelectList, filterImageList } from '../../common'
import { createTaintsList } from '../../cluster/cluster.util'
import { getClusterList, clusterNamespaceList } from '../../ClusterNodes/clusterNodes.service'
import { getHostURLConfiguration } from '../../../services/service'
import { AdminTerminalProps } from '../Types'

const AdminTerminal: React.FC<AdminTerminalProps> = ({ isSuperAdmin, updateTerminalTabUrl }: AdminTerminalProps) => {
    /* TODO: create a proper type and reuse everywhere or use ParamsType from NodeDetail.component */
    const { clusterId } = useParams<{ [key: string]: string }>()

    const [loading, data, error] = useAsync(() =>
        Promise.all([getClusterList(), getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST'), clusterNamespaceList()]),
    )

    const [detailClusterList = null, hostUrlConfig = null, _namespaceList = null] = data || []

    const selectedDetailsCluster = useMemo(
        () => detailClusterList?.result.find((cluster) => cluster.id === +clusterId) || null,
        [detailClusterList, clusterId],
    )

    const imageList = useMemo(() => JSON.parse(hostUrlConfig?.result.value || null), [hostUrlConfig])

    const namespaceList = _namespaceList?.result || null

    if (loading) {
        return (
            <div className="h-100 node-data-container bcn-0">
                <Progressing pageLoader />
            </div>
        )
    }

    if (error) {
        const errCode = error?.errors[0]?.['code'] || error?.['code']
        return (
            <div className="bcn-0 node-data-container flex">
                {/* FIXME: is this reload appropiate? */}
                {isSuperAdmin ? <Reload /> : <ErrorScreenManager code={errCode} />}
            </div>
        )
    }

    return (
        <ClusterTerminal
            showTerminal
            clusterId={+clusterId}
            nodeGroups={createGroupSelectList(selectedDetailsCluster.nodeDetails, 'nodeName')}
            taints={createTaintsList(selectedDetailsCluster.nodeDetails, 'nodeName')}
            clusterImageList={filterImageList(imageList, selectedDetailsCluster.serverVersion)}
            namespaceList={namespaceList[selectedDetailsCluster.name]}
            updateTerminalTabUrl={updateTerminalTabUrl}
            isNodeDetailsPage
        />
    )
}

export default AdminTerminal
