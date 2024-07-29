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

import React, { useEffect, useState } from 'react'
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
    ErrorScreenManager,
    showError,
    stopPropagation,
    ServerErrors,
    useAsync,
    DevtronProgressing,
    useMainContext,
    HeaderWithCreateButton,
    SearchBar,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'
import * as queryString from 'query-string'
import { URLS } from '../../../config'
import { Filter, FilterOption } from '../../common'
import { JobListViewType, JobsFilterTypeText, JobsStatusConstants } from '../Constants'
import JobListContainer from './JobListContainer'
import { OrderBy } from '../../app/list/types'
import { onRequestUrlChange, populateQueryString } from '../Utils'
import { AddNewApp } from '../../app/create/CreateApp'
import { getAppListDataToExport, getJobsInitData } from '../Service'
import { getUserRole } from '../../../Pages/GlobalConfigurations/Authorization/authorization.service'
import ExportToCsv from '../../common/ExportToCsv/ExportToCsv'
import { FILE_NAMES } from '../../common/ExportToCsv/constants'
import '../../app/list/list.scss'

export default function JobsList() {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { setPageOverflowEnabled } = useMainContext()
    const [dataStateType, setDataStateType] = useState(JobListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [parsedPayloadOnUrlChange, setParsedPayloadOnUrlChange] = useState({})
    const [, userRoleResponse] = useAsync(getUserRole, [])
    const showExportCsvButton = userRoleResponse?.result?.roles?.indexOf('role:super-admin___') !== -1

    // search
    const { searchKey = '', handleSearch, clearFilters } = useUrlFilters()
    // filters
    const [masterFilters, setMasterFilters] = useState({
        appStatus: [],
        projects: [],
        environments: [],
    })
    const [jobCount, setJobCount] = useState(0)

    useEffect(() => {
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
                            isJobView
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

    const sortJobList = (key: string): void => {
        const query = populateQueryString(location.search)
        query['orderBy'] = key
        query['sortOrder'] = query['sortOrder'] == OrderBy.DESC ? OrderBy.ASC : OrderBy.DESC

        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryString.stringify(query)}`)
    }

    const onShowHideFilterContent = (show: boolean): void => {
        setPageOverflowEnabled(!show)
    }

    const getJobsDataToExport = async () => getAppListDataToExport(parsedPayloadOnUrlChange, searchKey, jobCount)

    function renderMasterFilters() {
        return (
            <div className="search-filter-section">
                <SearchBar
                    initialSearchText={searchKey}
                    containerClassName="dc__mxw-250 flex-grow-1"
                    handleEnter={handleSearch}
                    inputProps={{
                        placeholder: 'Search by job name',
                    }}
                    dataTestId="Search-by-job-name"
                />
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
                        isFirstLetterCapitalize
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
                    <span className="filter-divider" />
                    <Filter
                        list={masterFilters.environments}
                        labelKey="label"
                        buttonText={JobsFilterTypeText.EnvironmentText}
                        placeholder={JobsFilterTypeText.SearchEnvironment}
                        searchable
                        multi
                        type={JobsFilterTypeText.ENVIRONMENT}
                        applyFilter={applyFilter}
                        onShowHideFilterContent={onShowHideFilterContent}
                        dataTestId="job-environments-filter"
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
        } else {
            filterType = JobsFilterTypeText.ENVIRONMENT
            _filterKey = JobsStatusConstants.ENVIRONMENT.lowerCase
        }

        return masterFilters[key].map((filter) => {
            if (filter.isChecked) {
                return (
                    <div key={filter.key} className="saved-filter">
                        <span className="fw-6 mr-5">{_filterKey}</span>
                        <span className="saved-filter-divider" />
                        <span className="ml-5">{filter.label}</span>
                        <button
                            type="button"
                            className="saved-filter__close-btn"
                            onClick={() => removeFilter(filter, filterType)}
                        >
                            <i className="fa fa-times-circle" aria-hidden="true" />
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
                    <button type="button" className="saved-filters__clear-btn fs-13" onClick={clearFilters}>
                        Clear All Filters
                    </button>
                </div>
            )
        )
    }

    if (dataStateType === JobListViewType.ERROR) {
        return <ErrorScreenManager code={errorResponseCode} />
    }

    return (
        <div className="jobs-view-container h-100 bcn-0">
            {dataStateType === JobListViewType.LOADING && (
                <div className="w-100 h-100vh">
                    <DevtronProgressing parentClasses="h-100 w-100 flex bcn-0" classes="icon-dim-80" />
                </div>
            )}
            {dataStateType === JobListViewType.LIST && (
                <>
                    <HeaderWithCreateButton headerName="Jobs" />
                    {renderCreateJobRouter()}
                    <JobListContainer
                        payloadParsedFromUrl={parsedPayloadOnUrlChange}
                        clearAllFilters={clearFilters}
                        sortJobList={sortJobList}
                        jobListCount={jobCount}
                        isSuperAdmin
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
