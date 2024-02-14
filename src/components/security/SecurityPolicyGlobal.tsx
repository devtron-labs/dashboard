import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { SecurityPolicyEdit } from './SecurityPolicyEdit'

export class SecurityPolicyGlobal extends Component<RouteComponentProps<{}>, {}> {
    render() {
        return <SecurityPolicyEdit level="global" />
    }
}
