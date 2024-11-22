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
import {
    showError,
    Progressing,
    sortCallback,
    Reload,
    SearchBar,
    getEnvironmentListMinPublic,
} from '@devtron-labs/devtron-fe-common-lib'
import { SecurityPolicyEdit } from './SecurityPolicyEdit'
import { ViewType } from '../../config'
import { SecurityPolicyEnvironmentState } from './security.types'

export class SecurityPolicyEnvironment extends Component<
    RouteComponentProps<{ envId: string }>,
    SecurityPolicyEnvironmentState
> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            envSearch: '',
            envList: [],
        }
        this.handleSearchChange = this.handleSearchChange.bind(this)
    }

    componentDidMount() {
        getEnvironmentListMinPublic()
            .then((response) => {
                let list = response.result || []
                list = list.map((env) => {
                    return {
                        id: env.id,
                        name: env.environment_name,
                        namespace: env.namespace,
                    }
                })
                list = list.sort((a, b) => sortCallback('name', a, b))
                this.setState({ envList: list, view: ViewType.FORM })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR })
            })
    }

    handleSearchChange(_searchText: string) {
        this.setState({ envSearch: _searchText })
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
                                initialSearchText={this.state.envSearch}
                                containerClassName="flex-grow-1"
                                handleEnter={this.handleSearchChange}
                                inputProps={{
                                    placeholder: 'Search Environment',
                                    autoFocus: true
                                }}
                                dataTestId="security-policy-environment-search"
                            />
                        </td>
                    </tr>
                    {this.state.envList
                        .filter((env) => env.name.includes(this.state.envSearch))
                        .map((env) => {
                            return (
                                <tr
                                    key={env.id}
                                    className="security-policy-cluster__content-row"
                                    data-testid="security-policy-environment-list"
                                >
                                    <td className="pl-20 pr-20 pt-16 pb-16">
                                        <NavLink to={`${url}/${env.id}`}>{env.name}</NavLink>
                                    </td>
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        )
    }

    renderContent() {
        if (this.props.match.params.envId) {
            return (
                <SecurityPolicyEdit
                    level="environment"
                    id={Number(`${this.props.match.params.envId}`)}
                    key={`${this.props.match.params.envId}`}
                />
            )
        }
        return (
            <>
                <div className="ml-24 mr-24 mt-20 mb-20">
                    <h1 className="form__title" data-testid="environment-security-policy-heading">
                        Environment Security Policies
                    </h1>
                    <p className="form__subtitle" data-testid="environment-security-policy-subtitle">
                        Manage security policies for specific environment. Global policies would be applicable if not
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
