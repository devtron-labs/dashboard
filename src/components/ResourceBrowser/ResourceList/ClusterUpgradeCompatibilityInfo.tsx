import {
    CollapsibleList,
    ErrorScreenManager,
    GenericEmptyState,
    noop,
    Progressing,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import BaseResourceList from './BaseResourceList'
import { ALL_NAMESPACE_OPTION, SIDEBAR_KEYS, TARGET_K8S_VERSION_SEARCH_KEY } from '../Constants'
import { ClusterOptionType } from '../Types'

const useClusterUpgradeCompatibilityInfo = importComponentFromFELibrary(
    'useClusterUpgradeCompatibilityInfo',
    null,
    'function',
)

const ClusterUpgradeCompatibilityInfo = ({
    clusterId,
    selectedCluster,
}: {
    clusterId: string
    selectedCluster: ClusterOptionType
}) => {
    const targetK8sVersion = useSearchString().queryParams.get(TARGET_K8S_VERSION_SEARCH_KEY)

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
    })

    if (isLoading) {
        return <Progressing pageLoader />
    }

    if (compatibilityError) {
        return <ErrorScreenManager code={compatibilityError.code} reload={refetchCompatibilityList} />
    }

    if (!targetK8sVersion) {
        return <GenericEmptyState title="Target kubernetes version is not specified" />
    }

    if (compatibilityInfoData.length === 0) {
        return <GenericEmptyState title="Upgrade information in unavailable at the moment" />
    }

    return (
        <div className="resource-browser">
            <div className="dc__overflow-scroll">
                <CollapsibleList config={sidebarConfig} onCollapseBtnClick={onCollapseBtnClick} />
            </div>
            <BaseResourceList
                searchPlaceholder="Search"
                areFiltersHidden
                isLoading={false}
                resourceListError={null}
                resourceList={resourceListForCurrentData}
                clusterId={clusterId}
                showStaleDataWarning={false}
                selectedResource={{
                    gvk: SIDEBAR_KEYS.upgradeClusterGVK,
                }}
                selectedNamespace={ALL_NAMESPACE_OPTION}
                selectedCluster={selectedCluster}
                isOpen
                reloadResourceListData={refetchCompatibilityList}
                handleResourceClick={noop}
                handleNodeClick={noop}
                setSelectedNamespace={noop}
                renderRefreshBar={noop}
                updateK8sResourceTab={noop}
                nodeType={null}
                group={null}
            />
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfo
