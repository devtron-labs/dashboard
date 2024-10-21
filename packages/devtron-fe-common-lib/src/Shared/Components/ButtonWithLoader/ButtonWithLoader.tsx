/* eslint-disable react/prop-types */
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

/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react'
import { Progressing } from '../../../Common'

export interface ButtonWithLoaderProps {
    disabled?: boolean
    rootClassName: string
    isLoading: boolean
    onClick?: (event) => void
    dataTestId?: string
    children?: React.ReactNode
    type?: 'submit' | 'reset' | 'button'
}

/**
 * @deprecated use Button instead
 */
export class ButtonWithLoader extends Component<ButtonWithLoaderProps> {
    constructor(props) {
        super(props)
        this.clickHandler = this.clickHandler.bind(this)
    }

    clickHandler(event) {
        if (!this.props.isLoading && this.props.onClick) {
            this.props.onClick(event)
        }
    }

    render() {
        return (
            <button
                // eslint-disable-next-line react/button-has-type
                type={this.props.type ?? 'button'}
                data-testid={this.props.dataTestId}
                disabled={!!this.props.disabled}
                className={`${this.props.rootClassName}`}
                onClick={this.clickHandler}
            >
                {this.props.isLoading ? <Progressing /> : this.props.children}
            </button>
        )
    }
}
