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

import NodeDetails from '@Components/ClusterNodes/NodeDetails'
import { ClusterListType } from '@Components/ClusterNodes/types'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'

import { K8S_EMPTY_GROUP } from '../Constants'
import { NodeDetailURLParams } from './types'

const NodeDetailWrapper = ({
    getTabId,
    updateTabUrl,
    lowercaseKindToResourceGroupMap,
}: Omit<ClusterListType, 'updateTabUrl'> & Pick<UseTabsReturnType, 'getTabId' | 'updateTabUrl'>) => {
    const { name } = useParams<NodeDetailURLParams>()

    const id = getTabId(K8S_EMPTY_GROUP, name, 'node')

    const updateTabUrlHandler: ClusterListType['updateTabUrl'] = (props) => updateTabUrl({ id, ...props })

    return (
        <NodeDetails
            updateTabUrl={updateTabUrlHandler}
            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
        />
    )
}

export default NodeDetailWrapper
