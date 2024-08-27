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

import React, { Component } from 'react'
import { RouteComponentProps, Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import link from '../../../../../../assets/icons/ic-link.svg'
import { ReactComponent as ICLinkedCINode } from '../../../../../../assets/icons/ic-node-build-linked.svg'
import { TriggerStatus } from '../../../../config'
import { DEFAULT_STATUS, URLS } from '../../../../../../config'

export interface CINodeProps extends RouteComponentProps<{}> {
    x: number
    y: number
    width: number
    height: number
    id: string
    title: string
    type: string
    description: string
    workflowId: number
    triggerType: string
    isExternalCI: boolean
    isLinkedCI: boolean
    linkedCount: number
    downstreams: string[]
    status: string
    inputMaterialsNew?: any[]
    colorCode?: string
    fromAppGrouping: boolean
    isCITriggerBlocked?: boolean
}

export class TriggerLinkedCINode extends Component<CINodeProps> {
    getCIDetailsURL(): string {
        return `${this.props.match.url.replace(URLS.APP_TRIGGER, URLS.APP_CI_DETAILS)}/${this.props.id}`
    }

    redirectToCIDetails() {
        if (this.props.fromAppGrouping) {
            return
        }
        this.props.history.push(this.getCIDetailsURL())
    }

    renderStatus() {
        const url = this.getCIDetailsURL()
        const status = this.props.status ? this.props.status.toLowerCase() : ''
        const hideDetails =
            status === DEFAULT_STATUS.toLowerCase() || status === 'not triggered' || status === 'not deployed'
        if (hideDetails) {
            return (
                <div
                    data-testid="cd-trigger-status"
                    className="dc__cd-trigger-status"
                    style={{ color: TriggerStatus[status] }}
                >
                    {this.props.status}
                </div>
            )
        }
        return (
            <div
                data-testid="cd-trigger-status"
                className="dc__cd-trigger-status"
                style={{ color: TriggerStatus[status] }}
            >
                {this.props.status}
                {!this.props.fromAppGrouping && (
                    <>
                        {this.props.status && <span className="mr-5 ml-5">/</span>}
                        <Link to={url} className="workflow-node__details-link">
                            Details
                        </Link>
                    </>
                )}
            </div>
        )
    }

    renderCardContent() {
        const status = this.props.status ? this.props.status.toLowerCase() : ''
        const hideDetails =
            status === DEFAULT_STATUS.toLowerCase() || status === 'not triggered' || status === 'not deployed'
        return (
            <div
                className={`${hideDetails ? 'workflow-node' : 'workflow-node cursor'}`}
                onClick={(e) => {
                    if (!hideDetails) {
                        this.redirectToCIDetails()
                    }
                }}
            >
                {this.props.linkedCount ? (
                    <span className="link-count">
                        <img src={link} className="icon-dim-12 mr-5" alt="" />
                        {this.props.linkedCount}
                    </span>
                ) : null}
                <div
                    className={`workflow-node__trigger-type workflow-node-trigger-type--external-ci ${
                        this.props.isCITriggerBlocked ? 'flex bcr-1 er-2 bw-1 cr-5' : ''
                    }`}
                    style={{
                        opacity: this.props.isCITriggerBlocked ? 1 : 0.4,
                    }}
                >
                    {this.props.isCITriggerBlocked ? 'BLOCKED' : this.props.triggerType}
                </div>
                <div className="workflow-node__title flex">
                    <div className="workflow-node__full-width-minus-Icon">
                        <span className="workflow-node__text-light" data-testid="linked-indication-name">
                            Build: Linked
                        </span>
                        <Tippy className="default-tt" arrow placement="bottom" content={this.props.title}>
                            <div className="dc__ellipsis-left">{this.props.title}</div>
                        </Tippy>
                    </div>

                    <ICLinkedCINode className="icon-dim-20" data-testid="ci-trigger-build-linked" />
                </div>
                {this.renderStatus()}
            </div>
        )
    }

    render() {
        return (
            <foreignObject
                className="data-hj-whitelist"
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                style={{ overflow: 'visible' }}
            >
                {this.renderCardContent()}
            </foreignObject>
        )
    }
}
