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

import React, { Component } from 'react'
import { ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import * as queryString from 'query-string'
import { withRouter } from 'react-router-dom'
import { buildInitState, appListModal, createAppListPayload } from './appList.modal'
import { AppListProps, AppListState, OrderBy, SortBy } from './types'
import { URLS, ViewType } from '../../../config'
import { AppListView } from './AppListView'
import { getAppList } from '../service'
import { AppListViewType } from '../config'
import './list.scss'

class DevtronAppListContainer extends Component<AppListProps, AppListState> {
    abortController: AbortController

    constructor(props) {
        super(props)
        this.state = {
            code: 0,
            view: AppListViewType.LOADING,
            errors: [],
            apps: [],
            size: 0,
            sortRule: {
                key: SortBy.APP_NAME,
                order: OrderBy.ASC,
            },
            showCommandBar: false,
            offset: 0,
            pageSize: 20,
            expandedRow: null,
            isAllExpanded: false,
            isAllExpandable: false,
        }
    }

    componentDidMount() {
        buildInitState(this.props.payloadParsedFromUrl)
            .then((response) => {
                this.setState({
                    code: response.code,
                    apps: [],
                    offset: response.offset,
                    size: 0,
                    pageSize: response.size,
                    sortRule: {
                        key: response.sortBy,
                        order: response.sortOrder,
                    },
                })
            })
            .then(() => {
                this.getAppList(
                    createAppListPayload(this.props.payloadParsedFromUrl, this.props.environmentClusterList),
                )
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                this.setState({ view: AppListViewType.ERROR, code: errors.code })
            })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.payloadParsedFromUrl != this.props.payloadParsedFromUrl) {
            this.getAppList(createAppListPayload(this.props.payloadParsedFromUrl, this.props.environmentClusterList))
        }
    }

    changePage = (pageNo: number): void => {
        const offset = this.state.pageSize * (pageNo - 1)
        const qs = queryString.parse(this.props.location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['offset'] = offset
        const queryStr = queryString.stringify(query)
        const url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}?${queryStr}`
        this.props.history.push(url)
    }

    changePageSize = (size: number): void => {
        const qs = queryString.parse(this.props.location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['offset'] = 0
        query['hOffset'] = 0
        query['pageSize'] = size
        const queryStr = queryString.stringify(query)
        const url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}?${queryStr}`
        this.props.history.push(url)
    }

    expandRow = (id: number): void => {
        this.setState((prevState) => ({ expandedRow: { ...prevState.expandedRow, [id]: true } }))
    }

    closeExpandedRow = (id: number): void => {
        this.setState((prevState) => ({ expandedRow: { ...prevState.expandedRow, [id]: false } }))
    }

    toggleExpandAllRow = (): void => {
        this.setState((prevState) => {
            const _expandedRow = {}
            if (!prevState.isAllExpanded) {
                for (const _app of prevState.apps) {
                    _expandedRow[_app.id] = _app.environments.length > 1
                }
            }

            return { expandedRow: _expandedRow, isAllExpanded: !prevState.isAllExpanded }
        })
    }

    getAppList = (request): void => {
        this.props.updateDataSyncing(true)
        const isSearchOrFilterApplied =
            request.environments?.length ||
            request.teams?.length ||
            request.namespaces?.length ||
            request.appNameSearch?.length ||
            request.appStatuses?.length
        const state = { ...this.state }
        state.view = AppListViewType.LOADING
        state.sortRule = {
            key: request.sortBy,
            order: request.sortOrder,
        }
        state.expandedRow = {}
        state.isAllExpanded = false
        this.setState(state)
        if (this.abortController) {
            this.abortController.abort()
            this.abortController = null
        }

        this.abortController = new AbortController()

        getAppList(request, { signal: this.abortController.signal })
            .then((response) => {
                let view = AppListViewType.LIST
                if (response.result.appCount === 0) {
                    if (isSearchOrFilterApplied) {
                        view = AppListViewType.NO_RESULT
                    } else {
                        view = AppListViewType.EMPTY
                    }
                }
                const state = { ...this.state }
                const apps =
                    response.result && !!response.result.appContainers
                        ? appListModal(response.result.appContainers)
                        : []
                state.code = response.code
                state.apps = apps
                state.isAllExpandable = apps.filter((app) => app.environments.length > 1).length > 0
                state.view = view
                state.offset = request.offset
                state.size = response.result.appCount
                state.pageSize = request.size
                this.setState(state)
                this.abortController = null
                this.props.setAppCount(response.result.appCount)
            })
            .catch((errors: ServerErrors) => {
                if (errors.code) {
                    showError(errors)
                    this.setState({ code: errors.code, view: ViewType.ERROR })
                }
            })
            .finally(() => {
                this.props.updateDataSyncing(false)
            })
    }

    handleEditApp = (appId: number): void => {
        const url = `/app/${appId}/edit`
        this.props.history.push(url)
    }

    redirectToAppDetails = (app, envId: number): string => {
        this.props.setCurrentAppName(app.name)

        if (envId) {
            return `/app/${app.id}/details/${envId}`
        }
        return `/app/${app.id}/trigger`
    }

    render() {
        return (
            <AppListView
                {...this.state}
                match={this.props.match}
                location={this.props.location}
                history={this.props.history}
                expandRow={this.expandRow}
                closeExpandedRow={this.closeExpandedRow}
                sort={this.props.sortApplicationList}
                redirectToAppDetails={this.redirectToAppDetails}
                handleEditApp={this.handleEditApp}
                clearAll={this.props.clearAllFilters}
                changePage={this.changePage}
                changePageSize={this.changePageSize}
                isSuperAdmin={this.props.isSuperAdmin}
                appListCount={this.props.appListCount}
                openDevtronAppCreateModel={this.props.openDevtronAppCreateModel}
                updateDataSyncing={this.props.updateDataSyncing}
                toggleExpandAllRow={this.toggleExpandAllRow}
                isArgoInstalled={this.props.isArgoInstalled}
            />
        )
    }
}

export default withRouter(DevtronAppListContainer)
