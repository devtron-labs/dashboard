import React from 'react'
import { ReactComponent as Commit } from '../../../../assets/icons/ic-commit.svg';
import { ReactComponent as PersonIcon } from '../../../../assets/icons/ic-person.svg';
import { ReactComponent as CalendarIcon } from '../../../../assets/icons/ic-calendar.svg';
import { ReactComponent as MessageIcon } from '../../../../assets/icons/ic-message.svg';
import { ReactComponent as BranchIcon } from '../../../../assets/icons/ic-branch.svg';
import { ReactComponent as BranchMain } from '../../../../assets/icons/ic-branch-main.svg';
import { ReactComponent as Check } from '../../../../assets/icons/ic-check-circle.svg';
import { ReactComponent as Arrow } from '../../../../assets/icons/misc/arrow-chevron-down-black.svg';

export default function TriggerViewMergedCI({ material, history, selectCommit, toggleChanges }) {

    function renderShowChangeButton(history) {
        return <button type="button" className="material-history__changes-btn" onClick={(event) => {
            event.stopPropagation();
            toggleChanges(material.id.toString(), history.commit)
        }}>
            {history.showChanges ? "Hide Changes" : "Show Changes"}
            <Arrow style={{ 'transform': `${history.showChanges ? 'rotate(-180deg)' : ''}` }} />
        </button>
    }
    return (
        <div>
            <div className="flex left pr-16" style={{ justifyContent: "space-between" }}>
                <div className="ml-16 ">
                    <div className="flex left cn-9 fw-6 fs-13"><BranchIcon className="icon-dim-16 mr-8" style={{ transform: "rotateZ(90deg)" }} /><div className="cn-9">{history.webhookData.data.header}</div></div>
                    <a href={`${history.webhookData.data["git url"]}`} target="_blank" rel="noopener noreferer" className="no-decor cb-5 pl-24"> View git url</a>
                </div>
                {selectCommit ? <div className="material-history__select-text" >
                    {history.isSelected ? <Check className="align-right" /> : "Select"}
                </div> : null}
            </div>

            <div className="material-history__header ml-6 mt-12 mb-12">

                <div className="flex left">
                    <BranchMain className="icon-dim-32" />
                    <div>
                        <div className="flex left mb-8">
                            <div className=" mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6 mr-8">
                                <BranchIcon className="icon-dim-12 mr-8 vertical-align-middle" /> {history.webhookData.data["source branch name"]}
                            </div>
                            <a href={history.commitURL} target="_blank" rel="noopener" className="commit-hash " onClick={e => e.stopPropagation()}>
                                <Commit className="commit-hash__icon" />{history.webhookData.data["source checkout"]}
                            </a>
                        </div>
                        <div className="flex left">
                            <div className="mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6 mr-8">
                                <BranchIcon className="icon-dim-12 mr-8 vertical-align-middle" /> {history.webhookData.data["target branch name"]}  </div>
                            <a href={history.commitURL} target="_blank" rel="noopener" className="commit-hash " onClick={e => e.stopPropagation()}>
                                <Commit className="commit-hash__icon" />{history.webhookData.data["target checkout"]}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="material-history__text flex left">
                    <PersonIcon className="icon-dim-16 mr-8" /> {history.webhookData.data.author}
                </div>
                <div className="material-history__text flex left">
                    <CalendarIcon className="icon-dim-16 mr-8" />{history.date}
                </div>
                <div className="material-history__text material-history-text--padded flex left">
                    <MessageIcon className="icon-dim-16 mr-8" />{history.message}
                </div>
            </div>

            {history.showChanges ? <div className="material-history__all-changes">
                <div className="material-history__body" >
                    <div className="material-history__text material-history__grid left bcn-1">
                        <div >Author</div><div>{history.webhookData.data.author}</div>
                    </div>
                    <div className="material-history__text material-history__grid left ">
                        <div >Key</div><div> {history.changes}</div>
                    </div>
                    <div className="material-history__text material-history__grid left bcn-1">
                        <div >Date</div><div>{history.date}</div>
                    </div>
                    <div className="material-history__text material-history__grid material-history-text--padded left">
                        <div >Message</div><div> {history.message}</div>
                    </div>
                </div>
            </div>
                : null}
            {renderShowChangeButton(history)}
        </div>

    )


}
