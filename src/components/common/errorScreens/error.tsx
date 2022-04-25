import React, { Component } from 'react'
import EmptyState from '../../EmptyState/EmptyState'
import notAuthorized from '../../../assets/img/ic-not-authorized.svg'
import Reload from '../../Reload/Reload'

export class ErrorScreenManager extends Component<{ code?: number; reload?: (...args) => any; subtitle?: string }> {
    getMessage() {
        switch (this.props.code) {
            case 400:
                return 'Bad Request'
            case 401:
                return 'Unauthorized'
            case 403:
                return <ErrorScreenNotAuthorized subtitle={this.props.subtitle} />
            case 404:
                return 'Not Found'
            case 500:
                return 'Internal Server Error'
            case 502:
                return 'Bad Gateway'
            case 503:
                return 'Service Temporarily Unavailable'
            default:
                return <Reload />
        }
    }
    render() {
        let msg = this.getMessage()
        return (
            <div>
                <h1>{msg}</h1>
            </div>
        )
    }
}

export class ErrorScreenNotAuthorized extends Component<{ subtitle: string }> {
    render() {
        return (
            <EmptyState>
                <EmptyState.Image>
                    <img src={notAuthorized} alt="Not Authorized" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h3 className="title">Not authorized</h3>
                </EmptyState.Title>
                <EmptyState.Subtitle>
                    {this.props.subtitle
                        ? this.props.subtitle
                        : "Looks like you don't have access to information on this page. Please contact your manager to request access."}
                </EmptyState.Subtitle>
            </EmptyState>
        )
    }
}
