import React, { Component } from 'react'
import AppListContainer from './AppListContainer'
import { ListContainerProps, ListContainerState } from './types';
import { ReactComponent as Check } from '../../../assets/icons/ic-check.svg';
import { ReactComponent as Dropdown } from '../../../assets/icons/appstatus/ic-dropdown.svg'
import { URLS } from '../../../config';
import { AppListViewType } from '../config';
import ExternalListContainer from './ExternalListContainer';

const APP_LIST_PARAM = {
    createApp: 'create-app',
}

const QueryParams = {
    Namespace: "namespace",
    Cluster: "cluster"
}

export default class ListContainer extends Component<ListContainerProps, ListContainerState> {
    constructor(props) {
        super(props)

        this.state = {
            collapsed: false,
            code: 0,
            view: AppListViewType.LOADING,
            showAppList:true,
        }
        this.toggleHeaderName = this.toggleHeaderName.bind(this)
        this.toggleSelectedList = this.toggleSelectedList.bind(this)
    }

    toggleHeaderName() {
        this.setState({ collapsed: !this.state.collapsed })
    }

    toggleSelectedList() {
        this.setState({ showAppList: !this.state.showAppList })
    }

    

    render() {
        return (
            <div>
                {/* <AppListContainer /> */}
                <ExternalListContainer {...this.props} />

            </div>
        )
    }
}
