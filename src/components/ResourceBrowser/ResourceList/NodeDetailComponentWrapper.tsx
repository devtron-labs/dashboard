import { useEffect } from 'react'
import { useParams, useRouteMatch } from 'react-router-dom'

import { noop } from '@devtron-labs/devtron-fe-common-lib/dist'

import { UpdateTabUrlParamsType } from '@Components/common/DynamicTabs/types'
import NodeDetailComponent from '@Components/v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'

import { K8sResourceDetailURLParams, NodeDetailComponentWrapperProps } from './types'

const NodeDetailComponentWrapper = ({
    getTabId,
    removeTabByIdentifier,
    logSearchTerms,
    loadingResources,
    setLogSearchTerms,
    lowercaseKindToResourceGroupMap,
    updateTabUrl,
    clusterName,
    markTabActiveById,
    addTab,
}: NodeDetailComponentWrapperProps) => {
    const { url } = useRouteMatch()
    const { version, kind, group, name, namespace } = useParams<K8sResourceDetailURLParams>()

    const ID_PREFIX = `${group}-${version}-${namespace}`
    const id = getTabId(ID_PREFIX, name, kind)

    useEffect(() => {
        markTabActiveById(id)
            .then((wasFound) => {
                if (!wasFound) {
                    addTab({
                        idPrefix: ID_PREFIX,
                        name,
                        kind,
                        url,
                    }).catch(noop)
                }
            })
            .catch(noop)
    }, [])

    const updateTabUrlHandler = ({ url: _url, dynamicTitle, retainSearchParams }: Omit<UpdateTabUrlParamsType, 'id'>) =>
        updateTabUrl({ id, url: _url, dynamicTitle, retainSearchParams })

    const removeTabByIdentifierHandler = () => removeTabByIdentifier(id)

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
            <NodeDetailComponent
                loadingResources={loadingResources}
                isResourceBrowserView
                lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                logSearchTerms={logSearchTerms}
                setLogSearchTerms={setLogSearchTerms}
                removeTabByIdentifier={removeTabByIdentifierHandler}
                updateTabUrl={updateTabUrlHandler}
                clusterName={clusterName}
            />
        </div>
    )
}

export default NodeDetailComponentWrapper
