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

import { VisibleModal } from '@devtron-labs/devtron-fe-common-lib'
import React, { Component } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'

export interface DeleteCVEModalProps {
    closeDelete: () => void
    delete: () => void
}

export class DeleteCVEModal extends Component<DeleteCVEModalProps, any> {
    constructor(props) {
        super(props)
        this.state = {
            clusters: [
                {
                    name: 'cluster/default_cluster',
                    isCollapsed: false,
                    environments: [
                        {
                            name: 'prod',
                            isCollapsed: false,
                            applications: {
                                name: 'dashoard',
                            },
                        },
                    ],
                },
                {
                    name: 'cluster/default_cluster',
                    isCollapsed: false,
                    environments: [
                        {
                            name: 'devtron-prod',
                            isCollapsed: false,
                            applications: {
                                name: 'blobs',
                            },
                        },
                    ],
                },
                {
                    name: 'cluster/default_cluster',
                    isCollapsed: false,
                    environments: [
                        {
                            name: 'prod',
                            isCollapsed: false,
                            applications: {
                                name: 'orch',
                            },
                        },
                    ],
                },
                {
                    name: 'cluster/default_cluster',
                    isCollapsed: false,
                    environments: [
                        {
                            name: 'prod',
                            isCollapsed: false,
                            applications: {
                                name: 'orch',
                            },
                        },
                    ],
                },
            ],
        }
    }

    renderHeader() {
        return (
            <div className="modal__header">
                <h1 className="modal__title">Delete CVE Policy</h1>
                <button type="button" className="dc__transparent " onClick={this.props.closeDelete}>
                    <Close className="icon-dim-20" />
                </button>
            </div>
        )
    }

    render() {
        return (
            <VisibleModal className="">
                <div className="modal__body modal__body--no-padding">
                    {this.renderHeader()}
                    <p className="mb-20">
                        This policy will not be deleted at below levels as policy for this CVE has been defined
                        separately at below levels.
                    </p>
                    <ul>
                        {this.state.clusters.map((cluster) => {
                            return <li>{cluster.name}</li>
                        })}
                    </ul>
                    <div className="flex right">
                        <button
                            type="button"
                            className="cta cancel cta-cd-delete-modal mr-16"
                            onClick={this.props.closeDelete}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="cta delete cta-cd-delete-modal"
                            onClick={this.props.delete}
                            data-testid="delete-button-for-resource"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </VisibleModal>
        )
    }
}
