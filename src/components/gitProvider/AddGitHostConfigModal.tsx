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
import { CustomInput, showError } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { saveGitHost } from './gitProvider.service'

interface GitHostConfigModalProps {
    closeGitConfigModal: () => void
    getHostList: () => void
}

interface GitHostConfigModalState {
    name: string
}

export class GitHostConfigModal extends Component<GitHostConfigModalProps, GitHostConfigModalState> {
    constructor(props) {
        super(props)
        this.state = {
            name: '',
        }
    }

    onSaveGitProviderName = async () => {
        // let gitHostId = gitHost.value.value;
        const gitHostPayload = {
            name: this.state.name,
            active: true,
        }
        try {
            const { result } = await saveGitHost(gitHostPayload)
            if (result) {
                this.props.getHostList()
                // gitHostId = result;
                this.props.closeGitConfigModal()
            }
        } catch (error) {
            showError(error)
        }
    }

    handleFilterInput = (event): void => {
        this.setState({
            name: event.target.value,
        })
    }

    render() {
        return (
            <div className=" modal__body modal__body--p-0 ">
                <div className="modal__header pt-20 pl-20 pr-20 ">
                    <h1 className=" modal__title__fs-16 fs-16 fw-6 cn-9">Add git host</h1>
                    <button type="button" className="dc__transparent p-0" onClick={this.props.closeGitConfigModal}>
                        <Close className="icon-dim-20" />
                    </button>
                </div>
                <div className="pb-40 pl-20 pr-20">
                    <CustomInput
                        label="Git host name"
                        name="app-name"
                        value={this.state.name}
                        onChange={this.handleFilterInput}
                        placeholder="Enter name"
                        autoFocus
                        required
                    />
                </div>
                <div className="flex right pt-12 pb-12 pl-20 pr-20">
                    <button
                        type="button"
                        className="cta cancel mr-16"
                        tabIndex={5}
                        onClick={this.props.closeGitConfigModal}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="cta" tabIndex={4} onClick={() => this.onSaveGitProviderName()}>
                        Save
                    </button>
                </div>
            </div>
        )
    }
}
