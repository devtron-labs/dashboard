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

import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import DOMPurify from 'dompurify'

import {
    ALL_NAMESPACE_OPTION,
    ClipboardButton,
    CollapsibleList,
    ErrorScreenManager,
    FiltersTypeEnum,
    GenericEmptyState,
    GVKType,
    highlightSearchText,
    ImageType,
    K8sResourceDetailDataType,
    Nodes,
    noop,
    PaginationEnum,
    Progressing,
    SearchBar,
    Table,
    TableCellComponentProps,
    TableColumnType,
    TableSignalEnum,
    TableViewWrapperProps,
    Tooltip,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import emptyCustomChart from '@Images/empty-noresult@2x.png'
import { ReactComponent as NoOffendingPipeline } from '@Images/no-offending-pipeline.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { ShortcutKeyBadge } from '@Components/common/formFields/Widgets/Widgets'
import { URLS } from '@Config/routes'

import {
    DUMMY_RESOURCE_GVK_VERSION,
    K8S_EMPTY_GROUP,
    RESOURCE_ACTION_MENU,
    RESOURCE_BROWSER_ROUTES,
    SIDEBAR_KEYS,
    TARGET_K8S_VERSION_SEARCH_KEY,
    UPGRADE_CLUSTER_CONSTANTS,
} from '../Constants'
import { ClusterDetailBaseParams, K8SResourceListType } from '../Types'
import { renderResourceValue } from '../Utils'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { ClusterUpgradeCompatibilityInfoProps } from './types'
import { dynamicSort, getFirstResourceFromKindResourceMap, getUpgradeCompatibilityTippyConfig } from './utils'

const useClusterUpgradeCompatibilityInfo = importComponentFromFELibrary(
    'useClusterUpgradeCompatibilityInfo',
    null,
    'function',
)

interface ClusterUpgradeCompatibilityInfoTableWrapperProps extends TableViewWrapperProps<FiltersTypeEnum.URL> {}

const ClusterUpgradeCompatibilityInfoTableWrapper = ({
    searchKey,
    handleSearch,
    children,
}: ClusterUpgradeCompatibilityInfoTableWrapperProps) => {
    const [isInputFocused, setIsInputFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const handleInputBlur = () => setIsInputFocused(false)

    const handleInputFocus = () => setIsInputFocused(true)

    const handleFilterKeyUp = (e: React.KeyboardEvent): void => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            searchInputRef.current?.blur()
        }
    }

    const handleOnChangeSearchText: ComponentProps<typeof SearchBar>['handleSearchChange'] = (text) => {
        handleSearch(text)
        if (!text) {
            searchInputRef.current?.focus()
        }
    }

    const showShortcutKey = !isInputFocused && !searchKey

    const handleInputShortcut = () => {
        searchInputRef.current?.focus()
    }

    return (
        <div className="resource-list-container flexbox-col flex-grow-1 border__primary--left dc__overflow-hidden">
            <div className="resource-filter-options-container flexbox w-100 px-20 py-16 dc__content-start">
                <div className="resource-filter-options-container__search-box dc__position-rel">
                    <SearchBar
                        inputProps={{
                            placeholder: 'Search',
                            onBlur: handleInputBlur,
                            onFocus: handleInputFocus,
                            ref: searchInputRef,
                            onKeyUp: handleFilterKeyUp,
                        }}
                        handleSearchChange={handleOnChangeSearchText}
                        initialSearchText={searchKey}
                    />

                    {showShortcutKey && (
                        <ShortcutKeyBadge
                            shortcutKey="r"
                            rootClassName="resource-search-shortcut-key"
                            onClick={handleInputShortcut}
                        />
                    )}
                </div>
            </div>

            {children}
        </div>
    )
}

interface ClusterUpgradeCompatibilityInfoTableCellComponentProps
    extends TableCellComponentProps<FiltersTypeEnum.URL>,
        Pick<K8SResourceListType, 'lowercaseKindToResourceGroupMap'> {}

