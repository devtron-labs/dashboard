import React, { Component } from 'react'
import './list.css';
import { Link, Switch, Route, RouteComponentProps } from 'react-router-dom';
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';
import { ReactComponent as Check } from '../../../assets/icons/ic-check.svg';
import { ReactComponent as Dropdown } from '../../../assets/icons/appstatus/ic-dropdown.svg'

interface ExternalListContainerProps{
    collapsed: boolean;
    toggleHeaderName: () => void;
}
export default class ExternalListContainer extends Component<ExternalListContainerProps> {
    renderExternalHeader(){
        return <div className="app-header">
            <div className="app-header__title">
                <h1 className="app-header__text flex">External Apps
                <Dropdown onClick={this.props.toggleHeaderName} className="icon-dim-24 rotate ml-4" style={{ ['--rotateBy' as any]: this.props.collapsed ? '180deg' : '0deg' }} />
                </h1>
                {this.props.collapsed ? <>
                    <div className="app-list-card bcn-0 br-4 en-1 bw-1 pt-8 pr-8 pb-8 pl-8 ">
                        <div  className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                        <Check className="scb-5 mr-8 icon-dim-16" />
                            <div>
                                <div className="cn-9 fs-13">Devtron Apps & Charts</div>
                                <div className="cn-5">Apps & charts deployed using Devtron</div>
                            </div>
                        </div>
                        <div className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                        <Check className="scb-5 mr-8 icon-dim-16" />
                            <div>
                                <div className="cn-9 fs-13">External Apps</div>
                                <div className="cn-5">Helm charts, Argocd objects</div>
                            </div>
                        </div>
                        <div className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                        <Check className="scb-5 mr-8 icon-dim-16" />
                            <div>
                                <div className="cn-9 fs-13">K8s Objects</div>
                                <div className="cn-5">All objects for which you have direct access</div>
                            </div>
                        </div>
                    </div>
                    
                </> : ""}
                </div>
                </div>
    }
    
    renderAppList() {
        // if (this.props.apps.length) {
        // let icon = this.props.sortRule.order == OrderBy.ASC ? "sort-up" : "sort-down";
        return <div className="app-list">
            <div className="external-list__header pt-8 pb-8">
                <div className="external-list__cell">
                    <button className="app-list__cell-header" onClick={e => { e.preventDefault(); }}> App name
                         {/* {this.props.sortRule.key == SortBy.APP_NAME ? <span className={icon}></span> : <span className="sort-col"></span>} */}
                    </button>
                </div>
                <div className="external-list__cell external-list__cell--width">
                    <span className="app-list__cell-header">Environment</span>
                </div>
                <div className="external-list__cell ">
                    <span className="app-list__cell-header">Last Updated </span>
                </div>
                <div className="app-list__cell app-list__cell--action"></div>
            </div>
            <Link to="" className="external-list__row">
                <div className="app-list__cell app-list__cell--name">
                    <p className="truncate-text m-0">testing</p>
                </div>
                <div className="app-list__cell app-list__cell--name">
                    status
                                </div>
                <div className="app-list__cell app-list__cell--name">
                    hi
                                </div>
                <div className="app-list__cell app-list__cell--action">
                    <button type="button" className="button-edit" onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                        <Edit className="button-edit__icon" />
                    </button>
                </div>
            </Link>

        </div>
    }

    render() {
        return (
            <>
            {this.renderExternalHeader()}
            {this.renderAppList()}</>
        )
    }
}
