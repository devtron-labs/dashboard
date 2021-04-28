import React, { Component } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import AppListContainer from './AppListContainer';
import ExternalListContainer from './ExternalListContainer';
import { ListContainerProps, ListContainerState } from './types';
import { AppListViewType } from '../config';
import { URLS } from '../../../config';
import { AddNewApp } from '../create/CreateApp';

const APP_LIST_PARAM = {
    createApp: 'create-app',
}

export default class ListContainer extends React.Component<ListContainerProps, ListContainerState> {
    constructor(props) {
        super(props)

        this.state = {
            collapsed: false,
            code: 0,
            view: AppListViewType.LOADING,
        }
    }

    openCreateModal = (event: React.MouseEvent): void => {
        let url = `${URLS.APP}/${APP_LIST_PARAM.createApp}${this.props.location.search}`
        this.props.history.push(`${url}`);
    }

    renderListHeader() {
        const path = this.props.match.path;
        return <>
            <ul role="tablist" className="tab-list border-btm bcn-0 pl-20">
                <li className="tab-list__tab ellipsis-right">
                    <NavLink activeClassName="active" to={`${path}`} className="tab-list__tab-link">Devtron Apps [A]</NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${path}/external-apps`} className="tab-list__tab-link">External Apps [E]</NavLink>
                </li>
                <li className="tab-list__tab--right mt-9 mb-9 mr-20"><button type="button" className="cta h-30"
                    onClick={this.openCreateModal}>
                    <span className="round-button__icon"><i className="fa fa-plus" aria-hidden="true"></i></span>
                     New app
                </button></li>
            </ul>
        </>
    }

    renderRouter() {
        const path = this.props.match.path;
        return <Switch>
            <Route path={`${path}`} component={AppListContainer} />
            <Route path={`${path}/external-apps`} component={ExternalListContainer} />
            <Route path={`${URLS.APP}/${APP_LIST_PARAM.createApp}`}
                render={(props) => <AddNewApp close={this.props.closeModal} match={props.match} location={props.location} history={props.history} />}
            />
            <Redirect to={`${path}`} />
        </Switch>
    }

    render() {
        { console.log(this.props) }
        return (
            <div>
                {this.renderListHeader()}
                {this.renderRouter()}
            </div>
        )
    }
}
