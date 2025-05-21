import { useEffect } from 'react'
import { useParams, useRouteMatch } from 'react-router-dom'

import { noop } from '@devtron-labs/devtron-fe-common-lib'

import NodeDetails from '@Components/ClusterNodes/NodeDetails'
import { ClusterListType } from '@Components/ClusterNodes/types'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'

import { K8S_EMPTY_GROUP } from '../Constants'
import { NodeDetailURLParams } from './types'

const NodeDetailWrapper = ({
    addTab,
    markTabActiveById,
    getTabId,
    updateTabUrl,
    lowercaseKindToResourceGroupMap,
}: Omit<ClusterListType, 'updateTabUrl'> &
    Pick<UseTabsReturnType, 'addTab' | 'markTabActiveById' | 'getTabId' | 'updateTabUrl'>) => {
    const { url } = useRouteMatch()
    const { name } = useParams<NodeDetailURLParams>()

    const id = getTabId(K8S_EMPTY_GROUP, name, 'node')

    const updateTabUrlHandler: ClusterListType['updateTabUrl'] = (props) => updateTabUrl({ id, ...props })

    useEffect(() => {
        // NOTE: when the component mounts, we select the tab as active
        // If the tab is not found, we add a new tab
        markTabActiveById(id)
            .then((wasFound) => {
                if (!wasFound) {
                    addTab({
                        idPrefix: K8S_EMPTY_GROUP,
                        kind: 'node',
                        name,
                        url,
                    }).catch(noop)
                }
            })
            .catch(noop)
    }, [])

    return (
        <NodeDetails
            updateTabUrl={updateTabUrlHandler}
            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
            addTab={addTab}
        />
    )
}

export default NodeDetailWrapper
