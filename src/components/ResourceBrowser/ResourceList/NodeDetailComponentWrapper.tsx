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

import { useParams } from 'react-router-dom'

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
}: NodeDetailComponentWrapperProps) => {
    const { version, kind, group, name, namespace } = useParams<K8sResourceDetailURLParams>()

    const ID_PREFIX = `${group}-${version}-${namespace}`
    const id = getTabId(ID_PREFIX, name, kind)

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
