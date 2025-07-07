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
import Tippy from '@tippyjs/react'
import link from '../../../../../../assets/icons/ic-link.svg'
import { Icon } from '@devtron-labs/devtron-fe-common-lib'

export interface CINodeProps {
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
}

export class TriggerExternalCINode extends Component<CINodeProps> {
    renderCardContent() {
        return (
            <div className="workflow-node">
                {this.props.linkedCount ? (
                    <span className="link-count">
                        <img src={link} className="icon-dim-12 mr-5" alt="" />
                        {this.props.linkedCount}
                    </span>
                ) : null}
                <div className="workflow-node__trigger-type workflow-node__trigger-type--create">
                    {this.props.triggerType}
                </div>
                <div className="workflow-node__title flex dc__gap-8">
                    <div className="workflow-node__full-width-minus-Icon">
                        <span className="workflow-node__text-light">Build: External</span>
                        <Tippy className="default-tt" arrow placement="bottom" content={this.props.title}>
                            <div className="dc__ellipsis-left">{this.props.title}</div>
                        </Tippy>
                    </div>
                    <Icon name="ic-ci-webhook" size={20} color={null} />
                </div>
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
