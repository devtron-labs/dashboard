import React, { Component } from 'react'
import EmptyState from '../../EmptyState/EmptyState'
import notAuthorized from '../../../assets/img/ic-not-authorized.svg'
import Reload from '../../Reload/Reload'

export class ErrorScreenManager extends Component<{
    code?: number
    reload?: (...args) => any
    subtitle?: React.ReactChild
    subtitleClass?: string
    reloadClass?: string
}> {
    getMessage() {
        switch (this.props.code) {
            case 400:
                return 'Bad Request'
            case 401:
                return 'Unauthorized'
            case 403:
                return (
                    <ErrorScreenNotAuthorized className={this.props.reloadClass} subtitle={this.props.subtitle} subtitleClass={this.props.subtitleClass} />
                )
            case 404:
                return 'Not Found'
            case 500:
                return 'Internal Server Error'
            case 502:
                return 'Bad Gateway'
            case 503:
                return 'Service Temporarily Unavailable'
            default:
                return <Reload className={this.props.reloadClass} />
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

export class ErrorScreenNotAuthorized extends Component<{
    subtitle: React.ReactChild
    subtitleClass?: string
    className?: string
}> {
    render() {
        return (
            <EmptyState className={this.props.className}>
                <EmptyState.Image>
                    <img src={notAuthorized} alt="Not Authorized" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h3 className="title">Not authorized</h3>
                </EmptyState.Title>
                <EmptyState.Subtitle className={this.props.subtitleClass}>
                    {this.props.subtitle
                        ? this.props.subtitle
                        : "Information on this page is available only to superadmin users."}
                </EmptyState.Subtitle>
            </EmptyState>
        )
    }
}
