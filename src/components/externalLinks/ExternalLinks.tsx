import React, { Fragment, useEffect, useState } from 'react'
import { ErrorScreenManager, Progressing, showError, sortOptionsByLabel, sortOptionsByValue } from '../common'
import {
    AddExternalLinkDialog,
    AddLinkButton,
    AppliedFilterChips,
    ClusterFilter,
    DeleteExternalLinkDialog,
    NoExternalLinksView,
    NoMatchingResults,
    SearchInput,
} from './ExternalLinks.component'
import { useHistory, useLocation } from 'react-router-dom'
import './externalLinks.scss'
import { getExternalLinks, getMonitoringTools } from './ExternalLinks.service'
import { ExternalLink, OptionTypeWithIcon } from './ExternalLinks.type'
import { getClusterListMin } from '../../services/service'
import { OptionType } from '../app/types'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Delete } from '../../assets/icons/ic-delete-interactive.svg'
import { MultiValue } from 'react-select'
import { getMonitoringToolIcon, onImageLoadError, sortByUpdatedOn } from './ExternalLinks.utils'

function ExternalLinks() {
    const history = useHistory()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const [isLoading, setLoading] = useState(false)
    const [isAPICallInProgress, setAPICallInProgress] = useState(false)
    const [showAddLinkDialog, setShowAddLinkDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [monitoringTools, setMonitoringTools] = useState<MultiValue<OptionTypeWithIcon>>([])
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([])
    const [clusters, setClusters] = useState<MultiValue<OptionType>>([])
    const [appliedClusters, setAppliedClusters] = useState<MultiValue<OptionType>>([])
    const [filteredExternalLinks, setFilteredExternalLinks] = useState<ExternalLink[]>([])
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [selectedLink, setSelectedLink] = useState<ExternalLink>()

    useEffect(() => {
        setLoading(true)
        Promise.all([getMonitoringTools(), getExternalLinks(), getClusterListMin()])
            .then(([monitoringToolsRes, externalLinksRes, clustersResp]) => {
                setExternalLinks(externalLinksRes.result?.sort(sortByUpdatedOn) || [])
                setMonitoringTools(
                    monitoringToolsRes.result
                        ?.map((tool) => ({
                            label: tool.name,
                            value: tool.id,
                            icon: tool.icon,
                        }))
                        .sort(sortOptionsByValue) || [],
                )
                setClusters(
                    clustersResp.result
                        ?.map((cluster) => ({
                            label: cluster.cluster_name,
                            value: `${cluster.id}`,
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
                    link.clusterIds.length === 0 || link.clusterIds.some((id) => _appliedClustersIds.includes(`${id}`)),
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
                <SearchInput queryParams={queryParams} history={history} />
                <ClusterFilter
                    clusters={clusters}
                    appliedClusters={appliedClusters}
                    setAppliedClusters={setAppliedClusters}
                    queryParams={queryParams}
                    history={history}
                />
            </div>
        )
    }

    const getClusterLabel = (link: ExternalLink): string => {
        if (link.clusterIds.length === 0) {
            return 'All clusters'
        } else if (link.clusterIds.length > 1) {
            return `${link.clusterIds.length} clusters`
        }

        return clusters.find((cluster) => +cluster.value === link.clusterIds[0])?.label || '1 cluster'
    }

    const editLink = (link: ExternalLink): void => {
        setSelectedLink(link)
        setShowAddLinkDialog(true)
    }

    const renderExternalLinksHeader = (): JSX.Element => {
        return (
            <div className="external-links__header">
                <div className="external-links__cell--icon"></div>
                <div className="external-links__cell--tool__name">
                    <span className="external-links__cell-header cn-7 fs-12 fw-6">Name</span>
                </div>
                <div className="external-links__cell--cluster">
                    <span className="external-links__cell-header cn-7 fs-12 fw-6">Cluster</span>
                </div>
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
                            <div className="external-link">
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
                                <div className="external-links__cell--tool__name cn-9 fs-13 ellipsis-right">
                                    {link.name}
                                </div>
                                <div className="external-links__cell--cluster cn-9 fs-13 ellipsis-right">
                                    {getClusterLabel(link)}
                                </div>
                                <div className="external-links__cell--url__template cn-9 fs-13 ellipsis-right">
                                    {link.url}
                                </div>
                                <div className="external-link-actions">
                                    <Edit
                                        className="icon-dim-20 cursor mr-16"
                                        onClick={() => {
                                            editLink(link)
                                        }}
                                    />
                                    <Delete
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
            <div className="external-links-wrapper">
                <h4 className="title cn-9 fs-16 fw-6 mb-5">External links</h4>
                <p className="subtitle cn-9 fs-12">
                    Configure links to third-party applications (e.g. Kibana, New Relic) for quick access. Configured
                    links will be available in the App details page.
                </p>
                <div className="cta-search-filter-container flex content-space mb-16">
                    <AddLinkButton handleOnClick={handleAddLinkClick} />
                    {renderSearchFilterWrapper()}
                </div>
                {appliedClusters.length > 0 && (
                    <AppliedFilterChips
                        appliedClusters={appliedClusters}
                        setAppliedClusters={setAppliedClusters}
                        queryParams={queryParams}
                        history={history}
                    />
                )}
                <div className="external-links">
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
                                    {renderExternalLinks(filteredLinksLen)}
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
            return <NoExternalLinksView handleAddLinkClick={handleAddLinkClick} />
        } else {
            return renderExternalLinksView()
        }
    }

    return isLoading ? (
        <Progressing pageLoader />
    ) : (
        <div className={`external-links-container ${errorStatusCode > 0 ? 'error-view' : ''}`}>
            {renderExternalLinksContainer()}
            {showAddLinkDialog && (
                <AddExternalLinkDialog
                    handleDialogVisibility={handleDialogVisibility}
                    selectedLink={selectedLink}
                    monitoringTools={monitoringTools}
                    clusters={[{ label: 'All clusters', value: '*' }].concat(clusters)}
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
