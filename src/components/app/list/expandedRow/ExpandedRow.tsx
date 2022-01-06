import React, { Component } from 'react';
import { statusIcon, statusColor } from '../../config';
import { handleUTCTime } from '../../../common';
import { ExpandedRowProps } from './types';
import { Link } from 'react-router-dom'
import { ReactComponent as Commit } from '../../../../assets/icons/ic-commit.svg';
import { ReactComponent as Settings } from '../../../../assets/icons/ic-settings.svg';
import Tippy from '@tippyjs/react';
import './expandedRow.css';

export class ExpandedRow extends Component<ExpandedRowProps>{

    renderRows() {
        return this.props.app.environments.map((env) => {
            let color = 'var(--N700)';
            return <Link key={env.id} to={`${this.props.redirect(this.props.app, env.id)}`} className="app-list__row app-list__row--expanded">
                <div className="app-list__cell--icon"></div>
                <div className="app-list__cell app-list__cell--name">
                    <svg className="app-status app-status--pseudo" preserveAspectRatio="none" viewBox="0 0 200 40">
                        <line x1="0" y1="20" x2="300" y2="20" stroke={color} strokeWidth="1" />
                        <line x1="0" y1="15" x2="0" y2="25" stroke={color} strokeWidth="1" />
                    </svg>
                </div>
                <div className="app-list__cell app-list__cell--env">{env.name}</div>
                <div className="app-list__cell app-list__cell--cluster">{env.clusterName}</div>
                <div className="app-list__cell app-list__cell--namespace">{env.namespace}</div>
                <div className="app-list__cell app-list__cell--time">
                    {env.lastDeployedTime &&
                        <Tippy className="default-tt" arrow={true} placement="top" content={env.lastDeployedTime}>
                            <p className="truncate-text m-0">{handleUTCTime(env.lastDeployedTime, true)}</p>
                        </Tippy>
                    }
                </div>
                <div className="app-list__cell app-list__cell--action"></div>
            </Link>
        })
    }

    render() {
        return <div className="expanded-row">
            <div className="expanded-row__title" >
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