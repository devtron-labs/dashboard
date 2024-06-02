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
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import { SourceTypeMap } from '../../../../config'

export interface WebhookData {
    id: number
    eventActionType: string
    data: any
}

export interface CommitHistory {
    author: string
    commitURL: string
    changes: string[]
    commit: string
    date: string
    message: string
    isSelected: boolean
    showChanges: boolean
    webhookData: WebhookData
    excluded?: boolean
}

export interface CIMaterialType {
    id: number
    gitMaterialName: string
    gitMaterialId: number
    gitURL: string
    type: string
    value: string
    active: boolean
    history: CommitHistory[]
    isSelected: boolean
    lastFetchTime: string
    isRepoError?: boolean
    repoErrorMsg?: string
    isBranchError?: boolean
    branchErrorMsg?: string
    isMaterialLoading?: boolean
    regex: string
    searchText?: string
    noSearchResultsMsg?: string
    noSearchResult?: boolean
    isRegex: boolean
    isDockerFileError?: boolean
    dockerFileErrorMsg?: string
    showAllCommits?: boolean
    isMaterialSelectionError?: boolean
    materialSelectionErrorMsg: string
}

export interface MaterialHistoryProps {
    material: CIMaterialType
    pipelineName: string
    ciPipelineId?: string
    selectCommit?: (materialId: string, commit: string, ciPipelineId?: string) => void
    toggleChanges: (materialId: string, commit: string) => void
}

export class MaterialHistory extends Component<MaterialHistoryProps> {
    onClickMaterialHistory = (e, _commitId, isExcluded) => {
        e.stopPropagation()
        if (this.props.selectCommit && !isExcluded) {
            this.props.selectCommit(this.props.material.id.toString(), _commitId, this.props.ciPipelineId)
        }
    }

    render() {
        return (
            <>
                {this.props.material?.history?.map((history, index) => {
                    let classes = `material-history w-auto mt-12 ${history.isSelected ? 'material-history-selected' : ''}`
                    if (this.props.selectCommit) {
                        classes = `${classes}`
                    }
                    const _commitId =
                        this.props.material.type == SourceTypeMap.WEBHOOK && history.webhookData
                            ? history.webhookData.id.toString()
                            : history.commit
                    return (
                        <div
                            data-testid={`material-history-${index}`}
                            key={_commitId}
                            className={`${classes} `}
                            onClick={(e) => this.onClickMaterialHistory(e, _commitId, history.excluded)}
                        >
                            <GitCommitInfoGeneric
                                index={index}
                                materialUrl={this.props.material.gitURL}
                                showMaterialInfoHeader={this.props.pipelineName === ''}
                                commitInfo={history}
                                materialSourceType={this.props.material.type}
                                selectedCommitInfo={this.props.selectCommit}
                                materialSourceValue={this.props.material.value}
                                canTriggerBuild={!history.excluded}
                                isExcluded={history.excluded}
                            />
                        </div>
                    )
                })}
            </>
        )
    }
}
