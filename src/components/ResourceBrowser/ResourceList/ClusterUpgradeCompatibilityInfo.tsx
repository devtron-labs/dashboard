import {
    CollapsibleList,
    ErrorScreenManager,
    GenericEmptyState,
    ImageType,
    noop,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { StyledProgressBar } from '@Components/common/formFields/Widgets/Widgets'
import { ReactComponent as NoOffendingPipeline } from '@Images/no-offending-pipeline.svg'
import BaseResourceList from './BaseResourceList'
import { ALL_NAMESPACE_OPTION, SIDEBAR_KEYS, TARGET_K8S_VERSION_SEARCH_KEY } from '../Constants'
import { ClusterUpgradeCompatibilityInfoProps } from './types'

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
}: ClusterUpgradeCompatibilityInfoProps) => {
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
        updateTabUrl,
    })

    if (isLoading) {
        return (
            <div className="flex column h-100 dc__gap-20">
                <StyledProgressBar resetProgress={false} />
                <div className="flex column">
                    <h2 className="fs-16 fw-6 lh-24 mt-20 mb-8">Scanning resources</h2>
                    <p className="fs-13 fw-4 lh-20 w-300 text-center">
                        Checking resources for upgrade compatibility with Kubernetes version v{targetK8sVersion}
                    </p>
                </div>
            </div>
        )
    }

    if (compatibilityError) {
        return <ErrorScreenManager code={compatibilityError.code} reload={refetchCompatibilityList} />
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
            <div className="dc__overflow-scroll p-8">
                <CollapsibleList config={sidebarConfig} onCollapseBtnClick={onCollapseBtnClick} />
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
                selectedNamespace={ALL_NAMESPACE_OPTION}
                selectedCluster={selectedCluster}
                isOpen
                reloadResourceListData={refetchCompatibilityList}
                setSelectedNamespace={noop}
                renderRefreshBar={noop}
                updateK8sResourceTab={noop}
                nodeType={null}
                group={null}
                showGenericNullState
                addTab={addTab}
                hideDeleteResource
                hideBulkSelection
            />
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfo
