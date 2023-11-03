import React, { Component } from 'react'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'

export interface ButtonProps {
    disabled?: boolean
    rootClassName: string
    isLoading: boolean
    loaderColor: string
    onClick?: (event) => void
    dataTestId?: string
    children?: React.ReactNode
    type?: 'submit' | 'reset' | 'button'
}

export class ButtonWithLoader extends Component<ButtonProps> {
    constructor(props) {
        super(props)
        this.clickHandler = this.clickHandler.bind(this)
    }

    clickHandler(event) {
        if (!this.props.isLoading && this.props.onClick) this.props.onClick(event)
    }

    render() {
        return (
            <button
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
