import React, { Component } from 'react';
import { ReactComponent as Check } from '../../../../assets/icons/ic-check-circle.svg';
import { ReactComponent as Arrow } from '../../../../assets/icons/misc/arrow-chevron-down-black.svg';
import { ReactComponent as Commit } from '../../../../assets/icons/ic-commit.svg';
import { ReactComponent as PersonIcon } from '../../../../assets/icons/ic-person.svg';
import { ReactComponent as CalendarIcon } from '../../../../assets/icons/ic-calendar.svg';
import { ReactComponent as MessageIcon } from '../../../../assets/icons/ic-message.svg';
import { ReactComponent as BranchIcon } from '../../../../assets/icons/ic-branch.svg';
import { ReactComponent as BranchMain } from '../../../../assets/icons/ic-branch-main.svg';
import { string } from 'prop-types';
import TriggerViewMergedCI from './TriggerViewSelectCiMaterial';
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric';

export interface Data {
    author: string;
    date: string;
    gitUrl: string;
    header: string;
    sourceBranchName: string;
    sourceCheckout: string;
    targetBranchName: string;
    targetCheckout: string;
}

export interface WebhookData {
    id: number;
    eventActionType: string;
    data: Data
}

export interface CommitHistory {
    author: string;
    commitURL: string;
    changes: string[];
    commit: string;
    date: string;
    message: string;
    isSelected: boolean;
    showChanges: boolean;
    webhookData: WebhookData
}

export interface CIMaterialType {
    id: number;
    gitMaterialName: string;
    gitMaterialId: number;
    gitURL: string;
    type: string;
    value: string;
    active: boolean;
    history: CommitHistory[];
    isSelected: boolean;
    lastFetchTime: string;
    isRepoError?: boolean;
    repoErrorMsg?: string;
    isBranchError?: boolean;
    branchErrorMsg?: string;
    isMaterialLoading?: boolean;
}

export interface MaterialHistoryProps {
    material: CIMaterialType;
    pipelineName: string;
    selectCommit?: (materialId: string, commit: string) => void;
    toggleChanges: (materialId: string, commit: string) => void;
}

export class MaterialHistory extends Component<MaterialHistoryProps> {

    render() {
        return <>
            {this.props.material.history.map((history) => {
                let classes = `material-history ${history.isSelected ? 'material-history-selected' : ''}`;
                if (this.props.selectCommit) {
                    classes = `${classes} cursor`;
                }
                return <div key={history.commit} className={classes} onClick={(e) => {
                    e.stopPropagation();
                    if (this.props.selectCommit)
                        this.props.selectCommit(this.props.material.id.toString(), history.commit);
                }}>

                    <GitCommitInfoGeneric
                        materialUrl={""}
                        showMaterialInfo={false}
                        commitInfo={history}
                        materialSourceType={this.props.material.type}
                        selectedCommitInfo={this.props.selectCommit}
                        materialSourceValue={this.props.material.value}

                    />
                </div>
            })}
        </>
    }
}