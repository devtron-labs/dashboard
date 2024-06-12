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

import React from 'react'
import { toast } from 'react-toastify'
import { TOAST_ACCESS_DENIED } from '@devtron-labs/devtron-fe-common-lib'

export class ToastBody extends React.Component<{
    title: string
    subtitle?: string
}> {
    render() {
        return (
            <div className="toast">
                <div className="toast__title">{this.props.title}</div>
                {this.props.subtitle && <div className="toast__subtitle">{this.props.subtitle}</div>}
            </div>
        )
    }
}

export class ToastBody3 extends React.Component<{
    text: string
    onClick: (...args) => void
    buttonText: string
}> {
    render() {
        return (
            <div className="flex left column dc__app-update-toast">
                <span className="info">{this.props.text}</span>
                <button type="button" onClick={this.props.onClick}>
                    {this.props.buttonText}
                </button>
            </div>
        )
    }
}

export class ToastBodyWithButton extends React.Component<{
    title: string
    subtitle?: string
    onClick: (...args) => void
    buttonText: string
}> {
    render() {
        return (
            <div className="toast dc__app-update-toast">
                <div className="toast__title">{this.props.title}</div>
                {this.props.subtitle && <div className="toast__subtitle">{this.props.subtitle}</div>}
                <button type="button" onClick={this.props.onClick} style={{ float: 'right' }}>
                    {this.props.buttonText}
                </button>
            </div>
        )
    }
}

export const toastAccessDenied = (title?: string, subtitle?: string) => {
    return toast.info(
        <ToastBody title={title || TOAST_ACCESS_DENIED.TITLE} subtitle={subtitle || TOAST_ACCESS_DENIED.SUBTITLE} />,
        {
            className: 'devtron-toast unauthorized',
        },
    )
}
