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
import { VisibleModal } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTable } from './DeploymentTable'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ViewType } from '../../../../config'

export interface DeploymentTableModalProps {
    close: (event) => void
    rows: any[]
}

export class DeploymentTableModal extends Component<DeploymentTableModalProps, {}> {
    constructor(props) {
        super(props)
        this.escFunction = this.escFunction.bind(this)
    }

    componentDidMount() {
        document.addEventListener('keydown', this.escFunction)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escFunction)
    }

    escFunction(event) {
        if (event.keyCode === 27) {
            this.props.close(event)
        }
    }

    render() {
        return (
            <VisibleModal className="">
                <div className="modal__body" style={{ width: '820px' }}>
                    <div className="modal__header">
                        <h1 className="modal__title">Deployments</h1>
                        <button type="button" className="dc__transparent" onClick={this.props.close}>
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    <DeploymentTable rows={this.props.rows} deploymentTableView={ViewType.FORM} />
                    <div style={{ marginBottom: '40px' }} />
                </div>
            </VisibleModal>
        )
    }
}
