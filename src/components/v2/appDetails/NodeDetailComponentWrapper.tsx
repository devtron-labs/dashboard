import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import { UpdateTabUrlParamsType } from '@Components/common/DynamicTabs/types'
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component'
import { ParamsType } from './k8Resource/nodeDetail/nodeDetail.type'
import { NodeDetailComponentWrapperProps } from './appDetails.type'
import { AppDetailsTabs } from './appDetails.store'

const NodeDetailComponentWrapper = ({
    markTabActiveById,
    addTab,
    getTabId,
    nodeDetailComponentProps,
    updateTabUrl,
}: NodeDetailComponentWrapperProps) => {
    const { podName, nodeType } = useParams<ParamsType>()
    const location = useLocation()
    const tabId = getTabId(AppDetailsTabs.k8s_Resources, podName.toLowerCase(), nodeType.toLowerCase())

    const handleUpdateTabUrl = (props: Omit<UpdateTabUrlParamsType, 'id'>) => {
        updateTabUrl({
            id: tabId,
            ...props,
        })
    }

    useEffect(() => {
        markTabActiveById(tabId)
            .then((isFound) => {
                if (!isFound) {
                    const newUrl = `${location.pathname}?${location.search}`

                    addTab({
                        idPrefix: AppDetailsTabs.k8s_Resources,
                        kind: nodeType.toLowerCase(),
                        name: podName.toLowerCase(),
                        url: newUrl,
                    })
                        .then(noop)
                        .catch(noop)
                }
            })
            .catch(noop)
    }, [podName, nodeType, tabId])

    return <NodeDetailComponent key={tabId} {...nodeDetailComponentProps} updateTabUrl={handleUpdateTabUrl} />
}

export default NodeDetailComponentWrapper
