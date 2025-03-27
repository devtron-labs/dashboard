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
import { GIT_BRANCH_NOT_CONFIGURED } from '../../../config'
import { CiPipelineSourceConfig, GitProviderIcon, GitProviderType } from '@devtron-labs/devtron-fe-common-lib'

export interface StaticNodeProps {
    x: number
    y: number
    branch: string
    icon: string
    id: string
    url: string
    title: string
    height: number
    width: number
    downstreams: any[]
    sourceType: string
    regex?: string
    primaryBranchAfterRegex?: string
    to?: string
    handleGoToWorkFlowEditor?: (e?: any) => void
}

export class StaticNode extends Component<StaticNodeProps> {
    renderCardContent() {
        return (
            <div
                className={`workflow-node workflow-node--static ${
                    this.props.branch === GIT_BRANCH_NOT_CONFIGURED ? 'cursor dashed' : ''
                }`}
                onClick={this.props.handleGoToWorkFlowEditor}
            >
                <GitProviderIcon
                    {...(this.props.url
                        ? {
                              gitRepoUrl: this.props.url,
                          }
                        : {
                              gitProvider: GitProviderType.GIT,
                          })}
                />
                <div className="workflow-node__title workflow-node__title--static">
                    <span>/{this.props.title}</span>
                    <CiPipelineSourceConfig
                        sourceType={this.props.sourceType}
                        sourceValue={this.props.branch}
                        showTooltip
                        showIcons={this.props.branch !== GIT_BRANCH_NOT_CONFIGURED}
                        regex={this.props.regex}
                        primaryBranchAfterRegex={this.props.primaryBranchAfterRegex}
                    />
                </div>
            </div>
        )
    }

    render() {
        return (
            <foreignObject
                className="data-hj-whitelist"
                key={`static-${this.props.id}`}
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
