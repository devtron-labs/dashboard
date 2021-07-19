import React, { Component } from 'react';
import { ReactComponent as Check } from '../../../../assets/icons/ic-check-circle.svg';
import { ReactComponent as Arrow } from '../../../../assets/icons/misc/arrow-chevron-down-black.svg';
import { ReactComponent as Commit } from '../../../../assets/icons/ic-commit.svg';
import { ReactComponent as PersonIcon } from '../../../../assets/icons/ic-person.svg';
import { ReactComponent as CalendarIcon } from '../../../../assets/icons/ic-calendar.svg';
import { ReactComponent as MessageIcon } from '../../../../assets/icons/ic-message.svg';
import { ReactComponent as BranchIcon } from '../../../../assets/icons/ic-branch.svg';

export interface CommitHistory {
    author: string;
    commitURL: string;
    changes: string[];
    commit: string;
    date: string;
    message: string;
    isSelected: boolean;
    showChanges: boolean;
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
                    <div className="material-history__header">
                        <a href={history.commitURL} target="_blank" rel="noopener" className="commit-hash" onClick={e => e.stopPropagation()}>
                            <Commit className="commit-hash__icon" />{history.commit}
                        </a>
                        {this.props.selectCommit ? <div className="material-history__select-text" >
                            {history.isSelected ? <Check className="align-right" /> : "Select"}
                        </div> : null}
                    </div>
                    <div className="material-history__body" >
                        {/* <div style={{ transform: "rotateZ(270deg)" }}><BranchIcon className="" /></div> */}
                        <div className="material-history__text flex left">
                            <PersonIcon className="icon-dim-16 mr-8" /> {history.author}
                        </div>
                        <div className="material-history__text flex left">
                            <CalendarIcon className="icon-dim-16 mr-8" />{history.date}
                        </div>
                        <div className="material-history__text material-history-text--padded flex left">
                            <MessageIcon className="icon-dim-16 mr-8" />{history.message}
                        </div>
                    </div>
                    {console.log(history)}
                    {/* {history.showChanges ? <div className="material-history__all-changes">
                        {history.changes.map((change, index) => {
                            return <div key={index}>{change}</div>
                        })} </div>*/}
                    {history.showChanges ? <div className="material-history__all-changes">
                        <div className="material-history__body" >
                            {/* <div style={{ transform: "rotateZ(270deg)" }}><BranchIcon className="" /></div> */}
                             <div className="material-history__text left bcn-1">
                             <div >Author</div><div>{history.author}</div>  
                            </div>
                            <div className="material-history__text left ">
                            <div >Key</div><div> {history.changes}</div>
                            </div>
                            <div className="material-history__text left bcn-1">
                            <div >Date</div><div>{history.date}</div>
                            </div>
                            <div className="material-history__text material-history-text--padded left">
                            <div >Message</div><div> {history.message}</div>
                            </div>
                        </div>
                    </div> : null}
                    {this.renderShowChangeButton(history)}
                </div>
            })}
        </>
    }
}