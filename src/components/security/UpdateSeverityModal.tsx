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
import ReactSelect from 'react-select'
import { VisibleModal, Severity } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { VulnerabilityAction } from './security.types'
import { styles, DropdownIndicator } from './security.util'

export interface UpdateSeverityModalProps {
    name: string
    severity: Severity
    close: () => void
    saveSeverity: (severity, policy: VulnerabilityAction) => void
}

export interface UpdateSeverityModalState {
    policy: { label: string; value: VulnerabilityAction }
}

export class UpdateSeverityModal extends Component<UpdateSeverityModalProps, UpdateSeverityModalState> {
    constructor(props) {
        super(props)
        this.state = {
            policy: { label: 'ALLOW', value: VulnerabilityAction.allow },
        }
        this.handleChangeSeverity = this.handleChangeSeverity.bind(this)
    }

    componentDidMount() {}

    handleChangeSeverity(selected): void {
        this.setState({ policy: selected })
    }

    renderHeader() {
        return (
            <div className="modal__header ml-24 mr-24">
                <h1 className="modal__title">Security Policy / {this.props.name}</h1>
                <button type="button" className="dc__transparent " onClick={this.props.close}>
                    <Close className="icon-dim-20" />
                </button>
            </div>
        )
    }

    render() {
        return (
            <VisibleModal className="">
                <div className="modal__body modal__body--w-600 modal__body--no-padding">
                    {this.renderHeader()}
                    <form
                        className="whitelist-cve ml-24 mr-24"
                        onSubmit={(event) => {
                            event.preventDefault()
                        }}
                    >
                        <ReactSelect
                            className="w-100"
                            autoFocus
                            value={this.state.policy}
                            components={{
                                DropdownIndicator,
                            }}
                            // placeholder={`${severity.policy.inherited && !severity.policy.isOverriden ? 'INHERITED' : severity.policy.action}`}
                            styles={{
                                ...styles,
                            }}
                            onChange={this.handleChangeSeverity}
                            options={[
                                { label: 'BLOCK', value: VulnerabilityAction.block },
                                { label: 'ALLOW', value: VulnerabilityAction.allow },
                                { label: 'INHERIT', value: VulnerabilityAction.inherit },
                            ]}
                        />
                        <div className="flex right form-row mt-24">
                            <button
                                type="button"
                                tabIndex={1}
                                className="cta cancel mb-16 mr-16"
                                onClick={this.props.close}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                tabIndex={2}
                                className="cta mb-16"
                                onClick={(event) => {
                                    this.props.saveSeverity(this.props.severity, this.state.policy.value)
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
