import React, { Component } from 'react'
import { statusIcon } from '../../config'
import './appStatus.css'
import { statusColor } from '@devtron-labs/devtron-fe-common-lib'

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
