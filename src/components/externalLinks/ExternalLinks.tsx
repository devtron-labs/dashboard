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

import { useEffect, useState } from 'react'
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
} from '@devtron-labs/devtron-fe-common-lib'
import { useLocation, useParams } from 'react-router-dom'
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
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const [isLoading, setLoading] = useState(false)
    const [showAddLinkDialog, setShowAddLinkDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [monitoringTools, setMonitoringTools] = useState<OptionTypeWithIcon[]>([])
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([])
    const [clusterList, setClustersList] = useState<IdentifierOptionType[]>([])
    const [allApps, setAllApps] = useState<IdentifierOptionType[]>([])
    const [filteredExternalLinks, setFilteredExternalLinks] = useState<ExternalLink[]>([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [selectedLink, setSelectedLink] = useState<ExternalLink>()
    const { serverMode } = useMainContext()
    const isFullMode = serverMode === SERVER_MODE.FULL

    const urlFilters = useUrlFilters<ExternalLinkMapListSortableKeys, ExternalListUrlFiltersType>({
        initialSortKey: ExternalLinkMapListSortableKeys.linkName,
        parseSearchParams,
    })

    const { searchKey, handleSearch, updateSearchParams, clusters, apps, clearFilters } = urlFilters

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

    const filterByClusterIds = (_appliedClusterIds: string[], defaultToAll: boolean): ExternalLink[] => {
        /**
         * 1. If appliedClusterIds are not present then return empty array
         * 2. If appliedClusterIds are present but doesn't have any value then
         * - if defaultToAll is true then return all externalLinks as default
         * - else return empty array as there'll be further filtering based on appliedAppIds
         * 3. If appliedClusterIds are present and has value then filter & return filtered external links
         */
        if (_appliedClusterIds) {
            if (_appliedClusterIds.length === 1 && !_appliedClusterIds[0]) {
                return defaultToAll ? externalLinks : []
            }
            if (_appliedClusterIds.length > 0) {
                return externalLinks.filter(
                    (link) =>
                        link.identifiers.length === 0 ||
                        link.identifiers.some((_identifier) => _appliedClusterIds.includes(`${_identifier.clusterId}`)),
                )
            }
        }

        return []
    }

    const filterByAppIds = (_appliedAppIds: string[], filteredByClusterIds: ExternalLink[]): ExternalLink[] => {
        /**
         * 1. If appliedAppIds are not present then return empty array
         * 2. If appliedAppIds are present but doesn't have any value then
         * - return empty array if filteredByClusterIds contains any link as it'll be the same
         * - else return all externalLinks as default
         * 3. If appliedAppIds are present and have value then
         * - filter external links & assign to filteredByAppIds
         * - if filteredByClusterIds contains any link, remove duplicates from filteredByAppIds & return
         * - else return filteredByAppIds
         */
        if (_appliedAppIds) {
            if (_appliedAppIds.length === 1 && !_appliedAppIds[0]) {
                // If contains any link then return empty as it'll be the same array
                // Else return all external links as default
                return filteredByClusterIds.length > 0 ? [] : externalLinks
            }
            if (_appliedAppIds.length > 0) {
                const filteredByAppIds = externalLinks.filter(
                    (link) =>
                        link.identifiers.length === 0 ||
                        link.identifiers.some((_identifier) =>
                            _appliedAppIds.includes(
                                `${_identifier.identifier}_${
                                    _identifier.type === ExternalLinkIdentifierType.DevtronApp ? 'd' : 'h'
                                }`,
                            ),
                        ),
                )

                // Filter out duplicates from filteredByAppIds if filteredByClusterIds contains any link & return
                // Else return filteredByAppIds
                if (filteredByClusterIds.length > 0) {
                    const filteredIds = filteredByClusterIds.map((_link) => _link.id)
                    return filteredByAppIds.filter((_link) => !filteredIds.includes(_link.id))
                }

                return filteredByAppIds
            }
        }

        return []
    }

    const filterBySearchTerm = (_externalLinks: ExternalLink[]): ExternalLink[] => {
        const _searchTerm = queryParams.get('searchKey').trim().toLowerCase()

        /**
         * 1. If search query param is present and has value then filter & return filtered external links
         * 2. Else return passed _externalLinks
         */
        if (_searchTerm) {
            return _externalLinks.filter(
                (link: ExternalLink) =>
                    link.name.toLowerCase().includes(_searchTerm) ||
                    monitoringTools
                        .find((tool) => tool.value === link.monitoringToolId)
                        ?.label.toLowerCase()
                        .includes(_searchTerm),
            )
        }

        return _externalLinks
    }

    useEffect(() => {
        if (externalLinks.length > 0) {
            /**
             * 1. If both clusters & search query params are present then filter by both and set filtered external links
             * 2. If only clusters query param is present then filter by cluster ids & set filtered external links
             * 3. If only search query param is present then filter by searched term & set filtered external links
             * 4. Else set default external links
             */

            if (queryParams.has('clusters') || queryParams.has('apps')) {
                const _appliedClusterIds = queryParams.get('clusters')?.split(',')
                const _appliedAppIds = queryParams.get('apps')?.split(',')

                // #1 - Filter the links by applied clusterIds
                const filteredByClusterIds = filterByClusterIds(_appliedClusterIds, !_appliedAppIds?.length)
                const filteredByAppIds = filterByAppIds(_appliedAppIds, filteredByClusterIds)
                let _filteredExternalLinks = [...filteredByClusterIds, ...filteredByAppIds]

                // #2 - Check if we have any external links filtered by applied clusterIds
                if (queryParams.has('searchKey') && _filteredExternalLinks.length > 0) {
                    // #3 - If yes then filter the filtered external links further by searched term
                    _filteredExternalLinks = filterBySearchTerm(_filteredExternalLinks)
                }

                // #4 - Set filtered external links
                setFilteredExternalLinks(_filteredExternalLinks)
            } else if (queryParams.has('searchKey')) {
                setFilteredExternalLinks(filterBySearchTerm(externalLinks))
            } else {
                setFilteredExternalLinks(externalLinks)
            }
        }
    }, [location.search, externalLinks])

    const handleAddLinkClick = (): void => {
        setShowAddLinkDialog(true)
        setSelectedLink(undefined)
    }
    const filteredLinksLen = filteredExternalLinks.length

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

    const clusterMap = clusterList.reduce((acc, cluster) => {
        acc[cluster.value] = cluster.label
        return acc
    }, {})

    const clusterFilterChip = clusters.map((cluster) => clusterMap[cluster])

    const appMap = allApps.reduce((acc, app) => {
        acc[app.value] = app.label
        return acc
    }, {})

    const appFilterChip = apps.map((app) => appMap[app])

    const filterConfig = {
        clusters: clusterFilterChip,
        apps: appFilterChip,
    }

    const renderExternalLinksView = (): JSX.Element => (
        <div className="flexbox-col dc__gap-8 external-links-wrapper pt-16 flex-grow-1">
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
                <div className="cta-search-filter-container flex">
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
                />
            )}
            <ExternalLinkList
                filteredLinksLen={filteredLinksLen}
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
