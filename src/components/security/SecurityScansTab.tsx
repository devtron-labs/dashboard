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

import { Component } from 'react'
import dayjs from 'dayjs'
import { RouteComponentProps } from 'react-router-dom'
import {
    showError,
    ErrorScreenManager as ErrorScreen,
    GenericEmptyState,
    DEFAULT_BASE_PAGE_SIZE,
    GenericFilterEmptyState,
    ZERO_TIME_STRING,
    DATE_TIME_FORMATS,
    EMPTY_STATE_STATUS,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { ReactComponent as ICDevtron } from '../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { getInitData, getSecurityScanList } from './security.service'
import { Option as SelectSingleOption } from '../v2/common/ReactSelect.utils'
import { DropdownIndicator, styles, ValueContainer, Option } from './security.util'
import { ScanDetailsModal, Pagination } from '../common'
import { ViewType } from '../../config'
import { ReactSelectOptionType, SecurityScansTabState } from './security.types'
import AppNotDeployed from '../../assets/img/app-not-deployed.png'

export class SecurityScansTab extends Component<RouteComponentProps<{}>, SecurityScansTabState> {
    constructor(props) {
        super(props)
        this.state = {
            responseCode: 0,
            view: ViewType.LOADING,
            searchObject: { label: 'application', value: 'appName' },
            searchObjectValue: '',
            searchApplied: false,
            filters: {
                environments: [],
                clusters: [],
                severity: [],
            },
            filtersApplied: {
                environments: [],
                clusters: [],
                severity: [],
            },
            size: 0,
            offset: 0,
            pageSize: DEFAULT_BASE_PAGE_SIZE,
            securityScans: [],
            uniqueId: {
                imageScanDeployInfoId: 0,
                appId: 0,
                envId: 0,
            },
            name: '',
        }
        this.handleSearchChange = this.handleSearchChange.bind(this)
        this.handleFilterChange = this.handleFilterChange.bind(this)
        this.changePage = this.changePage.bind(this)
        this.changePageSize = this.changePageSize.bind(this)
        this.search = this.search.bind(this)
        this.removeAllFilters = this.removeAllFilters.bind(this)
        this.handleObjectTypeChange = this.handleObjectTypeChange.bind(this)
        this.removeFiltersAndSearch = this.removeFiltersAndSearch.bind(this)
        this.removeSearch = this.removeSearch.bind(this)
    }

    componentDidMount() {
        const payload = this.createPaylod(this.state.filtersApplied)
        getInitData(payload)
            .then((response) => {
                this.setState({
                    ...response,
                    view: ViewType.FORM,
                })
            })
            .catch((error) => {
                this.setState({ responseCode: error.code, view: ViewType.ERROR })
            })
    }

    callGetSecurityScanList() {
        this.setState({ view: ViewType.LOADING })
        const payload = this.createPaylod(this.state.filtersApplied)
        getSecurityScanList(payload)
            .then((response) => {
                this.setState({
                    ...response.result,
                    securityScans: response.result.securityScans,
                    view: ViewType.FORM,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ responseCode: error.code, view: ViewType.ERROR })
            })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.search !== this.props.location.search) {
            this.callGetSecurityScanList()
        }
    }

    createPaylod(filtersApplied) {
        const searchStr = new URLSearchParams(this.props.location.search)
        const pageSize = searchStr.get('size')
        const offset = searchStr.get('offset')
        const search = searchStr.get('search')
        const payload = {
            offset: Number(offset) || 0,
            size: Number(pageSize) || DEFAULT_BASE_PAGE_SIZE,
            search: search || '',
            cveName: '',
            appName: '',
            objectName: '',
            severity: filtersApplied.severity.map((s) => s.value),
            clusterIds: filtersApplied.clusters.map((s) => s.value),
            envIds: filtersApplied.environments.map((s) => s.value),
        }
        if (this.state.searchObject) {
            payload[this.state.searchObject.value] = search
        }
        return payload
    }

    handleSearchChange(event) {
        this.setState({ searchObjectValue: event.target.value })
    }

    handleFilterChange(filterType, selections: any): void {
        const filtersApplied = {
            ...this.state.filtersApplied,
            [filterType]: selections || [],
        }
        this.setState({ filtersApplied, view: ViewType.LOADING }, () => {
            this.callGetSecurityScanList()
        })
    }

    handleFilterRemove(filterType: string, deletion: ReactSelectOptionType) {
        const filters = this.state.filtersApplied[filterType].filter((item) => item.value !== deletion.value)
        const filtersApplied = {
            ...this.state.filtersApplied,
            [filterType]: filters,
        }
        this.setState(
            {
                filtersApplied,
                view: ViewType.LOADING,
            },
            () => {
                this.callGetSecurityScanList()
            },
        )
    }

    removeAllFilters() {
        this.setState(
            {
                filtersApplied: {
                    clusters: [],
                    environments: [],
                    severity: [],
                },
                view: ViewType.LOADING,
            },
            () => {
                this.callGetSecurityScanList()
            },
        )
    }

    removeSearch() {
        const searchParams = new URLSearchParams(this.props.location.search)
        searchParams.set('search', '')
        this.props.history.push(`${this.props.match.url}?${searchParams.toString()}`)
        this.setState(
            {
                searchApplied: false,
                searchObjectValue: '',
                view: ViewType.LOADING,
            },
            () => {
                this.callGetSecurityScanList()
            },
        )
    }

    removeFiltersAndSearch() {
        const searchParams = new URLSearchParams(this.props.location.search)
        searchParams.set('search', '')
        this.props.history.push(`${this.props.match.url}?${searchParams.toString()}`)
        this.setState(
            {
                filtersApplied: {
                    clusters: [],
                    environments: [],
                    severity: [],
                },
                searchApplied: false,
                searchObjectValue: '',
                view: ViewType.LOADING,
            },
            () => {
                this.callGetSecurityScanList()
            },
        )
    }

    handleObjectTypeChange(selected) {
        this.setState({ searchObject: selected }, () => {
            if (this.state.searchObjectValue) {
                this.setState({ searchObjectValue: '', searchApplied: false }, () => {
                    this.callGetSecurityScanList()
                })
            }
        })
    }

    search(e) {
        const searchParams = new URLSearchParams(this.props.location.search)
        searchParams.set('search', e.target.value)
        searchParams.set('offset', '0')
        this.props.history.push(`${this.props.match.url}?${searchParams.toString()}`)
        this.setState({ searchApplied: true }, () => {
            this.callGetSecurityScanList()
        })
    }

    changePage(newPageNo: number): void {
        const newOffset = this.state.pageSize * (newPageNo - 1)
        const searchStr = new URLSearchParams(this.props.location.search)
        const pageSize = searchStr.get('size')
        let newSearchStr = ''
        if (newOffset) {
            newSearchStr = `offset=${newOffset}`
        }
        if (pageSize) {
            newSearchStr = `${newSearchStr}&&size=${pageSize}`
        }
        this.props.history.push(`${this.props.match.url}?${newSearchStr}`)
    }

    changePageSize(newPageSize: number): void {
        const newSearchStr = `size=${newPageSize}`
        this.props.history.push(`${this.props.match.url}?${newSearchStr}`)
    }

    renderSavedFilters() {
        const filters = ['clusters', 'environments', 'severity']
        let count = 0
        return (
            <div className="flex left flex-1 pt-10 pb-10 pl-18 pr-18 flex-wrap">
                {filters.map((filter) => {
                    return (
                        <>
                            {this.state.filtersApplied[filter].map((cluster) => {
                                count++
                                return (
                                    <div key={cluster.value} className="saved-filter">
                                        {cluster.label}
                                        <button
                                            type="button"
                                            className="dc__saved-filter__close-btn pt-4 pb-4"
                                            onClick={() => {
                                                this.handleFilterRemove(filter, cluster)
                                            }}
                                        >
                                            <Close className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                                        </button>
                                    </div>
                                )
                            })}
                        </>
                    )
                })}
                {count > 0 ? (
                    <button
                        type="button"
                        className="saved-filters__clear-btn"
                        onClick={() => {
                            this.removeAllFilters()
                        }}
                    >
                        Clear All Filters
                    </button>
                ) : null}
            </div>
        )
    }

    renderFilters() {
        const filterTypes = ['severity', 'clusters', 'environments']
        return (
            <div className="security-scan__filters">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        this.search(e)
                    }}
                    className="flex-1 flex mr-24"
                >
                    <div className="dc__search-with-dropdown">
                        <ReactSelect
                            className="search-with-dropdown__dropdown"
                            isMulti={false}
                            isSearchable={false}
                            isClearable={false}
                            value={this.state.searchObject}
                            onChange={this.handleObjectTypeChange}
                            hideSelectedOptions={false}
                            options={[
                                { label: 'Application', value: 'appName' },
                                { label: 'Vulnerability', value: 'cveName' },
                                { label: 'Deployment Object', value: 'objectName' },
                            ]}
                            components={{
                                DropdownIndicator,
                                Option: SelectSingleOption,
                            }}
                            styles={{
                                ...styles,
                                container: (base) => {
                                    return {
                                        ...base,
                                        height: '36px',
                                    }
                                },
                                control: (base) => ({
                                    ...base,
                                    border: 'none',
                                    minHeight: '36px',
                                }),
                            }}
                        />
                        <Search className="icon-dim-20 ml-7" />
                        <input
                            autoComplete="off"
                            type="text"
                            className="search-with-dropdown__search"
                            data-testid="search-in-security-scan"
                            tabIndex={1}
                            value={this.state.searchObjectValue}
                            placeholder={`Search ${this.state.searchObject.label}`}
                            onKeyDown={(e) => {
                                if (e.keyCode === 13) {
                                    this.search(e)
                                }
                            }}
                            onChange={this.handleSearchChange}
                        />
                        {this.state.searchApplied ? (
                            <Close className="icon-dim-20 cursor icon-n4 mr-5" onClick={this.removeSearch} />
                        ) : null}
                    </div>
                </form>
                <div className="flexbox">
                    {filterTypes.map((filter, index) => {
                        return (
                            <ReactSelect
                                key={filter}
                                className={`dc__security-scan__filter dc__security-scan__filter--${filter}`}
                                name={filter}
                                tabIndex={index + 2}
                                isMulti
                                isClearable={false}
                                value={this.state.filtersApplied[filter]}
                                options={this.state.filters[filter]}
                                placeholder={`${filter}`}
                                hideSelectedOptions={false}
                                onChange={(selected) => this.handleFilterChange(filter, selected)}
                                components={{
                                    DropdownIndicator,
                                    ValueContainer,
                                    Option,
                                }}
                                styles={{
                                    container: (base) => {
                                        return {
                                            ...base,
                                            height: '36px',
                                        }
                                    },
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '36px',
                                    }),
                                    ...styles,
                                }}
                            />
                        )
                    })}
                </div>
            </div>
        )
    }

    handleClose = () => {
        this.setState({ uniqueId: { appId: 0, imageScanDeployInfoId: 0, envId: 0 } })
    }

    renderModal() {
        if (this.state.uniqueId.appId) {
            return (
                <ScanDetailsModal
                    {...this.props}
                    showAppInfo
                    uniqueId={this.state.uniqueId}
                    name={this.state.name}
                    close={this.handleClose}
                />
            )
        }
    }

    renderPagination() {
        if (this.state.size > DEFAULT_BASE_PAGE_SIZE) {
            return (
                <Pagination
                    size={this.state.size}
                    pageSize={this.state.pageSize}
                    offset={this.state.offset}
                    changePage={this.changePage}
                    changePageSize={this.changePageSize}
                />
            )
        }
    }

    renderHeader = () => (
        <div className="table__row-grid display-grid dc__border-bottom dc__gap-16 px-20 w-100-imp py-4 dc__position-sticky dc__top-77 bcn-0">
            <span className="icon-dim-24" />
            <span className="fs-12 lh-20 fw-6 cn-7">APP NAME</span>
            <span className="fs-12 lh-20 fw-6 cn-7">ENVIRONMENTS</span>
            <span className="fs-12 lh-20 fw-6 cn-7">SECURITY SCAN</span>
            <span className="fs-12 lh-20 fw-6 cn-7">SCANNED ON</span>
        </div>
    )

    renderTable() {
        if (this.state.view === ViewType.LOADING) {
            const arrayLoading = Array.from(Array(3)).map((index) => index)
            return (
                <>
                    {this.renderHeader()}
                    {arrayLoading.map(() => (
                        <div className="display-grid table__row-grid show-shimmer-loading dc__gap-16 px-20 py-10">
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading" />
                            <span className="child child-shimmer-loading w-250" />
                        </div>
                    ))}
                </>
            )
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="flex" style={{ height: 'calc(100vh - 212px)' }}>
                    <ErrorScreen code={this.state.responseCode} />
                </div>
            )
        }
        if (
            this.state.view === ViewType.FORM &&
            this.state.size === 0 &&
            (this.state.searchApplied ||
                this.state.filtersApplied.severity.length ||
                this.state.filtersApplied.environments.length ||
                this.state.filtersApplied.clusters.length)
        ) {
            return (
                <div className="dc__position-rel" style={{ height: 'calc(100vh - 200px)' }}>
                    <GenericFilterEmptyState handleClearFilters={this.removeFiltersAndSearch} />
                </div>
            )
        }
        if (this.state.view === ViewType.FORM && this.state.size === 0) {
            return (
                <div className="dc__position-rel" style={{ height: 'calc(100vh - 175px)' }}>
                    <GenericEmptyState image={AppNotDeployed} title={EMPTY_STATE_STATUS.SECURITY_SCANS.TITLE} />
                </div>
            )
        }
        return (
            <div>
                {this.renderHeader()}
                {this.state.securityScans.map((scan) => {
                    const total = scan.severityCount.critical + scan.severityCount.moderate + scan.severityCount.low
                    return (
                        <div
                            className="table__row table__row-grid display-grid dc__gap-16 px-20 w-100-imp py-12 dc__align-items-center dc__hover-n50"
                            onClick={(event) => {
                                event.stopPropagation()
                                this.setState({
                                    name: scan.name,
                                    uniqueId: {
                                        imageScanDeployInfoId: scan.imageScanDeployInfoId,
                                        appId: scan.appId,
                                        envId: scan.envId,
                                    },
                                })
                            }}
                        >
                            <ICDevtron className="icon-dim-24 dc__no-shrink" />
                            <span className="cb-5 dc__ellipsis-right lh-20" data-testid={`scanned-app-list-${scan.name}`}>
                                {scan.name}
                            </span>
                            <span className="dc__ellipsis-right lh-20">{scan.environment}</span>
                            <div className="dc__ellipsis-right">
                                {total === 0 ? <span className="severity-chip severity-chip--passed dc__w-fit-content">Passed</span> : null}
                                {scan.severityCount.critical !== 0 ? (
                                    <span className="severity-chip severity-chip--critical dc__w-fit-content">{scan.severityCount.critical} Critical</span>
                                ) : null}
                                {scan.severityCount.critical === 0 && scan.severityCount.moderate !== 0 ? (
                                    <span className="severity-chip severity-chip--medium dc__w-fit-content">{scan.severityCount.moderate} Moderate</span>
                                ) : null}
                                {scan.severityCount.critical === 0 &&
                                scan.severityCount.moderate === 0 &&
                                scan.severityCount.low !== 0 ? (
                                    <span className="severity-chip severity-chip--low dc__w-fit-content">{scan.severityCount.low} Low</span>
                                ) : null}
                            </div>
                            <span data-testid="image-scan-security-check lh-20">
                                {scan.lastExecution && scan.lastExecution !== ZERO_TIME_STRING
                                    ? dayjs(scan.lastExecution).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)
                                    : ''}
                            </span>
                        </div>
                    )
                })}
                {this.renderPagination()}
            </div>
        )
    }

    render() {
        return (
            <div className="security-scan bcn-0">
                {this.renderFilters()}
                {this.renderSavedFilters()}
                {this.renderTable()}
                {this.renderModal()}
            </div>
        )
    }
}
