import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component'
import { ParamsType } from './k8Resource/nodeDetail/nodeDetail.type'
import { NodeDetailComponentWrapperProps } from './appDetails.type'
import { AppDetailsTabs } from './appDetails.store'

const NodeDetailComponentWrapper = ({
    markTabActiveById,
    addTab,
    getTabId,
    nodeDetailComponentProps,
}: NodeDetailComponentWrapperProps) => {
    const params = useParams<ParamsType>()
    const location = useLocation()

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
    }, [])

    return <NodeDetailComponent {...nodeDetailComponentProps} />
}

export default NodeDetailComponentWrapper
