import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Progressing, ErrorScreenManager, Reload, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import ClusterTerminal from '../../ClusterNodes/ClusterTerminal'
import { createGroupSelectList, filterImageList } from '../../common'
import { createTaintsList } from '../../cluster/cluster.util'
import { getClusterList, clusterNamespaceList } from '../../ClusterNodes/clusterNodes.service'
import { getHostURLConfiguration } from '../../../services/service'
import { AdminTerminalProps, URLParams } from '../Types'

const AdminTerminal: React.FC<AdminTerminalProps> = ({ isSuperAdmin, updateTerminalTabUrl }: AdminTerminalProps) => {
    const { clusterId } = useParams<URLParams>()

    const [loading, data, error] = useAsync(() =>
        Promise.all([getClusterList(), getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST'), clusterNamespaceList()]),
    )

    const [detailClusterList = null, hostUrlConfig = null, _namespaceList = null] = data || []

    const selectedDetailsCluster = useMemo(
        () => detailClusterList?.result.find((cluster) => cluster.id === +clusterId) || null,
        [detailClusterList, clusterId],
    )

    const imageList = useMemo(() => JSON.parse(hostUrlConfig?.result.value || null), [hostUrlConfig])

    const namespaceList = _namespaceList?.result[selectedDetailsCluster?.name] || null

    if (loading) {
        return (
            <div className="h-100 node-data-container bcn-0">
                <Progressing pageLoader size={32} />
            </div>
        )
    }

    if (error || !selectedDetailsCluster?.nodeCount || !namespaceList?.length) {
        console.log(selectedDetailsCluster?.nodeCount, namespaceList)
        /* NOTE: if nodeCount is 0 show Reload page or show Unauthorized if not SuperAdmin */
        /* NOTE: the above happens in case of bad cluster setup */
        const errCode = error?.code || 403
        return (
            <div className="bcn-0 node-data-container flex">
                {isSuperAdmin ? <Reload /> : <ErrorScreenManager code={errCode} />}
            </div>
        )
    }

    return (
        <ClusterTerminal
            clusterId={+clusterId}
            nodeGroups={createGroupSelectList(selectedDetailsCluster.nodeDetails, 'nodeName')}
            taints={createTaintsList(selectedDetailsCluster.nodeDetails, 'nodeName')}
            clusterImageList={filterImageList(imageList, selectedDetailsCluster.serverVersion)}
            namespaceList={namespaceList}
            updateTerminalTabUrl={updateTerminalTabUrl}
        />
    )
}

export default AdminTerminal
