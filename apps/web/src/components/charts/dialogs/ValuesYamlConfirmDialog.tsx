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
import { ReactComponent as Warn } from '../../../assets/icons/ic-warning.svg'
import close from '../../../assets/icons/ic-close.svg'

export class ValuesYamlConfirmDialog extends Component<{
    className: string
    title: string
    description: string
    closeOnESC: boolean
    copyYamlToClipboard: (event) => void
    discardYamlChanges: (...args) => void
    close: (event: React.MouseEvent) => void
}> {
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
        if (event.keyCode === 27 && this.props.closeOnESC) {
            this.props.close(event)
        }
    }

    render() {
        return (
            <VisibleModal className="">
                <div className="modal__body">
                    <div className="flexbox flex-justify">
                        <Warn className="modal__main-img" />
                        <img src={close} alt="close" className="icon-dim-24 cursor" onClick={this.props.close} />
                    </div>
                    <div className="modal__body-content">
                        <h1 className="modal__title">{this.props.title}</h1>
                        <p className="fs-13 cn-7 lh-1-54">{this.props.description}</p>
                    </div>
                    <div className="flex right">
                        <button type="button" className="cta cancel mr-16" onClick={this.props.copyYamlToClipboard}>
                            Copy edited yaml
                        </button>
                        <button type="button" className="cta" onClick={this.props.discardYamlChanges}>
                            Discard Changes
                        </button>
                    </div>
                </div>
            </VisibleModal>
        )
    }
}
