import React, { Component } from 'react';
import { statusIcon, statusColor } from '../../config';
import { ExpandedRowProps } from './types';
import { Link } from 'react-router-dom'
import { ReactComponent as Commit } from '../../../../assets/icons/ic-commit.svg';
import { ReactComponent as Settings } from '../../../../assets/icons/ic-settings.svg';
import './expandedRow.css';

export class ExpandedRow extends Component<ExpandedRowProps>{

    renderRows() {
        return this.props.app.environments.map((env) => {
            let status = env.status.toLocaleLowerCase().replace(/\s+/g, '');
            let iconClass = statusIcon[status] + " app-status__icon";
            let color = statusColor[status] || 'var(--N700)';
            let isBG = (status === "progressing" || status === "notdeployed" || status === "hibernating");

            return <Link key={env.id} to={`${this.props.redirect(this.props.app, env.id)}`} className="app-list__row app-list__row--expanded">
                <div className="app-list__cell app-list__cell--name-pseudo">
                    <svg className="app-status app-status--pseudo" preserveAspectRatio="none" viewBox="0 0 200 40">
                        <line x1="0" y1="20" x2="300" y2="20" stroke={color} strokeWidth="1" />
                        <line x1="0" y1="15" x2="0" y2="25" stroke={color} strokeWidth="1" />
                    </svg>
                </div>
                <div className="app-list__cell app-list__cell--status">
                    <div className={isBG ? "bg" : null}></div>
                    <div className={iconClass}></div>
                    <svg className="app-status" preserveAspectRatio="none" viewBox="0 0 200 40">
                        <line x1="-100" y1="20" x2="200" y2="20" stroke={color} strokeWidth="1" />
                        <line x1="200" y1="15" x2="200" y2="25" stroke={color} strokeWidth="1" />
                    </svg>
                    <span className="app-status-cell__tooltip-body">{env.status}</span>
                    <span className="app-status-cell__tooltip-arrow"></span>
                </div>
                <div className="app-list__cell app-list__cell--env">{env.name}</div>
                <div className="app-list__cell app-list__cell--material-info">
                    {env.materialInfo.map((mat) => {
                        let _isWebhook = false;
                        let _commit = mat.revision.substr(0, 8);
                        let _commitId = mat.revision;
                        if(mat && mat.webhookData){
                            let _webhookData = JSON.parse(mat.webhookData);
                            _isWebhook = _webhookData.Id > 0;
                            if(_isWebhook){
                                _commit = _webhookData.EventActionType == 'merged' ? _webhookData.Data["target checkout"].substr(0, 8) : _webhookData.Data["target checkout"];
                                _commitId = _webhookData.Id;
                            }
                        }
                        return(
                            <div key={env.id} className="app-commit">
                                <button type="button" className="app-commit__hash block mr-16" onClick={(event) => {
                                    event.preventDefault();
                                    this.props.openTriggerInfoModal(this.props.app.id, env.ciArtifactId, _commitId);
                                }}>
                                    <span>{_commit}</span>
                                </button>
                            </div>
                        )
                    })}
                </div>
                <div className="app-list__cell app-list__cell--time">{env.lastDeployedTime}</div>
                <div className="app-list__cell app-list__cell--action">
                </div>
            </Link>
        })
    }

    render() {
        return <div className="expanded-row">
            < div className="expanded-row__title" >
                <div className="expanded-row__close" onClick={this.props.close}>
                    <span>{this.props.app.name}</span>
                    <i className="fa fa-chevron-up"></i>
                </div>
                <button type="button" className="button-edit button-edit--white" onClick={() => { this.props.handleEdit(this.props.app.id) }}>
                    <Settings className="button-edit__icon" />
                </button>
            </div >
            {this.renderRows()}
        </div >
    }
}