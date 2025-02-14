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
import { Progressing, VisibleModal, CustomInput } from '@devtron-labs/devtron-fe-common-lib'
import { getCVEPolicies } from './security.service'
import { CVE_ID_NOT_FOUND, ViewType } from '../../config'
import { AddCveModalProps, AddCveModalState, ClusterEnvironment, VulnerabilityAction } from './security.types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outline.svg'
export class AddCveModal extends Component<AddCveModalProps, AddCveModalState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.FORM,
            cve: '',
            policy: VulnerabilityAction.allow,
            clusters: [],
            isCveError: false,
        }
        this.handleCveChange = this.handleCveChange.bind(this)
        this.handlePolicyChange = this.handlePolicyChange.bind(this)
        this.searchCVE = this.searchCVE.bind(this)
    }

    handleCveChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ cve: event.target.value })
    }

    handlePolicyChange(event) {
        this.setState({ policy: event.target.value })
    }

    saveCVE() {
        const regex = new RegExp(/^CVE-\d{4}-\d{4,7}/)
        const cve = this.state.cve.toUpperCase()
        if (regex.test(cve)) {
            this.props.saveCVE(this.state.cve, this.state.policy, this.props.envId)
        } else {
            this.setState({ isCveError: true })
        }
    }

    searchCVE(event): void {
        this.setState({ view: ViewType.LOADING })
        getCVEPolicies(this.state.cve)
            .then((response) => {
                this.setState({
                    cve: this.state.cve,
                    clusters: response.result.clusters,
                    view: ViewType.FORM,
                })
            })
            .catch((error) => {
                this.setState({ view: ViewType.FORM, isCveError: true })
            })
    }

    renderHeader() {
        return (
            <div className="modal__header ml-24 mr-24">
                <h1 className="modal__title">Add CVE</h1>
                <button type="button" className="dc__transparent " onClick={this.props.close}>
                    <Close className="icon-dim-20" />
                </button>
            </div>
        )
    }

    renderList() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="whitelist-cve__empty-state flex column">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.clusters.length) {
            return (
                <div className="ml-24 mr-24">
                    <h3 className="whitelist-cve__section-name">This CVE policy is overriden at below levels</h3>
                    <ul className="whitelist-cve__nested-list nested-list">
                        {this.state.clusters.map((cluster) => {
                            return (
                                <li key={cluster.name} className="">
                                    <p className="nested-list__item flexbox flex-justify">
                                        <span>cluster/{cluster.name}</span>
                                        <span>{cluster.policy}</span>
                                    </p>
                                    {cluster.isCollapsed ? null : (
                                        <ul className="nested-list">
                                            {cluster.environments.map((env: ClusterEnvironment) => {
                                                return (
                                                    <li key={env.name} className="nested-list__pl">
                                                        <p className="nested-list__item flexbox flex-justify">
                                                            <span>env/{env.name}</span>
                                                            <span>{env.policy}</span>
                                                        </p>
                                                        {env.isCollapsed ? null : (
                                                            <ul>
                                                                {env.applications.map((app) => {
                                                                    return (
                                                                        <li key={env.name} className="nested-list__pl">
                                                                            <p className="nested-list__item flexbox flex-justify">
                                                                                <span>app/{app.name}</span>
                                                                                <span>{app.policy}</span>
                                                                            </p>
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )
        }

        return (
            <div className="ml-24 mr-24">
                <div className="whitelist-cve__empty-state flex column">
                    <Info className="icon-dim-32 mb-8" />
                    <p className="whitelist-cve__empty-state-text">Search CVE-ID to view configured CVE policies</p>
                </div>
            </div>
        )
    }

    render() {
        return (
            <VisibleModal className="">
                <div className="modal__body modal__body--w-600 modal__body--no-padding">
                    {this.renderHeader()}
                    <form
                        className="whitelist-cve"
                        onSubmit={(event) => {
                            event.preventDefault()
                        }}
                    >
                        <div className="whitelist-cve__cve-id ml-24 mr-24 mb-20">
                            <label className="dc__block flex-1 mb-5 mr-16 ">
                                <CustomInput
                                    name="cve"
                                    label="CVE ID"
                                    autoFocus
                                    placeholder="Enter CVE ID"
                                    value={this.state.cve}
                                    onChange={this.handleCveChange}
                                    required
                                    error={this.state.isCveError && CVE_ID_NOT_FOUND}
                                />
                            </label>
                        </div>
                        <div className="ml-24 mr-24 flexbox" tabIndex={2}>
                            <label className="form__label form__label--flex cursor mr-8">
                                <input
                                    type="radio"
                                    name="policy"
                                    value="allow"
                                    tabIndex={1}
                                    onClick={this.handlePolicyChange}
                                    checked={this.state.policy === VulnerabilityAction.allow}
                                />
                                &nbsp;
                                <span className="ml-10 mr-5">Allow</span>
                            </label>
                            <label className="form__label form__label--flex cursor ml-10">
                                <input
                                    type="radio"
                                    name="policy"
                                    value="block"
                                    tabIndex={2}
                                    onClick={this.handlePolicyChange}
                                    checked={this.state.policy === VulnerabilityAction.block}
                                />
                                <span className="ml-10 mr-5">Block always</span>
                            </label>
                            <label className="form__label form__label--flex cursor ml-10">
                                <input
                                    type="radio"
                                    name="policy"
                                    value="blockiffixed"
                                    tabIndex={2}
                                    onClick={this.handlePolicyChange}
                                    checked={this.state.policy === VulnerabilityAction.blockiffixed}
                                />
                                <span className="ml-10 mr-5">Block if fix is available</span>
                            </label>
                        </div>
                        <div className="flex right form-row">
                            <button
                                type="button"
                                tabIndex={3}
                                className="cta cancel mb-16 mr-16"
                                onClick={this.props.close}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                tabIndex={4}
                                className="cta mb-16 mr-24"
                                onClick={(event) => {
                                    this.saveCVE()
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </VisibleModal>
        )
    }
}
