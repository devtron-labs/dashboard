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
import './appStatus.css'
import { statusColor, statusIcon } from '@devtron-labs/devtron-fe-common-lib'

interface AppStatusProps {
    status: string
}

export class AppStatus extends Component<AppStatusProps> {
    render() {
        const status = this.props.status.toLocaleLowerCase().replace(/\s+/g, '')
        const isBG = status === 'progressing' || status === 'notdeployed' || status === 'hibernating'
        const iconClass = `${statusIcon[status]} app-status__icon`
        const color = statusColor[status] || 'var(--N700)'
        return (
            <>
                <svg className="app-status" preserveAspectRatio="none" viewBox="0 0 200 40">
                    <line x1="0" y1="20" x2="200" y2="20" stroke={color} strokeWidth="1" />
                    <line x1="0" y1="15" x2="0" y2="25" stroke={color} strokeWidth="1" />
                    <line x1="200" y1="15" x2="200" y2="25" stroke={color} strokeWidth="1" />
                </svg>
                <div className={isBG ? 'bg' : null} />
                <div className={iconClass} />
                <span className="app-status-cell__tooltip-body">{this.props.status}</span>
                <span className="app-status-cell__tooltip-arrow" />
            </>
        )
    }
}
