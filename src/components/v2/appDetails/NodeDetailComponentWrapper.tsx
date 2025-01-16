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
    const params = useParams<ParamsType>()
    const location = useLocation()

    const handleUpdateTabUrl = (props: Omit<UpdateTabUrlParamsType, 'id'>) => {
        updateTabUrl({
            id: getTabId(AppDetailsTabs.k8s_Resources, params.podName.toLowerCase(), params.nodeType.toLowerCase()),
            ...props,
        })
    }

    useEffect(() => {
        markTabActiveById(
            getTabId(AppDetailsTabs.k8s_Resources, params.podName.toLowerCase(), params.nodeType.toLowerCase()),
        )
            .then((isFound) => {
                if (!isFound) {
                    const newUrl = `${location.pathname}?${location.search}`

                    addTab({
                        idPrefix: AppDetailsTabs.k8s_Resources,
                        kind: params.nodeType.toLowerCase(),
                        name: params.podName.toLowerCase(),
                        url: newUrl,
                    })
                        .then(noop)
                        .catch(noop)
                }
            })
            .catch(noop)
    }, [params.podName, params.nodeType])

    return <NodeDetailComponent {...nodeDetailComponentProps} updateTabUrl={handleUpdateTabUrl} />
}

export default NodeDetailComponentWrapper
