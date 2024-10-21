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

import React, { SyntheticEvent } from 'react'
import ReactDOM from 'react-dom'
import { POP_UP_MENU_MODAL_ID, preventBodyScroll } from '../../Shared'
import { stopPropagation } from '../Helper'

export class VisibleModal extends React.Component<{
    className?: string
    parentClassName?: string
    noBackground?: boolean
    close?: (e) => void
    onEscape?: (e) => void
}> {
    modalRef = document.getElementById('visible-modal')

    constructor(props) {
        super(props)
        this.escFunction = this.escFunction.bind(this)
    }

    escFunction(event) {
        stopPropagation(event)
        if (event.keyCode === 27 || event.key === 'Escape') {
            if (this.props.onEscape) {
                this.props.onEscape(event)
            } else if (this.props.close) {
                this.props.close(event)
            }
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.escFunction)
        // show is also being used in modal (i.e, pop up menu for case where we have noBackground as false, so it works in syc with VisibleModal with noBackground as false)
        this.modalRef.classList.add(this.props.noBackground ? 'show' : 'show-with-bg')
        preventBodyScroll(true)

        if (this.props.parentClassName) {
            this.modalRef.classList.add(this.props.parentClassName)
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escFunction)
        this.modalRef.classList.remove('show')
        this.modalRef.classList.remove('show-with-bg')
        preventBodyScroll(false)

        if (this.props.parentClassName) {
            this.modalRef.classList.remove(this.props.parentClassName)
        }
    }

    handleBodyClick = (e: SyntheticEvent) => {
        const isPopupMenuPresent = document.getElementById(POP_UP_MENU_MODAL_ID)
        if (isPopupMenuPresent) {
            return
        }
        e.stopPropagation()

        this.props.close?.(e)
    }

    render() {
        return ReactDOM.createPortal(
            <div
                className={`visible-modal__body ${this.props.className || ''}`}
                onClick={this.handleBodyClick}
                data-testid="visible-modal-close"
            >
                {this.props.children}
            </div>,
            document.getElementById('visible-modal'),
        )
    }
}
