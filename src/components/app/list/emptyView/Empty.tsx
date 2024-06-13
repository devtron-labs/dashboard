/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Children, Component } from 'react'
import { GenericEmptyState, GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { AppListViewType } from '../../config'
import noapps from '../../../../assets/img/empty-applist@2x.png'
import { EmptyProps } from './types'
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg'
import { DOCUMENTATION } from '../../../../config'

export class Empty extends Component<EmptyProps> {
    renderNoAppsView() {
        const renderButton = () => {
            return (
                <button type="button" className="cta flex" onClick={this.props.clickHandler}>
                    <Add className="icon-dim-20 mr-8 fcn-0" />
                    {this.props.buttonLabel}
                </button>
            )
        }

        return (
            <div className="dc__position-rel" style={{ height: 'calc(100vh - 160px)' }}>
                <GenericEmptyState
                    image={noapps}
                    title={this.props.title}
                    subTitle={
                        <>
                            {this.props.message}
                            <a
                                rel="noreferrer noopener"
                                target="_blank"
                                href={DOCUMENTATION.APP_CREATE}
                                className="anchor"
                            >
                                Learn about creating applications
                            </a>
                        </>
                    }
                    isButtonAvailable
                    renderButton={renderButton}
                />
            </div>
        )
    }

    renderNoResultsView(children) {
        const renderButton = () => {
            return (
                <button
                    type="button"
                    className="saved-filter__clear-btn dc__saved-filter__clear-btn--dark"
                    data-testid="clear-filter-button"
                    onClick={this.props.clickHandler}
                >
                    {this.props.buttonLabel}
                </button>
            )
        }

        return (
            <div className="dc__position-rel" style={{ height: 'calc(100vh - 250px)' }}>
                <GenericFilterEmptyState
                    title={this.props.title}
                    subTitle={this.props.message}
                    isButtonAvailable
                    renderButton={renderButton}
                    children={children}
                />
            </div>
        )
    }

    render() {
        if (this.props.view === AppListViewType.NO_RESULT) {
            return this.renderNoResultsView(this.props.children)
        }
        return this.renderNoAppsView()
    }
}
