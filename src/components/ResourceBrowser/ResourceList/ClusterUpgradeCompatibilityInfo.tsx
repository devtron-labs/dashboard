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

import {
    CollapsibleList,
    ErrorScreenManager,
    GenericEmptyState,
    ImageType,
    noop,
    Progressing,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as NoOffendingPipeline } from '@Images/no-offending-pipeline.svg'
import { URLS } from '@Config/routes'
import { useEffect } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { UpdateTabUrlParamsType } from '@Components/common/DynamicTabs/types'
import BaseResourceList from './BaseResourceList'
import { SIDEBAR_KEYS, TARGET_K8S_VERSION_SEARCH_KEY, UPGRADE_CLUSTER_CONSTANTS } from '../Constants'
import { ClusterUpgradeCompatibilityInfoProps } from './types'
import { getUpgradeCompatibilityTippyConfig } from './utils'

const useClusterUpgradeCompatibilityInfo = importComponentFromFELibrary(
    'useClusterUpgradeCompatibilityInfo',
    null,
    'function',
)

const ClusterUpgradeCompatibilityInfo = ({
    clusterId,
    clusterName,
    selectedCluster,
    updateTabUrl,
    addTab,
    lowercaseKindToResourceGroupMap,
    handleResourceClick,
    markTabActiveById,
    getTabId,
}: ClusterUpgradeCompatibilityInfoProps) => {
    const targetK8sVersion = useSearchString().queryParams.get(TARGET_K8S_VERSION_SEARCH_KEY)
    const { url } = useRouteMatch()

    const tabId = getTabId(
        UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
        UPGRADE_CLUSTER_CONSTANTS.NAME,
        SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
    )

    const {
        isLoading,
        compatibilityInfoData,
        compatibilityError,
        refetchCompatibilityList,
        resourceListForCurrentData,
        sidebarConfig,
        onCollapseBtnClick,
    } = useClusterUpgradeCompatibilityInfo({
        targetK8sVersion,
        clusterId,
        updateTabUrl: (props: UpdateTabUrlParamsType) => {
            updateTabUrl({
                id: tabId,
                ...props,
            })
        },
    })

    useEffect(() => {
        markTabActiveById(tabId)
            .then((isTabFound) => {
                if (!isTabFound) {
                    addTab({
                        idPrefix: UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
                        name: UPGRADE_CLUSTER_CONSTANTS.NAME,
                        url,
                        kind: SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
                        dynamicTitle: `${UPGRADE_CLUSTER_CONSTANTS.DYNAMIC_TITLE} to v${targetK8sVersion}`,
                        tippyConfig: getUpgradeCompatibilityTippyConfig({
                            targetK8sVersion,
                        }),
                    }).catch(noop)
                }
            })
            .catch(noop)
    }, [])

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
        <div className="resource-browser">
            <div className="dc__overflow-auto p-8">
                <CollapsibleList tabType="navLink" config={sidebarConfig} onCollapseBtnClick={onCollapseBtnClick} />
            </div>
            <BaseResourceList
                searchPlaceholder="Search"
                areFiltersHidden
                isLoading={false}
                resourceListError={null}
                resourceList={resourceListForCurrentData}
                clusterId={clusterId}
                clusterName={clusterName}
                showStaleDataWarning={false}
                selectedResource={{
                    gvk: SIDEBAR_KEYS.upgradeClusterGVK,
                    namespaced: false,
                }}
                selectedCluster={selectedCluster}
                reloadResourceListData={refetchCompatibilityList}
                renderRefreshBar={noop}
                setWidgetEventDetails={noop}
                nodeType={null}
                group={null}
                showGenericNullState
                addTab={addTab}
                hideDeleteResource
                hideBulkSelection
                shouldOverrideSelectedResourceKind
                lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                handleResourceClick={handleResourceClick}
            />
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfo
