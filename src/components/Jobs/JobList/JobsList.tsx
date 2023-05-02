import React, { useContext, useEffect, useState } from 'react'
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../../config'
import {
    ErrorScreenManager,
    Progressing,
    showError,
    stopPropagation,
    ServerErrors,
} from '@devtron-labs/devtron-fe-common-lib'
import { Filter, FilterOption, useAsync } from '../../common'
import HeaderWithCreateButton from '../../common/header/HeaderWithCreateButton/HeaderWithCreateButton'
import { JobListViewType, JobsFilterTypeText, JobsStatusConstants } from '../Constants'
import JobListContainer from './JobListContainer'
import * as queryString from 'query-string'
import { OrderBy } from '../../app/list/types'
import { onRequestUrlChange, populateQueryString } from '../Utils'
import { AddNewApp } from '../../app/create/CreateApp'
import { getAppListDataToExport, getJobsInitData } from '../Service'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { getUserRole } from '../../userGroups/userGroup.service'
import ExportToCsv from '../../common/ExportToCsv/ExportToCsv'
import { mainContext } from '../../common/navigation/NavigationRoutes'
import { FILE_NAMES } from '../../common/ExportToCsv/constants'
import '../../app/list/list.scss'

export default function JobsList() {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { setPageOverflowEnabled } = useContext(mainContext)
    const [dataStateType, setDataStateType] = useState(JobListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [parsedPayloadOnUrlChange, setParsedPayloadOnUrlChange] = useState({})
    const [, userRoleResponse] = useAsync(getUserRole, [])
    const showExportCsvButton = userRoleResponse?.result?.roles?.indexOf('role:super-admin___') !== -1

    // search
    const [searchString, setSearchString] = useState(undefined)
    const [searchApplied, setSearchApplied] = useState(false)

    // filters
    const [masterFilters, setMasterFilters] = useState({
        appStatus: [],
        projects: [],
    })
    const [jobCount, setJobCount] = useState(0)
    //  const [checkingUserRole, userRoleResponse] = useAsync(getUserRole, [])

    useEffect(() => {
        // set search data
        const searchQuery = location.search
        const queryParams = queryString.parse(searchQuery)
        if (queryParams.search) {
            setSearchString(queryParams.search)
            setSearchApplied(true)
        }

        // Payload parsed from url
        const payloadParsedFromUrl = updatedParsedPayloadOnUrlChange()

        // fetch master filters data and some master data
        getJobsInitData(payloadParsedFromUrl)
            .then((initData) => {
                setMasterFilters(initData.filters)
                setDataStateType(JobListViewType.LIST)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setDataStateType(JobListViewType.ERROR)
                setErrorResponseCode(errors.code)
            })
    }, [])

    useEffect(() => {
        updatedParsedPayloadOnUrlChange()
    }, [location.search])

    const updatedParsedPayloadOnUrlChange = () => {
        const payloadParsedFromUrl = onRequestUrlChange(masterFilters, setMasterFilters, location.search)
        setParsedPayloadOnUrlChange(payloadParsedFromUrl)

        return payloadParsedFromUrl
    }

    function openJobCreateModel() {
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
                            isJobView={true}
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

    const applyFilter = (type: string, list: FilterOption[], selectedAppTab: string = undefined): void => {
        const query = populateQueryString(location.search)
        const checkedItems = list.filter((item) => item.isChecked)
        const ids = checkedItems.map((item) => item.key)

        query[type] = ids.toString()
        query['offset'] = 0

        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryString.stringify(query)}`)
    }

    const handleAppSearchOperation = (_searchString: string): void => {
        const query = populateQueryString(location.search)
        if (_searchString) {
            query['search'] = _searchString
            query['offset'] = 0
        } else {
            delete query['search']
            delete query['offset']
        }

        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryString.stringify(query)}`)
    }

    const removeFilter = (filter, filterType: string): void => {
        const query = populateQueryString(location.search)
        query['offset'] = 0
        query[filterType] = query[filterType]
            .split(',')
            .filter((item) => item !== filter.key.toString())
            .toString()

        if (query[filterType] == '') {
            delete query[filterType]
        }

        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryString.stringify(query)}`)
    }

    const removeAllFilters = (): void => {
        const query = populateQueryString(location.search)
        query['offset'] = 0
        delete query['team']
        delete query['appStatus']
        delete query['search']

        //delete search string
        setSearchApplied(false)
        setSearchString('')

        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryString.stringify(query)}`)
    }

    const sortJobList = (key: string): void => {
        const query = populateQueryString(location.search)
        query['orderBy'] = key
        query['sortOrder'] = query['sortOrder'] == OrderBy.DESC ? OrderBy.ASC : OrderBy.DESC

        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryString.stringify(query)}`)
    }

    const searchApp = (event: React.FormEvent) => {
        event.preventDefault()
        setSearchApplied(true)
        handleAppSearchOperation(searchString)
    }

    const onChangeSearchString = (event: React.ChangeEvent<HTMLInputElement>): void => {
        let str = event.target.value || ''
        str = str.toLowerCase()
        setSearchString(str)
    }

    const clearSearch = (): void => {
        setSearchApplied(false)
        setSearchString('')
        handleAppSearchOperation('')
    }

    const onShowHideFilterContent = (show: boolean): void => {
        setPageOverflowEnabled(!show)
    }

    const getJobsDataToExport = async () => getAppListDataToExport(parsedPayloadOnUrlChange, searchString, jobCount)

    function renderMasterFilters() {
        return (
            <div className="search-filter-section">
                <form style={{ display: 'inline' }} onSubmit={searchApp}>
                    <div className="search">
                        <Search className="search__icon icon-dim-18" />
                        <input
                            data-testid="Search-by-job-name"
                            type="text"
                            name="app_search_input"
                            autoComplete="off"
                            value={searchString}
                            placeholder="Search by job name"
                            className="search__input bcn-1"
                            onChange={onChangeSearchString}
                        />
                        {searchApplied && (
                            <button className="flex search__clear-button" type="button" onClick={clearSearch}>
                                <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                            </button>
                        )}
                    </div>
                </form>
                <div className="app-list-filters filters">
                    <Filter
                        list={masterFilters.appStatus}
                        labelKey="label"
                        buttonText={JobsFilterTypeText.StatusText}
                        placeholder={JobsFilterTypeText.SearchStatus}
                        searchable
                        multi
                        type={JobsFilterTypeText.APP_STATUS}
                        applyFilter={applyFilter}
                        onShowHideFilterContent={onShowHideFilterContent}
                        isFirstLetterCapitalize={true}
                        dataTestId="job-status-filter"
                    />
                    <span className="filter-divider" />
                    <Filter
                        list={masterFilters.projects}
                        labelKey="label"
                        buttonText={JobsFilterTypeText.ProjectText}
                        placeholder={JobsFilterTypeText.SearchProject}
                        searchable
                        multi
                        type={JobsFilterTypeText.PROJECT}
                        applyFilter={applyFilter}
                        onShowHideFilterContent={onShowHideFilterContent}
                        dataTestId="job-projects-filter"
                    />
                    {showExportCsvButton && (
                        <>
                            <span className="filter-divider" />
                            <ExportToCsv
                                className="ml-10"
                                apiPromise={getJobsDataToExport}
                                fileName={FILE_NAMES.Jobs}
                                disabled={!jobCount}
                            />
                        </>
                    )}
                </div>
            </div>
        )
    }

    const appliedFilterChip = (key: string) => {
        let filterType = ''
        let _filterKey = ''
        if (key == JobsStatusConstants.PROJECT.pluralLower) {
            filterType = JobsFilterTypeText.PROJECT
            _filterKey = JobsStatusConstants.PROJECT.lowerCase
        } else if (key == JobsStatusConstants.APP_STATUS.noSpaceLower) {
            filterType = JobsFilterTypeText.APP_STATUS
            _filterKey = JobsStatusConstants.APP_STATUS.normalText
        }

        return masterFilters[key].map((filter) => {
            if (filter.isChecked) {
                return (
                    <div key={filter.key} className="saved-filter">
                        <span className="fw-6 mr-5">{_filterKey}</span>
                        <span className="saved-filter-divider"></span>
                        <span className="ml-5">{filter.label}</span>
                        <button
                            type="button"
                            className="saved-filter__close-btn"
                            onClick={() => removeFilter(filter, filterType)}
                        >
                            <i className="fa fa-times-circle" aria-hidden="true"></i>
                        </button>
                    </div>
                )
            }
        })
    }
    const renderAppliedFilters = () => {
        const keys = Object.keys(masterFilters)
        const shouldRenderFilterChips = keys.some((key) => masterFilters[key].some((filter) => filter.isChecked))

        return (
            shouldRenderFilterChips && (
                <div className="saved-filters__wrap dc__position-rel">
                    {keys.map((key) => appliedFilterChip(key))}
                    <button type="button" className="saved-filters__clear-btn fs-13" onClick={removeAllFilters}>
                        Clear All Filters
                    </button>
                </div>
            )
        )
    }

    return (
        <div className="jobs-view-container">
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
                    <HeaderWithCreateButton headerName="Jobs" isSuperAdmin={true} />
                    {renderCreateJobRouter()}
                    <JobListContainer
                        payloadParsedFromUrl={parsedPayloadOnUrlChange}
                        clearAllFilters={removeAllFilters}
                        sortJobList={sortJobList}
                        jobListCount={jobCount}
                        isSuperAdmin={true}
                        openJobCreateModel={openJobCreateModel}
                        setJobCount={setJobCount}
                        renderMasterFilters={renderMasterFilters}
                        renderAppliedFilters={renderAppliedFilters}
                    />
                </>
            )}
        </div>
    )
}
