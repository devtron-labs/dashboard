import React, { useEffect, useState } from 'react'
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
import { deleteExternalLink, getExternalLinks, getMonitoringTools } from './ExternalLinks.service'
import { ExternalLink, MonitoringTool, OptionTypeWithIcon } from './ExternalLinks.type'
import { getClusterListMinWithoutAuth as getClusterList } from '../../services/service'
import { OptionType } from '../app/types'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Delete } from '../../assets/icons/ic-delete-interactive.svg'
import { MultiValue } from 'react-select'

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
        Promise.all([getMonitoringTools(), getExternalLinks(), getClusterList()])
            .then(([monitoringToolsRes, externalLinksRes, clustersResp]) => {
                setExternalLinks(externalLinksRes.result || [])
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
        if (appliedClusters.length > 0) {
            const appliedClustersIds = appliedClusters.map((cluster) => cluster.value)
            setFilteredExternalLinks(
                externalLinks.filter((link) => link.clusterIds.some((id) =>  id === '*' || appliedClustersIds.includes(id))),
            )
        } else {
            setFilteredExternalLinks(externalLinks)
        }
    }, [appliedClusters, externalLinks])

    const applyFilter = (): void => {
        // filter external links
    }

    const handleAddLinkClick = () => {
        setShowAddLinkDialog(true)
        setSelectedLink(undefined)
    }

    const getSearchFilterWrapper = (): JSX.Element => {
        return (
            <div className="search-filter-wrapper">
                <SearchInput
                    externalLinks={externalLinks}
                    monitoringTools={monitoringTools}
                    setFilteredExternalLinks={setFilteredExternalLinks}
                    queryParams={queryParams}
                    history={history}
                />
                <ClusterFilter
                    clusters={clusters}
                    appliedClusters={appliedClusters}
                    setAppliedClusters={setAppliedClusters}
                    applyFilter={applyFilter}
                    queryParams={queryParams}
                    history={history}
                />
            </div>
        )
    }

    const getClusterLabel = (link: ExternalLink) => {
        if (link.clusterIds[0] === '*' || clusters.every((cluster) => link.clusterIds.includes(cluster.value))) {
            return 'All clusters'
        } else if (link.clusterIds.length > 1) {
            return `${link.clusterIds.length} clusters`
        }

        return clusters.find((cluster) => cluster.value === link.clusterIds[0])?.label || '1 cluster'
    }

    const editLink = (link: ExternalLink) => {
        setSelectedLink(link)
        setShowAddLinkDialog(true)
    }

    const getExternalLinksView = (): JSX.Element => {
        const filteredLinksLen = filteredExternalLinks.length

        return (
            <div className="external-links-wrapper">
                <h4 className="title">External links</h4>
                <p className="subtitle">
                    Configure links to third-party applications (e.g. Kibana, New Relic) for quick access. Configured
                    linkouts will be available in the App details page. Learn more
                </p>
                <div className="cta-search-filter-container flex content-space">
                    <AddLinkButton handleOnClick={handleAddLinkClick} />
                    {getSearchFilterWrapper()}
                </div>
                {appliedClusters.length > 0 && (
                    <AppliedFilterChips
                        clusters={clusters}
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
                            {(appliedClusters.length > 0 || queryParams.get('search')) &&
                                filteredExternalLinks.length === 0 && <NoMatchingResults />}
                            {filteredExternalLinks.length > 0 && (
                                <>
                                    <div className="external-links__header">
                                        <div className="external-links__cell--icon"></div>
                                        <div className="external-links__cell--tool__name">
                                            <span className="external-links__cell-header">Tool Name</span>
                                        </div>
                                        <div className="external-links__cell--cluster">
                                            <span className="external-links__cell-header">Cluster</span>
                                        </div>
                                        <div className="external-links__cell--url__template">
                                            <span className="external-links__cell-header">Url Template</span>
                                        </div>
                                    </div>
                                    {filteredExternalLinks.map((link, idx) => {
                                        return (
                                            <>
                                                <div className="external-link flex left">
                                                    <div className="external-links__cell--icon">
                                                        <img
                                                            src={monitoringTools[link.monitoringToolId].icon}
                                                            style={{
                                                                width: '24px',
                                                                height: '24px',
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="external-links__cell--tool__name">{link.name}</div>
                                                    <div className="external-links__cell--cluster">
                                                        {getClusterLabel(link)}
                                                    </div>
                                                    <div className="external-links__cell--url__template">
                                                        {link.url}
                                                    </div>
                                                    <div className="external-link-actions ml-16px">
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
                                                {idx !== filteredLinksLen - 1 && (
                                                    <div className="external-link__divider" />
                                                )}
                                            </>
                                        )
                                    })}
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
            return getExternalLinksView()
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
                    clusters={clusters}
                    externalLinks={externalLinks}
                    setExternalLinks={setExternalLinks}
                />
            )}
            {showDeleteDialog && selectedLink && (
                <DeleteExternalLinkDialog
                    selectedLink={selectedLink}
                    externalLinks={externalLinks}
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
