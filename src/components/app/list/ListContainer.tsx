import React, { Component } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import AppListContainer from './AppListContainer';
import ExternalListContainer from './ExternalListContainer';
import { ListContainerProps } from './types';
import { URLS } from '../../../config';
import { AddNewApp } from '../create/CreateApp';
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg';
import './list.css';

const APP_LIST_PARAM = {
    createApp: 'create-app',
}

export default class ListContainer extends Component<ListContainerProps, {}> {
    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.openCreateModal = this.openCreateModal.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress);
    }

    handleKeyPress(event) {
        let activeElement = document.activeElement
        let inputs = ['input', 'select', 'button', 'textarea'];
        if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1) {
            return;
        }

        if (event.key === 'E' || event.key === 'e') {
            let url = `${URLS.EXTERNAL_APP}`;
            this.props.history.push(`${url}`);
        }
        else if (event.key === 'A' || event.key === 'a') {
            let url = `${URLS.APP}`;
            this.props.history.push(`${url}`);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress);
    }

    openCreateModal(event: React.MouseEvent): void {
        let url = `${URLS.APP}/${APP_LIST_PARAM.createApp}${this.props.location.search}`;
        this.props.history.push(`${url}`);
    }

    renderListHeader() {
        return <ul role="tablist" className="tab-list border-btm bcn-0 pl-20">
            <li className="tab-list__tab ellipsis-right">
                <NavLink activeClassName="active" to={`${URLS.APP}`} className="tab-list__tab-link">Devtron Apps [A]</NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active" to={`${URLS.EXTERNAL_APP}`} className="tab-list__tab-link">External Apps [E]</NavLink>
            </li>
            <li className="tab-list__tab--right mt-9 mb-9 mr-20">
                <button type="button" className="cta small flex" onClick={this.openCreateModal}>
                    <Add className="mr-8 icon-dim-16" />New app
                </button>
            </li>
        </ul>
    }

    renderRouter() {
        return <Switch>
            <Route path={`${URLS.APP}`} component={AppListContainer} />
            <Route path={`${URLS.EXTERNAL_APP}`} component={ExternalListContainer} />
            <Route path={`${URLS.APP}/${APP_LIST_PARAM.createApp}`}
                render={(props) => <AddNewApp close={this.props.closeModal}
                    match={props.match} location={props.location} history={props.history} />}
            />
            <Redirect to={`${URLS.APP}`} />
        </Switch>
    }

    render() {
        return <div>
            {this.renderListHeader()}
            {this.renderRouter()}
        </div>
    }
}