const ClusterUpgradeCompatibilityInfoTableCellComponent = ({
    field: columnName,
    row: { id, data: resourceData },
    filterData: { searchKey: searchText },
    signals,
    reloadResourceListData,
    lowercaseKindToResourceGroupMap,
}: ClusterUpgradeCompatibilityInfoTableCellComponentProps) => {
    const { push } = useHistory()
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const nameButtonRef = useRef<HTMLButtonElement>(null)
    const contextMenuRef = useRef<HTMLButtonElement>(null)

    const handleResourceClick = (e) => {
        const { name, namespace, kind, tab = RESOURCE_ACTION_MENU.manifest } = e.currentTarget.dataset

        const group =
            getFirstResourceFromKindResourceMap(lowercaseKindToResourceGroupMap, kind.toLowerCase())?.gvk?.Group ||
            K8S_EMPTY_GROUP

        const url = generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_DETAIL, {
            clusterId,
            namespace,
            name,
            kind: kind.toLowerCase(),
            group,
            version: DUMMY_RESOURCE_GVK_VERSION,
        })

        push(`${url}/${tab}`)
    }

    useEffect(() => {
        const openResourceCallback = ({ detail: { activeRowData } }) => {
            if (activeRowData.id === id) {
                nameButtonRef.current?.click()
            }
        }

        const openContextMenuCallback = ({ detail: { activeRowData } }) => {
            if (activeRowData.id === id) {
                contextMenuRef.current?.click()
            }
        }

        if (columnName === 'name') {
            signals.addEventListener(TableSignalEnum.ENTER_PRESSED, openResourceCallback)
            signals.addEventListener(TableSignalEnum.OPEN_CONTEXT_MENU, openContextMenuCallback)
        }

        return () => {
            if (columnName === 'name') {
                signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, openResourceCallback)
                signals.removeEventListener(TableSignalEnum.OPEN_CONTEXT_MENU, openContextMenuCallback)
            }
        }
    }, [])

    // This should be used only if shouldOverrideSelectedResourceKind is true
    // Group and version are not available for Events / shouldOverrideSelectedResourceKind is true
    const getSelectedResourceKindOverride = (lowercaseKind: string) => {
        const gvkFromRawData: GVKType = getFirstResourceFromKindResourceMap(
            lowercaseKindToResourceGroupMap,
            lowercaseKind,
        ).gvk

        return {
            gvk: {
                Group: gvkFromRawData.Group,
                Kind: gvkFromRawData.Kind,
                Version: gvkFromRawData.Version,
            },
        }
    }

    const selectedResource = {
        ...getSelectedResourceKindOverride((resourceData.kind as string).toLowerCase()),
        namespaced: !!resourceData.namespace,
    }
    const shouldHideContextMenu = selectedResource.gvk.Kind === Nodes.Event

    return columnName === 'name' ? (
        <div
            className="flexbox dc__align-items-center dc__gap-4 dc__content-space dc__visible-hover dc__visible-hover--parent py-10"
            data-testid="created-resource-name"
        >
            <div className="flex left dc__gap-4">
                <Tooltip content={resourceData.name}>
                    <button
                        type="button"
                        className="dc__unset-button-styles dc__align-left dc__truncate"
                        data-name={resourceData.name}
                        data-namespace={resourceData.namespace || ALL_NAMESPACE_OPTION.value}
                        data-kind={resourceData.kind}
                        onClick={!shouldHideContextMenu ? handleResourceClick : noop}
                        aria-label={`Select ${resourceData.name}`}
                        ref={nameButtonRef}
                    >
                        <span
                            className={!shouldHideContextMenu ? 'dc__link cursor' : ''}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                    highlightSearchText({
                                        searchText,
                                        text: String(resourceData.name),
                                        highlightClasses: 'p-0 fw-6 bcy-2',
                                    }),
                                ),
                            }}
                        />
                    </button>
                </Tooltip>
                {!shouldHideContextMenu && (
                    <ClipboardButton content={String(resourceData.name)} rootClassName="p-4 dc__visible-hover--child" />
                )}
            </div>

            {!shouldHideContextMenu && (
                <ResourceBrowserActionMenu
                    ref={contextMenuRef}
                    clusterId={clusterId}
                    resourceData={resourceData as K8sResourceDetailDataType}
                    getResourceListData={reloadResourceListData as () => Promise<void>}
                    selectedResource={{
                        ...getSelectedResourceKindOverride((resourceData.kind as string).toLowerCase()),
                        namespaced: !!resourceData.namespace,
                    }}
                    hideDeleteResource
                    handleResourceClick={handleResourceClick}
                    handleClearBulkSelection={noop}
                />
            )}
        </div>
    ) : (
        <div className="flexbox dc__align-items-center py-10">
            <Tooltip content={renderResourceValue(resourceData[columnName]?.toString())}>
                <span
                    className="dc__truncate fs-12 lh-20"
                    data-testid={`${columnName}-count`}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                            highlightSearchText({
                                searchText,
                                text: renderResourceValue(resourceData[columnName]?.toString()),
                                highlightClasses: 'p-0 fw-6 bcy-2',
                            }),
                        ),
                    }}
                />
            </Tooltip>
        </div>
    )
}

