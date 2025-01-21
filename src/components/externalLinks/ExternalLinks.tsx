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

import { Fragment, useEffect, useState } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    InfoIconTippy,
    useMainContext,
    getClusterListMin,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { sortOptionsByLabel, sortOptionsByValue } from '../common'
import { AddLinkButton, NoExternalLinksView, NoMatchingResults, RoleBasedInfoNote } from './ExternalLinks.component'
import { getAllApps, getExternalLinks } from './ExternalLinks.service'
import {
    ExternalLink,
    ExternalLinkIdentifierType,
    ExternalLinkScopeType,
    ExternalLinksProps,
    IdentifierOptionType,
    OptionTypeWithIcon,
} from './ExternalLinks.type'
import { ReactComponent as EditIcon } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/ic-delete-interactive.svg'
import { getMonitoringToolIcon, onImageLoadError, sortByUpdatedOn } from './ExternalLinks.utils'
import { DOCUMENTATION, SERVER_MODE } from '../../config'
import { ApplicationFilter, AppliedFilterChips, ClusterFilter, SearchInput } from './ExternalLinksFilters'
import AddExternalLink from './ExternalLinksCRUD/AddExternalLink'
import DeleteExternalLinkDialog from './ExternalLinksCRUD/DeleteExternalLinkDialog'
import './externalLinks.scss'

