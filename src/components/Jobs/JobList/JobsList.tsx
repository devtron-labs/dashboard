import React, { useEffect, useState } from 'react'
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { SERVER_MODE, URLS } from '../../../config'
import { ErrorScreenManager, Progressing, showError, stopPropagation, useAsync } from '../../common'
import HeaderWithCreateButton from '../../common/header/HeaderWithCreateButton/HeaderWithCreateButton'
import { JobListViewType } from '../Constants'
import { getJobs } from '../Service'
import JobListContainer from './JobListContainer'
import * as queryString from 'query-string'
import './JobsList.scss'
import { OrderBy } from '../../app/list/types'
import { onRequestUrlChange } from '../Utils'
import { AppListViewType } from '../../app/config'
import { ServerErrors } from '../../../modals/commonTypes'
import { buildClusterVsNamespace, getInitData, getNamespaces } from '../../app/list-new/AppListService'
import { AddNewApp } from '../../app/create/CreateApp'

export default function JobsList({ isArgoInstalled }: { isArgoInstalled: boolean }) {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const [dataStateType, setDataStateType] = useState(JobListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [fetchingNamespaces, setFetchingNamespaces] = useState(false)
    const [fetchingNamespacesErrored, setFetchingNamespacesErrored] = useState(false)
    const [parsedPayloadOnUrlChange, setParsedPayloadOnUrlChange] = useState({})
    const [syncListData, setSyncListData] = useState<boolean>()

    // search
    const [searchString, setSearchString] = useState(undefined)
    const [searchApplied, setSearchApplied] = useState(false)

    // filters
    const [masterFilters, setMasterFilters] = useState({
        appStatus: [],
        projects: [],
        environments: [],
        clusters: [],
        namespaces: [],
    })
    const [jobCount, setJobCount] = useState(0)
    //  const [checkingUserRole, userRoleResponse] = useAsync(getUserRole, [])

    useEffect(() => {
        // set search data
        let searchQuery = location.search
        let queryParams = queryString.parse(searchQuery)
        if (queryParams.search) {
            setSearchString(queryParams.search)
            setSearchApplied(true)
        }

        // set payload parsed from url
        let payloadParsedFromUrl = onRequestUrlChange(
            dataStateType,
            parsedPayloadOnUrlChange,
            masterFilters,
            setMasterFilters,
            _getClusterIdsFromRequestUrl,
            _fetchAndSetNamespaces,
            location.search,
        )
        setParsedPayloadOnUrlChange(payloadParsedFromUrl)

        // fetch master filters data and some master data
        getInitData(payloadParsedFromUrl, SERVER_MODE.FULL)
            .then((initData) => {
                setMasterFilters(initData.filters)
                setDataStateType(AppListViewType.LIST)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setDataStateType(AppListViewType.ERROR)
                setErrorResponseCode(errors.code)
            })
    }, [syncListData])

    const _getClusterIdsFromRequestUrl = (parsedPayload: any): string => {
        let _namespaces = parsedPayload['namespaces'] || []
        return [...buildClusterVsNamespace(_namespaces.join(',')).keys()].join(',')
    }

    const _fetchAndSetNamespaces = (_parsedPayloadOnUrlChange: any, _clusterIdsCsv: string, _masterFilters: any) => {
        // fetch namespaces
        setFetchingNamespaces(true)
        setFetchingNamespacesErrored(false)
        let _clusterVsNamespaceMap = buildClusterVsNamespace(_parsedPayloadOnUrlChange.namespaces.join(','))
        getNamespaces(_clusterIdsCsv, _clusterVsNamespaceMap)
            .then((_namespaces) => {
                _masterFilters.namespaces = _namespaces
                setMasterFilters(_masterFilters)
                setFetchingNamespaces(false)
                setFetchingNamespacesErrored(false)
            })
            .catch((errors: ServerErrors) => {
                setFetchingNamespaces(false)
                setFetchingNamespacesErrored(true)
            })
    }

    function openDevtronAppCreateModel() {
        history.push(`${URLS.JOB}/${URLS.APP_LIST}/${URLS.CREATE_JOB}${location.search}`)
    }

    const closeJobCreateModal = (e) => {
        stopPropagation(e)
        history.push(`${URLS.JOB}/${URLS.APP_LIST}`)
    }

    const renderCreateJobRouter = () => {
        return (
            <Switch>
                <Route
                    path={`${path}/${URLS.CREATE_JOB}`}
                    render={(props) => (
                        <AddNewApp
                            isJobCreateView={true}
                            close={closeJobCreateModal}
                            history={props.history}
                            location={props.location}
                            match={props.match}
                        />
                    )}
                />
            </Switch>
        )
    }

    const removeAllFilters = (): void => {
        let qs = queryString.parse(location.search)
        let keys = Object.keys(qs)
        let query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['offset'] = 0
        query['hOffset'] = 0
        delete query['environment']
        delete query['team']
        delete query['namespace']
        delete query['appStatus']
        delete query['search']

        //delete search string
        setSearchApplied(false)
        setSearchString('')

        let queryStr = queryString.stringify(query)
        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryStr}`)
    }

    const sortApplicationList = (key: string): void => {
        let qs = queryString.parse(location.search)
        let keys = Object.keys(qs)
        let query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['orderBy'] = key
        query['sortOrder'] = query['sortOrder'] == OrderBy.DESC ? OrderBy.ASC : OrderBy.DESC

        let queryStr = queryString.stringify(query)
        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryStr}`)
    }

    const updateDataSyncing = (loading: boolean): void => {
        setDataSyncing(loading)
    }

    return (
        <div>
            {dataStateType === JobListViewType.LOADING && (
                <div className="dc__loading-wrapper">
                    <Progressing pageLoader />
                </div>
            )}
            {dataStateType === JobListViewType.ERROR && (
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )}
            {dataStateType === JobListViewType.LIST && (
                <>
                    <HeaderWithCreateButton headerName="Jobs" />
                    {/* {renderMasterFilters()}
                    {renderAppliedFilters()} */}
                    {renderCreateJobRouter()}
                    <JobListContainer
                        payloadParsedFromUrl={parsedPayloadOnUrlChange}
                        clearAllFilters={removeAllFilters}
                        sortApplicationList={sortApplicationList}
                        jobListCount={jobCount}
                        isSuperAdmin={true}
                        openDevtronAppCreateModel={openDevtronAppCreateModel}
                        setJobCount={setJobCount}
                        updateDataSyncing={updateDataSyncing}
                        isArgoInstalled={isArgoInstalled}
                    />
                </>
            )}
        </div>
    )
}
