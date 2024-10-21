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
import { Clipboard } from '../index'

export interface CopyButtonProps {
    disabled?: boolean
    rootClassName?: string
    onClick: (event) => void
}

export class CopyButton extends Component<CopyButtonProps> {
    render() {
        const className = this.props.rootClassName ? `${this.props.rootClassName} copy-button` : `copy-button`
        return (
            <button type="button" disabled={!!this.props.disabled} className={className} onClick={this.props.onClick}>
                <Clipboard rootClassName="copy-button--icon" />
            </button>
        )
    }
}
