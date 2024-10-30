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
import { RouteComponentProps, NavLink } from 'react-router-dom'
import { showError, Progressing, sortCallback, Reload, SearchBar } from '@devtron-labs/devtron-fe-common-lib'
import { SecurityPolicyEdit } from './SecurityPolicyEdit'
import { getClusterListMinNoAuth } from './security.service'
import { ViewType } from '../../config'
import { SecurityPolicyClusterState } from './security.types'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'

export class SecurityPolicyCluster extends Component<
    RouteComponentProps<{ clusterId: string }>,
    SecurityPolicyClusterState
> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            clusterSearch: '',
            clusterList: [],
        }
        this.handleSearchChange = this.handleSearchChange.bind(this)
    }

    componentDidMount() {
        getClusterListMinNoAuth()
            .then((response) => {
                let list = response.result || []
                list = list.map((env) => {
                    return {
                        id: env.id,
                        name: env.cluster_name,
                    }
                })
                list = list.sort((a, b) => sortCallback('name', a, b))
                this.setState({ clusterList: list, view: ViewType.FORM })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR })
            })
    }

    handleSearchChange(_searchText: string) {
        this.setState({ clusterSearch: _searchText})
    }

    renderList() {
        const { url } = this.props.match
        if (this.state.view === ViewType.LOADING) {
            return (
                <div style={{ height: '280px' }}>
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.view === ViewType.LOADING) {
            return <Reload />
        }
        return (
            <table className="security-policy-cluster__table">
                <tbody>
                    <tr>
                        <td className="security-policy-cluster__title w-100">
                            <SearchBar
                                initialSearchText={this.state.clusterSearch}
                                containerClassName="flex-grow-1"
                                handleEnter={this.handleSearchChange}
                                inputProps={{
                                    placeholder: 'Search cluster',
                                    autoFocus: true
                                }}
                                dataTestId="security-policy-cluster-search"
                            />
                        </td>
                    </tr>
                    {this.state.clusterList
                        .filter((cluster) => cluster.name.includes(this.state.clusterSearch))
                        .map((cluster, i) => {
                            return (
                                <tr
                                    key={cluster.id}
                                    className="security-policy-cluster__content-row"
                                    data-testid="select-cluster-from-list"
                                >
                                    <td className="pl-20 pr-20 pt-16 pb-16">
                                        <NavLink to={`${url}/${cluster.id}`}>{cluster.name}</NavLink>
                                    </td>
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        )
    }

    renderContent() {
        if (this.props.match.params.clusterId) {
            return (
                <SecurityPolicyEdit
                    level="cluster"
                    id={Number(`${this.props.match.params.clusterId}`)}
                    key={`${this.props.match.params.clusterId}`}
                />
            )
        }
        return (
            <>
                <div className="ml-24 mr-24 mt-20 mb-20">
                    <h1 className="form__title" data-testid="cluster-security-policy-heading">
                        Cluster Security Policies
                    </h1>
                    <p className="form__subtitle" data-testid="cluster-security-policy-subtitle">
                        Manage security policies for specific clusters. Global policies would be applicable if not
                        denied
                    </p>
                </div>
                <div className="white-card white-card--cluster">{this.renderList()}</div>
            </>
        )
    }

    render() {
        return <>{this.renderContent()}</>
    }
}
