import React, { useState } from 'react'
import { ReactComponent as Commit } from '../../assets/icons/ic-commit.svg';
import { ReactComponent as PersonIcon } from '../../assets/icons/ic-person.svg';
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/ic-message.svg';
import { ReactComponent as BranchIcon } from '../../assets/icons/ic-branch.svg';
import { ReactComponent as BranchMain } from '../../assets/icons/ic-branch-main.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check-circle.svg';
import { ReactComponent as Arrow } from '../../assets/icons/misc/arrow-chevron-down-black.svg';
import { ReactComponent as WebhookIcon } from '../../assets/icons/misc/webhook.svg';
import { SourceTypeMap } from '../../config';
import { CiPipelineSourceConfig } from '../ciPipeline/CiPipelineSourceConfig';


export default function GitCommitInfoGeneric({ materialSourceType, materialSourceValue, commitInfo, selectedCommitInfo, toggleChanges, materialUrl, showMaterialInfo }) {

    const [showSeeMore, setShowSeeMore] = useState(true)

    let _isWebhook = (commitInfo.webhookData && commitInfo.webhookData.id !== 0) || (materialSourceType === SourceTypeMap.WEBHOOK)
    let xyz= abcd(commitInfo)
    console.log(xyz)
    function renderShowChangeButton(commitInfo) {

        return <button type="button" className="material-history__changes-btn cb-5" onClick={(event) => {
            event.stopPropagation();
            setShowSeeMore(!showSeeMore)
        }}>
            {showSeeMore ? "See More" : "See Less"}
        </button>
    }

    function abcd (input) {
            let _output = {};
    
            Object.keys(input).forEach((_key) => {
                let _modifiedKey = _key.toLowerCase();
                if (typeof (input[_key]) === "object") {
                    _output[_modifiedKey] = abcd(input[_key]);
                } else {
                    _output[_modifiedKey] = input[_key];
                }
            })
            return _output;
    }

    return (<>
        {
            showMaterialInfo &&
            <div>
                <span>{materialUrl}</span>
                <CiPipelineSourceConfig sourceType={materialSourceType} sourceValue={materialSourceValue} />
            </div>
        }
        {
            (!_isWebhook) &&
            <>
                <div className="ml-16 mr-16 flex left" style={{ justifyContent: "space-between" }}>
                    {commitInfo?.commitURL ? <a href={commitInfo.commitURL} target="_blank" rel="noopener" className="commit-hash" onClick={e => e.stopPropagation()}>
                        <Commit className="commit-hash__icon" />{commitInfo.commit}
                    </a> : null}
                    {selectedCommitInfo ? <div className="material-history__select-text" >
                        {commitInfo.isSelected ? <Check className="align-right" /> : "Select"}
                    </div> : null}
                </div>
                { commitInfo.author ? <div className="material-history__text">Author: {commitInfo.author}</div> : null}
                { commitInfo.date ? <div className="material-history__text">Date: {commitInfo.date}</div> : null}
                { commitInfo.message ? <div className="material-history__text material-history-text--padded">{commitInfo.message}</div> : null}
            </>
        }

        {
            _isWebhook && commitInfo?.webhookData?.eventActionType == "merged" &&
            <>
                <div className="flex left pr-16" style={{ justifyContent: "space-between" }}>
                    <div className="ml-16 ">
                        {commitInfo.webhookData.data.header ? <div className="flex left cn-9 fw-6 fs-13">{commitInfo.webhookData.data.header}</div> : null}
                        {commitInfo.webhookData.data["git url"] ? <a href={`${commitInfo.webhookData.data["git url"]}`} target="_blank" rel="noopener noreferer" className="no-decor cb-5 "> View git url</a> : null}
                    </div>
                    {selectedCommitInfo ? <div className="material-history__select-text" >
                        {commitInfo.isSelected ? <Check className="align-right" /> : "Select"}
                    </div> : null}
                </div>

                <div className="material-history__header ml-6 mt-12 mb-12">
                    <div className="flex left">
                        <BranchMain className="icon-dim-32" />
                        <div>
                            <div className="flex left mb-8">
                                {commitInfo.webhookData.data["source branch name"] ? <div className=" mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6 mr-8">
                                    <BranchIcon className="icon-dim-12 vertical-align-middle" /> {commitInfo.webhookData.data["source branch name"]}
                                </div> : null}
                                {commitInfo.webhookData.data["source checkout"] ? <a href={commitInfo.commitURL} target="_blank" rel="noopener" className="commit-hash " onClick={e => e.stopPropagation()}>
                                    <Commit className="commit-hash__icon" />{commitInfo.webhookData.data["source checkout"]}
                                </a> : null}
                            </div>
                            <div className="flex left">
                                <div className="mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6 mr-8">
                                    <BranchIcon className="icon-dim-12 vertical-align-middle" /> {commitInfo.webhookData.data["target branch name"]}  </div>
                                <a href={commitInfo.commitURL} target="_blank" rel="noopener" className="commit-hash " onClick={e => e.stopPropagation()}>
                                    <Commit className="commit-hash__icon" />{commitInfo.webhookData.data["target checkout"]}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                { commitInfo.webhookData.data.author ? <div className="material-history__text flex left"> <PersonIcon className="icon-dim-16 mr-8" /> {commitInfo.webhookData.data.author}</div> : null}
                { commitInfo.webhookData.data.date ? <div className="material-history__text flex left">  <CalendarIcon className="icon-dim-16 mr-8" /> {commitInfo.webhookData.data.date}</div> : null}
                { commitInfo.webhookData.data.message ? <div className="material-history__text flex left material-history-text--padded"><MessageIcon className="icon-dim-16 mr-8" />{commitInfo.webhookData.data.message}</div> : null}
                </div>

                {!showSeeMore ? <div className="material-history__all-changes">
                    <div className="material-history__body" >
                        {Object.keys(commitInfo.webhookData.data).map((_key) => <>
                            {( _key=="author" || _key == "date" || _key == "git url" || _key == "source branch name" || _key == "source checkout" || _key == "target branch name" || _key == "target checkout" || _key == "header") ? null
                                : <div key={_key} className="material-history__text material-history__grid left bcn-1"><div >{_key}</div><div>{commitInfo.webhookData.data[_key]}</div> </div>
                            }
                        </>
                        )}
                    </div>
                </div> : null}

                {renderShowChangeButton(commitInfo)}
            </>

        }
        {
            _isWebhook && commitInfo.webhookData.eventActionType == "non-merged" && <>
                <div className="flex left pr-16" style={{ justifyContent: "space-between" }}>
                    <div className="flex left cn-9 fw-6 fs-13 ml-16 box-shadow"> {commitInfo.webhookData.data["target checkout"]}</div>
                    {selectedCommitInfo ? <div className="material-history__select-text" >
                        {commitInfo.isSelected ? <Check className="align-right" /> : "Select"}
                    </div> : null}
                </div>
                { commitInfo.webhookData.data.author ? <div className="material-history__text flex left"> <PersonIcon className="icon-dim-16 mr-8" /> {commitInfo.webhookData.data.author}</div> : null}
                { commitInfo.webhookData.data.date ? <div className="material-history__text flex left">  <CalendarIcon className="icon-dim-16 mr-8" /> {commitInfo.webhookData.data.date}</div> : null}
                { commitInfo.webhookData.data.message ? <div className="material-history__text flex left material-history-text--padded"><MessageIcon className="icon-dim-16 mr-8" />{commitInfo.webhookData.data.message}</div> : null}
                {!showSeeMore ? <div className="material-history__all-changes">
                    <div className="material-history__body" >
                        {Object.keys(commitInfo.webhookData.data).map((_key) => <>
                            {(_key == "author" || _key == "date" || _key == "target checkout" ) ? null
                                : <div key={_key} className="material-history__text material-history__grid left bcn-1"><div >{_key}</div><div>{commitInfo.webhookData.data[_key]}</div> </div>
                            }
                        </>
                        )}
                    </div>
                </div> : null}

                {renderShowChangeButton(commitInfo)}
            </>

        }

    </>

    )


}
