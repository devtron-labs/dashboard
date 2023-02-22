import React from 'react'
import { toast } from 'react-toastify'
import { TOAST_ACCESS_DENIED } from '../../config/constantMessaging'

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
        <ToastBody
            title={title || TOAST_ACCESS_DENIED.TITLE}
            subtitle={subtitle || TOAST_ACCESS_DENIED.SUBTITLE}
        />,
        {
            className: 'devtron-toast unauthorized',
        },
    )
}