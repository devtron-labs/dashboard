import React, { useEffect, useState } from 'react'
import { Progressing } from '../common'
import {
    AddExternalLinkDialog,
    AddLinkButton,
    ClusterFilter,
    MOCK_CLUSTER_IDS,
    NoAccessView,
    NoExternalLinksView,
    SearchInput,
} from './ExternalLinks.component'
import { useHistory, useLocation } from 'react-router-dom'
import './externalLinks.scss'

function ExternalLinks() {
    const history = useHistory()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const [isLoading, setLoading] = useState(false)
    const [isNotAuthorized, setNotAuthorized] = useState(false)
    const [showAddLinkDialog, setShowAddLinkDialog] = useState(false)
    const [externalLinks, setExternalLinks] = useState([])
    const [clusters, setClusters] = useState([])
    const [filteredExternalLinks, setFilteredExternalLinks] = useState([])


    useEffect(() => {
        setLoading(true)

        setTimeout(() => {
            setLoading(false)
            // setNotAuthorized(true)
            setExternalLinks([])
            setClusters(MOCK_CLUSTER_IDS)
        }, 500)
    }, [])

    useEffect(() => {
        // Cluster filter logic
    }, [queryParams.get('cluster')])

    useEffect(() => {
        // Search filter logic
    }, [queryParams.get('search')])

    const applyFilter = (): void => {
        // filter external links
    }

    const handleAddLinkClick = () => {
        setShowAddLinkDialog(true)
    }

    const getSearchFilterWrapper = (): JSX.Element => {
        return (
            <div className="search-filter-wrapper">
                <SearchInput externalLinks={externalLinks} setFilteredExternalLinks={setFilteredExternalLinks} queryParams={queryParams} history={history} />
                <ClusterFilter clusters={clusters} applyFilter={applyFilter} queryParams={queryParams} history={history}/>
            </div>
        )
    }

    const getExternalLinksView = (): JSX.Element => {
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
            </div>
        )
    }

    const handleDialogVisibility = () => {
        setShowAddLinkDialog(!showAddLinkDialog)
    }

    return isLoading ? (
        <Progressing pageLoader />
    ) : (
        <div className="external-links-container">
            {isNotAuthorized && <NoAccessView />}
            {!isNotAuthorized && (!externalLinks || externalLinks.length === 0) && (
                <NoExternalLinksView handleAddLinkClick={handleAddLinkClick} />
            )}
            {!isNotAuthorized && externalLinks && externalLinks.length > 0 && getExternalLinksView()}
            {showAddLinkDialog && <AddExternalLinkDialog handleDialogVisibility={handleDialogVisibility} />}
        </div>
    )
}

export default ExternalLinks
