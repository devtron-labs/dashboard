import { useParams } from 'react-router-dom'

import NodeDetails from '@Components/ClusterNodes/NodeDetails'
import { ClusterListType } from '@Components/ClusterNodes/types'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'

import { K8S_EMPTY_GROUP } from '../Constants'
import { NodeDetailURLParams } from './types'

const NodeDetailWrapper = ({
    addTab,
    getTabId,
    updateTabUrl,
    lowercaseKindToResourceGroupMap,
}: Omit<ClusterListType, 'updateTabUrl'> & Pick<UseTabsReturnType, 'addTab' | 'getTabId' | 'updateTabUrl'>) => {
    const { name } = useParams<NodeDetailURLParams>()

    const id = getTabId(K8S_EMPTY_GROUP, name, 'node')

    const updateTabUrlHandler: ClusterListType['updateTabUrl'] = (props) => updateTabUrl({ id, ...props })

    return (
        <NodeDetails
            updateTabUrl={updateTabUrlHandler}
            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
            addTab={addTab}
        />
    )
}

export default NodeDetailWrapper
