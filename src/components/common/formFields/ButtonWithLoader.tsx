
import React, { Component } from 'react';
import { Progressing} from '@devtron-labs/devtron-fe-common-lib'

export interface ButtonProps {
    disabled?: boolean
    rootClassName: string
    isLoading: boolean
    loaderColor: string
    onClick: (event) => void
    dataTestId?: string
}

export class ButtonWithLoader extends Component<ButtonProps> {
    constructor(props) {
        super(props)
        this.clickHandler = this.clickHandler.bind(this)
    }

    clickHandler(event) {
        if (!this.props.isLoading) this.props.onClick(event)
    }

    render() {
        return (
            <button
                type="button"
                data-testid={`${this.props.dataTestId}${!!this.props.disabled?"disabled":""}`}
                disabled={!!this.props.disabled}
                className={`${this.props.rootClassName}`}
                onClick={this.clickHandler}
            >
                {this.props.isLoading ? <Progressing /> : this.props.children}
            </button>
        )
    }
}