const ExternalLinks = ({ isAppConfigView, userRole }: ExternalLinksProps) => {
    const { appId } = useParams<{ appId: string }>()
    const history = useHistory()
    const location = useLocation()
    const { url } = useRouteMatch()
    const queryParams = new URLSearchParams(location.search)
    const [isLoading, setLoading] = useState(false)
    const [isAPICallInProgress, setAPICallInProgress] = useState(false)
    const [showAddLinkDialog, setShowAddLinkDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [monitoringTools, setMonitoringTools] = useState<OptionTypeWithIcon[]>([])
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([])
    const [clusters, setClusters] = useState<IdentifierOptionType[]>([])
    const [allApps, setAllApps] = useState<IdentifierOptionType[]>([])
    const [appliedClusters, setAppliedClusters] = useState<IdentifierOptionType[]>([])
    const [appliedApps, setAppliedApps] = useState<IdentifierOptionType[]>([])
    const [filteredExternalLinks, setFilteredExternalLinks] = useState<ExternalLink[]>([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [selectedLink, setSelectedLink] = useState<ExternalLink>()
    const { serverMode } = useMainContext()
    const isFullMode = serverMode === SERVER_MODE.FULL

    useEffect(() => {
        initExternalLinksData()
    }, [])

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
                if (queryParams.has('search') && _filteredExternalLinks.length > 0) {
                    // #3 - If yes then filter the filtered external links further by searched term
                    _filteredExternalLinks = filterBySearchTerm(_filteredExternalLinks)
                }

                // #4 - Set filtered external links
                setFilteredExternalLinks(_filteredExternalLinks)
            } else if (queryParams.has('search')) {
                setFilteredExternalLinks(filterBySearchTerm(externalLinks))
            } else {
                setFilteredExternalLinks(externalLinks)
            }
        }
    }, [location.search, externalLinks])

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
                setClusters(
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
        const _searchTerm = queryParams.get('search').trim().toLowerCase()

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

    const handleAddLinkClick = (): void => {
        setShowAddLinkDialog(true)
        setSelectedLink(undefined)
    }

    const renderSearchFilterWrapper = (): JSX.Element => {
        return (
            <div className="search-filter-wrapper">
                <SearchInput queryParams={queryParams} history={history} url={url} />
                {!isAppConfigView && (
                    <>
                        {isFullMode && (
                            <ApplicationFilter
                                allApps={allApps}
                                appliedApps={appliedApps}
                                setAppliedApps={setAppliedApps}
                                queryParams={queryParams}
                                history={history}
                                url={url}
                            />
                        )}
                        <ClusterFilter
                            clusters={clusters}
                            appliedClusters={appliedClusters}
                            setAppliedClusters={setAppliedClusters}
                            queryParams={queryParams}
                            history={history}
                            url={url}
                        />
                    </>
                )}
            </div>
        )
    }

    const getScopeLabel = (link: ExternalLink): string => {
        const _identifiersLen = link.identifiers.length
        const _labelPostfix = `${link.type === ExternalLinkScopeType.ClusterLevel ? 'cluster' : 'application'}${
            _identifiersLen === 0 || _identifiersLen > 1 ? 's' : ''
        }`

        if (_identifiersLen === 0) {
            return `All ${_labelPostfix}`
        }
        return `${_identifiersLen} ${_labelPostfix}`
    }

    const editLink = (link: ExternalLink): void => {
        setSelectedLink(link)
        setShowAddLinkDialog(true)
    }

    const renderExternalLinksHeader = (): JSX.Element => {
        return (
            <div
                className={`external-links__header h-40 fs-12 fw-6 pl-20 bg__primary dc__uppercase ${
                    isAppConfigView ? 'app-config-view' : ''
                }`}
            >
                <div className="external-links__cell--icon" />
                <div className="external-links__cell--tool__name">
                    <span className="external-links__cell-header cn-7 fs-12 fw-6">Name</span>
                </div>
                <div className="external-links__cell--cluster">
                    <span className="external-links__cell-header cn-7 fs-12 fw-6">Description</span>
                </div>
                {!isAppConfigView && (
                    <div className="external-links__cell--cluster">
                        <span className="external-links__cell-header cn-7 fs-12 fw-6">Scope</span>
                    </div>
                )}
                <div className="external-links__cell--url__template">
                    <span className="external-links__cell-header cn-7 fs-12 fw-6">Url Template</span>
                </div>
            </div>
        )
    }

    const renderExternalLinks = (filteredLinksLen: number): JSX.Element => {
        return (
            <>
                {filteredExternalLinks.map((link, idx) => {
                    return (
                        <Fragment key={`external-link-${idx}`}>
                            <div className={`external-link ${isAppConfigView ? 'app-config-view' : ''}`}>
                                <div className="external-links__cell--icon">
                                    <img
                                        src={getMonitoringToolIcon(monitoringTools, link.monitoringToolId)}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                        }}
                                        onError={onImageLoadError}
                                    />
                                </div>
                                <div
                                    className="external-links__cell--tool__name cn-9 fs-13 dc__ellipsis-right"
                                    data-testid={`external-link-name-${link.name}`}
                                >
                                    {link.name}
                                </div>
                                <div className="external-links__cell--tool__name cn-9 fs-13 dc__ellipsis-right">
                                    {link.description ? (
                                        <Tippy
                                            className="default-tt dc__mxw-300 dc__word-break"
                                            arrow={false}
                                            placement="top-start"
                                            content={link.description}
                                        >
                                            <span data-testid={`external-link-description-${link.name}`}>
                                                {link.description}
                                            </span>
                                        </Tippy>
                                    ) : (
                                        '-'
                                    )}
                                </div>
                                {!isAppConfigView && (
                                    <div
                                        className="external-links__cell--scope cn-9 fs-13 dc__ellipsis-right"
                                        data-testid={`external-link-scope-${link.name}`}
                                    >
                                        {getScopeLabel(link)}
                                    </div>
                                )}
                                <div className="external-links__cell--url__template cn-9 fs-13 dc__ellipsis-right">
                                    <Tippy
                                        className="default-tt dc__mxw-300 dc__word-break"
                                        arrow={false}
                                        placement="top-start"
                                        content={link.url}
                                    >
                                        <span data-testid={`external-link-url-${link.name}`}>{link.url}</span>
                                    </Tippy>
                                </div>
                                <div className="external-link-actions">
                                    <EditIcon
                                        className="icon-dim-20 cursor mr-16"
                                        onClick={() => {
                                            editLink(link)
                                        }}
                                        data-testid={`external-link-edit-button-${link.name}`}
                                    />
                                    <DeleteIcon
                                        className="icon-dim-20 cursor"
                                        onClick={() => {
                                            setSelectedLink(link)
                                            setShowDeleteDialog(true)
                                        }}
                                        data-testid={`external-link-delete-button-${link.name}`}
                                    />
                                </div>
                            </div>
                            {idx !== filteredLinksLen - 1 && <div className="external-link__divider w-100 bcn-1" />}
                        </Fragment>
                    )
                })}
            </>
        )
    }

    const renderExternalLinksView = (): JSX.Element => {
        const filteredLinksLen = filteredExternalLinks.length

        return (
            <div className="external-links-wrapper">
                <div className={`flex dc__content-space ${isAppConfigView ? 'mb-12' : 'mb-16'}`}>
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
                        {renderSearchFilterWrapper()}
                        <div className="h-20 dc__border-right mr-8 ml-8" />
                        <AddLinkButton handleOnClick={handleAddLinkClick} />
                    </div>
                </div>
                {isAppConfigView && <RoleBasedInfoNote userRole={userRole} listingView />}
                {!isAppConfigView && (appliedClusters.length > 0 || appliedApps.length > 0) && (
                    <AppliedFilterChips
                        appliedClusters={appliedClusters}
                        setAppliedClusters={setAppliedClusters}
                        appliedApps={appliedApps}
                        setAppliedApps={setAppliedApps}
                        queryParams={queryParams}
                        history={history}
                        url={url}
                    />
                )}
                <div className={`external-links dc__border bg__primary ${isAppConfigView ? 'app-config-view__listing' : ''}`}>
                    {isAPICallInProgress ? (
                        <Progressing pageLoader />
                    ) : (
                        <>
                            {(appliedClusters.length > 0 || queryParams.get('search')) && filteredLinksLen === 0 && (
                                <NoMatchingResults />
                            )}
                            {filteredLinksLen > 0 && (
                                <>
                                    {renderExternalLinksHeader()}
                                    <div className="external-links__list dc__overflow-auto">
                                        {renderExternalLinks(filteredLinksLen)}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        )
    }

    const handleDialogVisibility = () => {
        setShowAddLinkDialog(!showAddLinkDialog)
    }

    const renderExternalLinksContainer = () => {
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
                    history={history}
                />
            )
        }
        return renderExternalLinksView()
    }

    return isLoading ? (
        <Progressing pageLoader />
    ) : (
        <div className={`external-links-container dc__m-auto ${errorStatusCode > 0 ? 'error-view' : ''}`}>
            {renderExternalLinksContainer()}
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
                    ].concat(clusters)}
                    setExternalLinks={setExternalLinks}
                />
            )}
            {showDeleteDialog && selectedLink && (
                <DeleteExternalLinkDialog
                    appId={appId}
                    isAppConfigView={isAppConfigView}
                    selectedLink={selectedLink}
                    isAPICallInProgress={isAPICallInProgress}
                    setAPICallInProgress={setAPICallInProgress}
                    setExternalLinks={setExternalLinks}
                    setShowDeleteConfirmation={setShowDeleteDialog}
                />
            )}
        </div>
    )
}

export default ExternalLinks