const ClusterUpgradeCompatibilityInfo = ({
    updateTabUrl,
    clusterName,
    markTabActiveById,
    addTab,
    getTabId,
    lowercaseKindToResourceGroupMap,
}: ClusterUpgradeCompatibilityInfoProps) => {
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const targetK8sVersion = useSearchString().queryParams.get(TARGET_K8S_VERSION_SEARCH_KEY)

    const { url } = useRouteMatch()

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

    useEffect(() => {
        const upgradeClusterLowerCaseKind = SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase()

        markTabActiveById(
            getTabId(UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX, UPGRADE_CLUSTER_CONSTANTS.NAME, upgradeClusterLowerCaseKind),
        )
            .then((found) => {
                if (!found) {
                    addTab({
                        idPrefix: UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
                        kind: upgradeClusterLowerCaseKind,
                        name: UPGRADE_CLUSTER_CONSTANTS.NAME,
                        url,
                        dynamicTitle: `${UPGRADE_CLUSTER_CONSTANTS.DYNAMIC_TITLE} to v${targetK8sVersion}`,
                        tippyConfig: getUpgradeCompatibilityTippyConfig({
                            targetK8sVersion,
                        }),
                    }).catch(noop)
                }
            })
            .catch(noop)
    }, [])

    const { columns, rows } = useMemo(
        () => ({
            columns: resourceListForCurrentData.headers.map(
                (header: string) =>
                    ({
                        field: header,
                        label: header,
                        size: {
                            range: {
                                maxWidth: 600,
                                minWidth: header === 'name' ? 200 : 180,
                                startWidth: header === 'name' ? 300 : 200,
                            },
                        },
                        comparator: dynamicSort(header),
                        isSortable: true,
                        CellComponent: ClusterUpgradeCompatibilityInfoTableCellComponent,
                    }) as TableColumnType,
            ),
            rows: resourceListForCurrentData.data.map((row: Record<string, string | number | object>) => ({
                data: row,
                id: JSON.stringify(row),
            })),
        }),
        [resourceListForCurrentData],
    )

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
        <div className="flexbox h-100 dc__overflow-hidden">
            <div className="dc__overflow-auto p-8 w-220 dc__no-shrink">
                <CollapsibleList tabType="navLink" config={sidebarConfig} onCollapseBtnClick={onCollapseBtnClick} />
            </div>

            <Table
                columns={columns}
                rows={rows}
                emptyStateConfig={{
                    noRowsConfig: {
                        image: emptyCustomChart,
                        title: 'No resources found',
                        subTitle: `No resources found in this cluster for upgrade compatibility check`,
                    },
                }}
                filtersVariant={FiltersTypeEnum.URL}
                id="table__cluster-upgrade-compatibility-info"
                paginationVariant={PaginationEnum.PAGINATED}
                ViewWrapper={ClusterUpgradeCompatibilityInfoTableWrapper}
                additionalProps={{
                    lowercaseKindToResourceGroupMap,
                }}
            />
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfo
