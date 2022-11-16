import React, { Fragment, useEffect, useState } from 'react'
import { ErrorScreenManager, Progressing, showError, sortOptionsByLabel, sortOptionsByValue } from '../common'
import { AddLinkButton, NoExternalLinksView, NoMatchingResults } from './ExternalLinks.component'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { getAllApps, getExternalLinks, getMonitoringTools } from './ExternalLinks.service'
import {
    ExternalLink,
    ExternalLinkIdentifierType,
    ExternalLinkScopeType,
    IdentifierOptionType,
    OptionTypeWithIcon,
} from './ExternalLinks.type'
import { getClusterListMin } from '../../services/service'
import { OptionType } from '../app/types'
import { ReactComponent as EditIcon } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import { ReactComponent as QuestionIcon } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/ic-delete-interactive.svg'
import { getMonitoringToolIcon, onImageLoadError, sortByUpdatedOn } from './ExternalLinks.utils'
import { DOCUMENTATION } from '../../config'
import TippyWhite from '../common/TippyWhite'
import { AppliedFilterChips, ClusterFilter, SearchInput } from './ExternalLinksFilters'
import AddExternalLink from './ExternalLinksCRUD/AddExternalLink'
import DeleteExternalLinkDialog from './ExternalLinksCRUD/DeleteExternalLinkDialog'
import { UserRoleType } from '../userGroups/userGroups.types'
import './externalLinks.scss'

function ExternalLinks({ isAppConfigView, userRole }: { isAppConfigView?: boolean; userRole?: UserRoleType }) {
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
    const [appliedClusters, setAppliedClusters] = useState<OptionType[]>([])
    const [filteredExternalLinks, setFilteredExternalLinks] = useState<ExternalLink[]>([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [selectedLink, setSelectedLink] = useState<ExternalLink>()

    useEffect(() => {
        setLoading(true)
        Promise.all([
            getMonitoringTools(),
            isAppConfigView ? getExternalLinks(0, appId, ExternalLinkIdentifierType.DevtronApp) : getExternalLinks(),
            getClusterListMin(),
            getAllApps(),
        ])
            .then(([monitoringToolsRes, externalLinksRes, clustersResp, allAppsResp]) => {
                setExternalLinks(externalLinksRes.result?.sort(sortByUpdatedOn) || [])
                setMonitoringTools(
                    monitoringToolsRes.result
                        ?.map((tool) => ({
                            label: tool.name,
                            value: tool.id,
                            icon: tool.icon,
                            category: tool.category,
                        }))
                        .sort(sortOptionsByValue) || [],
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
                setAllApps(
                    allAppsResp.result
                        ?.map((_app) => ({
                            label: _app.appName,
                            value: `${_app.appId}|${_app.appName}|${_app.type}`,
                            type: _app.type as ExternalLinkIdentifierType,
                        }))
                        .sort(sortOptionsByLabel) || [],
                )
                setLoading(false)
            })
            .catch((e) => {
                showError(e)
                setErrorStatusCode(e.code)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        if (externalLinks.length > 0) {
            /**
             * 1. If both clusters & search query params are present then filter by both and set filtered external links
             * 2. If only clusters query param is present then filter by cluster ids & set filtered external links
             * 3. If only search query param is present then filter by searched term & set filtered external links
             * 4. Else set default external links
             */
            if (queryParams.has('clusters') && queryParams.has('search')) {
                const _appliedClustersIds = queryParams.get('clusters').split(',')

                // #1 - Filter the links by applied clusterIds
                let _filteredExternalLinks = filterByClusterIds(_appliedClustersIds)

                // #2 - Check if we have any external links filtered by applied clusterIds
                if (_filteredExternalLinks.length > 0) {
                    // #3 - If yes then filter the filtered external links further by searched term
                    _filteredExternalLinks = filterBySearchTerm(_filteredExternalLinks)
                }

                // #4 - Set filtered external links
                setFilteredExternalLinks(_filteredExternalLinks)
            } else if (queryParams.has('clusters')) {
                const _appliedClustersIds = queryParams.get('clusters').split(',')

                setFilteredExternalLinks(filterByClusterIds(_appliedClustersIds))
            } else if (queryParams.has('search')) {
                setFilteredExternalLinks(filterBySearchTerm(externalLinks))
            } else {
                setFilteredExternalLinks(externalLinks)
            }
        }
    }, [location.search, externalLinks])

    const filterByClusterIds = (_appliedClustersIds: string[]): ExternalLink[] => {
        /**
         * 1. If clusters query param is present but doesn't have any value then return default externalLinks
         * 2. If clusters query param is present and has value then filter & return filtered external links
         * 3. Else return empty array
         */
        if (_appliedClustersIds.length === 1 && !_appliedClustersIds[0]) {
            return externalLinks
        } else if (_appliedClustersIds.length > 0) {
            return externalLinks.filter(
                (link) =>
                    link.identifiers.length === 0 ||
                    link.identifiers.some((_identifier) => _appliedClustersIds.includes(`${_identifier.clusterId}`)),
            )
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
                    <ClusterFilter
                        clusters={clusters}
                        appliedClusters={appliedClusters}
                        setAppliedClusters={setAppliedClusters}
                        queryParams={queryParams}
                        history={history}
                        url={url}
                    />
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
            <div className={`external-links__header ${isAppConfigView ? 'app-config-view' : ''}`}>
                <div className="external-links__cell--icon"></div>
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
                                <div className="external-links__cell--tool__name cn-9 fs-13 dc__ellipsis-right">
                                    {link.name}
                                </div>
                                <div className="external-links__cell--tool__name cn-9 fs-13 dc__ellipsis-right">
                                    {link.description || '-'}
                                </div>
                                {!isAppConfigView && (
                                    <div className="external-links__cell--scope cn-9 fs-13 dc__ellipsis-right">
                                        {getScopeLabel(link)}
                                    </div>
                                )}
                                <div className="external-links__cell--url__template cn-9 fs-13 dc__ellipsis-right">
                                    {link.url}
                                </div>
                                <div className="external-link-actions">
                                    <EditIcon
                                        className="icon-dim-20 cursor mr-16"
                                        onClick={() => {
                                            editLink(link)
                                        }}
                                    />
                                    <DeleteIcon
                                        className="icon-dim-20 cursor"
                                        onClick={() => {
                                            setSelectedLink(link)
                                            setShowDeleteDialog(true)
                                        }}
                                    />
                                </div>
                            </div>
                            {idx !== filteredLinksLen - 1 && <div className="external-link__divider" />}
                        </Fragment>
                    )
                })}
            </>
        )
    }

    const renderExternalLinksView = (): JSX.Element => {
        const filteredLinksLen = filteredExternalLinks.length

        return (
            <div className="external-links-wrapper h-100 dc__overflow-hidden">
                <div className="flex dc__content-space mb-16">
                    <h3 className="title flex left cn-9 fs-18 fw-6 lh-24 m-0">
                        External links
                        <TippyWhite
                            placement="bottom"
                            Icon={HelpIcon}
                            iconClass="fcv-5"
                            heading="External links"
                            infoText="Configure links to third-party applications (e.g. Kibana, New Relic) for quick access. Configured
                    links will be available in the App details page."
                            documentationLink={DOCUMENTATION.EXTERNAL_LINKS}
                            showCloseButton={true}
                            trigger="click"
                            interactive={true}
                        >
                            <QuestionIcon className="icon-dim-20 fcn-6 cursor ml-8" />
                        </TippyWhite>
                    </h3>
                    <div className="cta-search-filter-container flex">
                        {renderSearchFilterWrapper()}
                        <div className="h-20 dc__border-right mr-8 ml-8" />
                        <AddLinkButton handleOnClick={handleAddLinkClick} />
                    </div>
                </div>
                {!isAppConfigView && appliedClusters.length > 0 && (
                    <AppliedFilterChips
                        appliedClusters={appliedClusters}
                        setAppliedClusters={setAppliedClusters}
                        queryParams={queryParams}
                        history={history}
                        url={url}
                    />
                )}
                <div className="external-links dc__overflow-hidden">
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
                                    <div className="h-100 dc__overflow-scroll">
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
                    <ErrorScreenManager
                        code={errorStatusCode}
                        subtitle="Information on this page is available only to superadmin users."
                    />
                </div>
            )
        } else if (!externalLinks || externalLinks.length === 0) {
            return (
                <NoExternalLinksView
                    isAppConfigView={isAppConfigView}
                    userRole={userRole}
                    handleAddLinkClick={handleAddLinkClick}
                    history={history}
                />
            )
        } else {
            return renderExternalLinksView()
        }
    }

    return isLoading ? (
        <Progressing pageLoader />
    ) : (
        <div className={`external-links-container h-100 ${errorStatusCode > 0 ? 'error-view' : ''}`}>
            {renderExternalLinksContainer()}
            {showAddLinkDialog && (
                <AddExternalLink
                    appId={appId}
                    isAppConfigView={isAppConfigView}
                    handleDialogVisibility={handleDialogVisibility}
                    selectedLink={selectedLink}
                    monitoringTools={monitoringTools}
                    allApps={[
                        { label: 'All applications', value: '*', type: ExternalLinkIdentifierType.AllApps },
                    ].concat(allApps)}
                    clusters={[{ label: 'All clusters', value: '*', type: ExternalLinkIdentifierType.Cluster }].concat(
                        clusters,
                    )}
                    setExternalLinks={setExternalLinks}
                />
            )}
            {showDeleteDialog && selectedLink && (
                <DeleteExternalLinkDialog
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
