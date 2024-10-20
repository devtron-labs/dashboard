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

import React, { Component, createContext } from 'react'
import { VisibleModal } from '../Modals/VisibleModal'
import close from '../../Assets/Icon/ic-cross.svg'
import { Progressing } from '../Progressing'
import { DialogFormProps } from './Types'
// TODO: may not need context
const DialogFormContext = createContext({ title: '', isLoading: false, close: (event) => {}, onSave: (event) => {} })

export class DialogForm extends Component<DialogFormProps> {
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
            <DialogFormContext.Provider
                value={{
                    title: this.props.title,
                    isLoading: this.props.isLoading,
                    close: this.props.close,
                    onSave: this.props.onSave,
                }}
            >
                <VisibleModal className="">
                    <div className={`modal__body ${this.props.className || ''}`}>
                        <div className={`modal__header ${this.props.headerClassName || ''}`}>
                            <h1 className="modal__title">{this.props.title}</h1>
                            <button type="button" className="dc__transparent" onClick={this.props.close}>
                                {' '}
                                <img src={close} alt="close" />
                            </button>
                        </div>
                        <DialogFormContext.Consumer>
                            {(context) => (
                                <form
                                    noValidate
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        if (!context.isLoading) {
                                            context.onSave(e)
                                        }
                                    }}
                                >
                                    {this.props.children}
                                </form>
                            )}
                        </DialogFormContext.Consumer>
                    </div>
                </VisibleModal>
            </DialogFormContext.Provider>
        )
    }
}

export class DialogFormSubmit extends Component<{ tabIndex: number }> {
    render() {
        return (
            <DialogFormContext.Consumer>
                {(context) => (
                    <button type="submit" className="cta dc__align-right" tabIndex={this.props.tabIndex}>
                        {context.isLoading ? <Progressing /> : this.props.children}
                    </button>
                )}
            </DialogFormContext.Consumer>
        )
    }
}
