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
