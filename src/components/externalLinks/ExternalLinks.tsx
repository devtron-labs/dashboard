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

import { useEffect, useMemo, useState } from 'react'
import {
    showError,
    ErrorScreenManager,
    InfoIconTippy,
    useMainContext,
    getClusterListMin,
    DeleteConfirmationModal,
    Progressing,
    SearchBar,
    useUrlFilters,
    FilterChips,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { sortOptionsByLabel, sortOptionsByValue } from '../common'
import { RoleBasedInfoNote, NoExternalLinksView } from './ExternalLinks.component'
import { deleteExternalLink, getAllApps, getExternalLinks } from './ExternalLinks.service'
import {
    ExternalLink,
    ExternalLinkIdentifierType,
    ExternalLinkMapListSortableKeys,
    ExternalLinkScopeType,
    ExternalLinksProps,
    ExternalListUrlFiltersType,
    IdentifierOptionType,
    OptionTypeWithIcon,
    parseSearchParams,
} from './ExternalLinks.type'

import { DOCUMENTATION, SERVER_MODE } from '../../config'
import AddExternalLink from './ExternalLinksCRUD/AddExternalLink'
import './styles.scss'
import { AddLinkButton } from './AddLinkButton'
import { ExternalLinkList } from './ExternalLinkList'
import { sortByUpdatedOn } from './ExternalLinks.utils'
import { ExternalLinkFilter } from './ExternalLinkFilter'

const ExternalLinks = ({ isAppConfigView, userRole }: ExternalLinksProps) => {
    const { appId } = useParams<{ appId: string }>()
    const [isLoading, setLoading] = useState(false)
    const [showAddLinkDialog, setShowAddLinkDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [monitoringTools, setMonitoringTools] = useState<OptionTypeWithIcon[]>([])
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([])
    const [clusterList, setClustersList] = useState<IdentifierOptionType[]>([])
    const [allApps, setAllApps] = useState<IdentifierOptionType[]>([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [selectedLink, setSelectedLink] = useState<ExternalLink>()
    const { serverMode } = useMainContext()
    const isFullMode = serverMode === SERVER_MODE.FULL

    const urlFilters = useUrlFilters<ExternalLinkMapListSortableKeys, ExternalListUrlFiltersType>({
        initialSortKey: ExternalLinkMapListSortableKeys.linkName,
        parseSearchParams,
    })

    const { searchKey, handleSearch, updateSearchParams, clusters, apps, clearFilters, sortOrder } = urlFilters

    const initExternalLinksData = () => {
        setLoading(true)
        const allPromises = [getClusterListMin()]

        if (isAppConfigView) {
            allPromises.push(getExternalLinks(0, appId, ExternalLinkIdentifierType.DevtronApp))
        } else {
            allPromises.push(getExternalLinks())

            if (isFullMode) {
                allPromises.push(getAllApps())
            }
        }

        Promise.all(allPromises)
            .then(([clustersResp, externalLinksRes, allAppsResp]) => {
                setExternalLinks(
                    (isAppConfigView
                        ? externalLinksRes.result?.ExternalLinks.filter(
                              (_link) => _link.isEditable && _link.type === ExternalLinkScopeType.AppLevel,
                          )
                        : externalLinksRes.result?.ExternalLinks
                    )?.sort(sortByUpdatedOn) || [],
                )
                setMonitoringTools(
                    externalLinksRes.result?.Tools?.map((tool) => ({
                        label: tool.name,
                        value: tool.id,
                        icon: tool.icon,
                        category: tool.category,
                    })).sort(sortOptionsByValue) || [],
                )
                setClustersList(
                    clustersResp.result
                        ?.map((cluster) => ({
                            label: cluster.cluster_name,
                            value: `${cluster.id}`,
                            type: ExternalLinkIdentifierType.Cluster,
                        }))
                        .sort(sortOptionsByLabel) || [],
                )

                if (!isAppConfigView && isFullMode) {
                    setAllApps(
                        allAppsResp.result
                            ?.map((_app) => ({
                                label: _app.appName,
                                value: `${_app.appId}|${_app.appName}|${_app.type}`,
                                type: _app.type as ExternalLinkIdentifierType,
                            }))
                            .sort(sortOptionsByLabel) || [],
                    )
                }
                setLoading(false)
            })
            .catch((e) => {
                showError(e, true, true)
                setErrorStatusCode(e.code)
                setLoading(false)
            })
    }

    useEffect(() => {
        initExternalLinksData()
    }, [])

    const handleAddLinkClick = (): void => {
        setShowAddLinkDialog(true)
        setSelectedLink(undefined)
    }

    const handleExternalLinksUsingSearch = (searchText: string): void => {
        handleSearch(searchText)
    }

    const renderFilters = (): JSX.Element => (
        <div className="flex dc__gap-8">
            <SearchBar
                initialSearchText={searchKey}
                containerClassName="w-250"
                handleEnter={handleExternalLinksUsingSearch}
                inputProps={{
                    placeholder: 'Search',
                    autoFocus: true,
                }}
                dataTestId="external-link-app-search"
            />
            {!isAppConfigView && (
                <ExternalLinkFilter
                    allApps={allApps}
                    updateSearchParams={updateSearchParams}
                    isFullMode={isFullMode}
                    clusterList={clusterList}
                    clusters={clusters}
                    apps={apps}
                />
            )}
        </div>
    )

    const filterConfig = {
        clusters,
        apps,
    }

    const filteredExternalLinks = useMemo(() => {
        const hasClusters = clusters.length > 0
        const hasApps = apps.length > 0
        const hasSearchKey = !!searchKey

        let filteredList = [...externalLinks]

        // If no filters are applied, return the full list
        if (!hasClusters && !hasApps && !hasSearchKey) {
            return filteredList.sort((a, b) => stringComparatorBySortOrder(a.name, b.name, sortOrder))
        }

        const parsedAppliedApps = new Set(
            apps.map((app) => {
                const [_appId, , type] = app.split('|')
                return `${_appId}|${type}`
            }),
        )

        filteredList = externalLinks.filter((link) => {
            let matchesCluster = false
            let matchesApp = false
            let matchesSearch = true // Default to true unless searchKey is provided

            // Cluster filtering
            if (hasClusters) {
                if (clusters.length === 1 && !clusters[0]) {
                    matchesCluster = true // If only an empty cluster is selected, show all links
                } else {
                    matchesCluster =
                        link.identifiers?.length === 0 || // No identifiers (global match)
                        link.identifiers.some(({ clusterId }) => clusters.includes(`${clusterId}`))
                }
            }

            // App filtering
            if (hasApps) {
                matchesApp =
                    link.identifiers?.length === 0 || // No identifiers (global match)
                    link.identifiers.some(({ appId, type }) => parsedAppliedApps.has(`${appId}|${type}`))
            }

            // Search Key filtering
            if (hasSearchKey) {
                matchesSearch = link.name.toLowerCase().includes(searchKey.toLowerCase())
            }

            // Apply OR logic (if any of the conditions match, return true)
            return (matchesCluster || matchesApp) && matchesSearch
        })
        return filteredList.sort((a, b) => stringComparatorBySortOrder(a.name, b.name, sortOrder))
    }, [externalLinks, filterConfig, searchKey, sortOrder])

    const getFormattedFilterValue = (filterKey: keyof ExternalListUrlFiltersType, filterValue: string) => {
        if (filterKey === 'apps') {
            const [, appName] = filterValue.split('|')
            return appName
        }
        if (filterKey === 'clusters') {
            const cluster = clusterList.find((_cluster) => _cluster.value === filterValue)
            return cluster?.label || ''
        }
        return ''
    }

    const renderExternalLinksView = (): JSX.Element => (
        <div
            className={`flexbox-col ${isAppConfigView ? 'dc__gap-16' : 'dc__gap-8'} external-links-wrapper pt-16 flex-grow-1 h-100`}
        >
            <div className="flex dc__content-space px-20">
                <h3 className="title flex left cn-9 fs-18 fw-6 lh-24 m-0" data-testid="external-links-heading">
                    External Links
                    <InfoIconTippy
                        heading="External Links"
                        infoText="Configure links to third-party applications (e.g. Kibana, New Relic) for quick access. Configured
                    links will be available in the App details page."
                        documentationLink={DOCUMENTATION.EXTERNAL_LINKS}
                        iconClassName="icon-dim-20 fcn-6 ml-8"
                    />
                </h3>
                <div className="cta-search-filter-container flex h-100">
                    {renderFilters()}
                    <div className="h-20 dc__border-right mr-8 ml-8" />
                    <AddLinkButton handleOnClick={handleAddLinkClick} />
                </div>
            </div>
            {isAppConfigView ? (
                <RoleBasedInfoNote userRole={userRole} listingView />
            ) : (
                <FilterChips<ExternalListUrlFiltersType>
                    filterConfig={filterConfig}
                    clearFilters={clearFilters}
                    className="px-20"
                    onRemoveFilter={updateSearchParams}
                    getFormattedValue={getFormattedFilterValue}
                />
            )}
            <ExternalLinkList
                filteredExternalLinks={filteredExternalLinks}
                isAppConfigView={isAppConfigView}
                setSelectedLink={setSelectedLink}
                setShowDeleteDialog={setShowDeleteDialog}
                setShowAddLinkDialog={setShowAddLinkDialog}
                monitoringTools={monitoringTools}
                isLoading={isLoading}
            />
        </div>
    )

    const handleDialogVisibility = () => {
        setShowAddLinkDialog(!showAddLinkDialog)
    }

    const renderExternalLinkListWrapper = () => {
        if (errorStatusCode > 0) {
            return (
                <div className="error-screen-wrapper flex column h-100">
                    <ErrorScreenManager code={errorStatusCode} />
                </div>
            )
        }
        if (!externalLinks || externalLinks.length === 0) {
            return (
                <NoExternalLinksView
                    isAppConfigView={isAppConfigView}
                    userRole={userRole}
                    handleAddLinkClick={handleAddLinkClick}
                />
            )
        }

        return renderExternalLinksView()
    }

    const hideDeleteConfirmationModal = () => setShowDeleteDialog(false)

    const onDelete = async (): Promise<void> => {
        await deleteExternalLink(selectedLink.id, isAppConfigView ? appId : '')
        if (isAppConfigView) {
            const { result } = await getExternalLinks(0, appId, ExternalLinkIdentifierType.DevtronApp)
            setExternalLinks(
                result?.ExternalLinks?.filter(
                    (_link) => _link.isEditable && _link.type === ExternalLinkScopeType.AppLevel,
                ).sort(sortByUpdatedOn) || [],
            )
        } else {
            const { result } = await getExternalLinks()
            setExternalLinks(result?.ExternalLinks?.sort(sortByUpdatedOn) || [])
        }
    }

    if (isLoading) {
        return <Progressing pageLoader />
    }

    return (
        <div className={`external-links-container bg__primary h-100 ${errorStatusCode > 0 ? 'error-view' : ''}`}>
            {renderExternalLinkListWrapper()}
            {showAddLinkDialog && (
                <AddExternalLink
                    appId={appId}
                    isFullMode={isFullMode}
                    isAppConfigView={isAppConfigView}
                    handleDialogVisibility={handleDialogVisibility}
                    selectedLink={selectedLink}
                    monitoringTools={monitoringTools}
                    allApps={
                        isFullMode
                            ? [
                                  {
                                      label: 'All applications',
                                      value: '*',
                                      type: ExternalLinkIdentifierType.AllApps,
                                  } as IdentifierOptionType,
                              ].concat(allApps)
                            : []
                    }
                    clusters={[
                        {
                            label: 'All clusters',
                            value: '*',
                            type: ExternalLinkIdentifierType.Cluster,
                        } as IdentifierOptionType,
                    ].concat(clusterList)}
                    setExternalLinks={setExternalLinks}
                />
            )}
            {selectedLink && showDeleteDialog && (
                <DeleteConfirmationModal
                    title={selectedLink?.name}
                    component={DeleteComponentsName.Link}
                    subtitle={
                        <>
                            <p className="m-0 ls-20 fs-13 cn-7">
                                &apos;{selectedLink?.name}&apos; links will no longer be shown in applications.
                            </p>
                            <p className="m-0 ls-20 fs-13 cn-7">Are you sure ?</p>
                        </>
                    }
                    onDelete={onDelete}
                    closeConfirmationModal={hideDeleteConfirmationModal}
                />
            )}
        </div>
    )
}

export default ExternalLinks
