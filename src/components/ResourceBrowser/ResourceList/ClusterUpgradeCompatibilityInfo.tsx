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

import {
    CollapsibleList,
    ErrorScreenManager,
    GenericEmptyState,
    ImageType,
    Progressing,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as NoOffendingPipeline } from '@Images/no-offending-pipeline.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import { TARGET_K8S_VERSION_SEARCH_KEY } from '../Constants'
import { ClusterDetailBaseParams } from '../Types'
import { ClusterUpgradeCompatibilityInfoProps } from './types'

const useClusterUpgradeCompatibilityInfo = importComponentFromFELibrary(
    'useClusterUpgradeCompatibilityInfo',
    null,
    'function',
)

const ClusterUpgradeCompatibilityInfo = ({ updateTabUrl, clusterName }: ClusterUpgradeCompatibilityInfoProps) => {
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const targetK8sVersion = useSearchString().queryParams.get(TARGET_K8S_VERSION_SEARCH_KEY)

    const {
        isLoading,
        compatibilityInfoData,
        compatibilityError,
        refetchCompatibilityList,
        sidebarConfig,
        onCollapseBtnClick,
    } = useClusterUpgradeCompatibilityInfo({
        targetK8sVersion,
        clusterId,
        updateTabUrl,
    })

    if (isLoading) {
        return (
            <div className="flex column h-100">
                <Progressing size={32} styles={{ height: 'auto' }} />
                <div className="flex column">
                    <h2 className="fs-16 fw-6 lh-24 mt-20">Scanning resources</h2>
                    <p className="fs-13 fw-4 lh-20 w-300 text-center m-0">
                        Checking resources for upgrade compatibility with Kubernetes version v{targetK8sVersion}
                    </p>
                </div>
            </div>
        )
    }

    if (compatibilityError) {
        return (
            <ErrorScreenManager
                code={compatibilityError.code}
                reload={refetchCompatibilityList}
                redirectURL={URLS.RESOURCE_BROWSER}
            />
        )
    }

    if (!targetK8sVersion) {
        return <GenericEmptyState title="Target kubernetes version is not specified" />
    }

    if (!compatibilityInfoData?.length) {
        return (
            <GenericEmptyState
                imageType={ImageType.Large}
                SvgImage={NoOffendingPipeline}
                title={`Safe to upgrade ‘${clusterName}’ to ‘v${targetK8sVersion}’`}
                subTitle={`API versions of all resources in this cluster are compatible with Kubernetes v${targetK8sVersion}`}
            />
        )
    }

    return (
        <div className="flexbox h-100 dc__overflow-auto">
            <div className="dc__overflow-auto p-8 w-220 dc__no-shrink">
                <CollapsibleList tabType="navLink" config={sidebarConfig} onCollapseBtnClick={onCollapseBtnClick} />
            </div>
            {/* TODO: use table here */}
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfo
