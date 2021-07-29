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

export interface WebHookData {
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
    webhookData: WebHookData
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

    renderShowChangeButton(history) {
        if (history.changes.length) {
            return <button type="button" className="material-history__changes-btn" onClick={(event) => {
                event.stopPropagation();
                this.props.toggleChanges(this.props.material.id.toString(), history.commit)
            }}>
                {history.showChanges ? "Hide Changes" : "Show Changes"}
                <Arrow style={{ 'transform': `${history.showChanges ? 'rotate(-180deg)' : ''}` }} />
            </button>
        }
    }

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

                    <div>
                        {history.webhookData && history.webhookData.eventActionType == "merged" ?
                            <TriggerViewMergedCI
                                history={history}
                                selectCommit={this.props.selectCommit}
                                toggleChanges={this.props.toggleChanges}
                                material={this.props.material}
                            /> :
                            <>
                                <div className="ml-16 mr-16 flex left" style={{ justifyContent: "space-between" }}>
                                    <a href={history.commitURL} target="_blank" rel="noopener" className="commit-hash" onClick={e => e.stopPropagation()}>
                                        <Commit className="commit-hash__icon" />{history.commit}
                                    </a>
                                    {this.props.selectCommit ? <div className="material-history__select-text" >
                                        {history.isSelected ? <Check className="align-right" /> : "Select"}
                                    </div> : null}
                                </div>
                                <div className="material-history__text">Author: {history.author}</div>
                                <div className="material-history__text">Date: {history.date}</div>
                                <div className="material-history__text material-history-text--padded">{history.message}</div>
                            </>}
                        {history.showChanges ? <div className="material-history__all-changes">
                            {history.changes.map((change, index) => {
                                return <div className="pl-1" key={index}>{change}</div>
                            })}
                        </div> : null}
                    </div>

                    {this.renderShowChangeButton(history)}
                </div>
            })}
        </>
    }
}