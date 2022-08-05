import React, { Component } from 'react'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import { SourceTypeMap } from '../../../../config'
import { CommitHistory, MaterialHistoryProps } from './types'
export class MaterialHistory extends Component<MaterialHistoryProps> {
    onClickMaterialHistory = (e, _commitId) => {
        e.stopPropagation()
        if (this.props.selectCommit) {
            this.props.selectCommit(this.props.material.id.toString(), _commitId)
        }
    }
    render() {
        return (
            <>
                {this.props.material.history.map((history: CommitHistory) => {
                    let classes = `material-history mt-12 ${history.isSelected ? 'material-history-selected' : ''}`
                    if (this.props.selectCommit) {
                        classes = `${classes}`
                    }
                    let _commitId =
                        this.props.material.type == SourceTypeMap.WEBHOOK && history.webhookData
                            ? history.webhookData.id.toString()
                            : history.commit
                    return (
                        <div
                            key={_commitId}
                            className={`${classes} `}
                            onClick={(e) => this.onClickMaterialHistory(e, _commitId)}
                        >
                            <GitCommitInfoGeneric
                                materialUrl={this.props.material.gitURL}
                                showMaterialInfo={false}
                                commitInfo={history}
                                materialSourceType={this.props.material.type}
                                selectedCommitInfo={this.props.selectCommit}
                                materialSourceValue={this.props.material.value}
                                canTriggerBuild={true}
                            />
                        </div>
                    )
                })}
            </>
        )
    }
}
