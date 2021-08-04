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

    let _isWebhook = (materialSourceType === SourceTypeMap.WEBHOOK) || (commitInfo && commitInfo.webhookData && commitInfo.webhookData.id !== 0);
    let _lowerCaseCommitInfo = lowerCaseObject(commitInfo);
    let _webhookData = _isWebhook ? _lowerCaseCommitInfo.webhookdata : {};

    function renderShowChangeButton() {

        return <button type="button" className="material-history__changes-btn cb-5" onClick={(event) => {
            event.stopPropagation();
            setShowSeeMore(!showSeeMore)
        }}>
            {showSeeMore ? "See More" : "See Less"}
        </button>
    }

    function lowerCaseObject (input) : any {
        let _output = {};
        if(!input){
            return _output;
        }
        Object.keys(input).forEach((_key) => {
            let _modifiedKey = _key.toLowerCase();
            let _value = input[_key];
            if (_value && (typeof _value === "object")) {
                _output[_modifiedKey] = lowerCaseObject(_value);
            } else {
                _output[_modifiedKey] = _value;
            }
        })
        return _output;
    }

    return (<>
        {
            showMaterialInfo &&
            <div>
                <span>{materialUrl}</span>
                <CiPipelineSourceConfig sourceType={materialSourceType} sourceValue={materialSourceValue} showTooltip={true} />
            </div>
        }
        {
            (!_isWebhook) &&
            <>
                <div className="ml-16 mr-16 flex left" style={{ justifyContent: "space-between" }}>
                    {_lowerCaseCommitInfo?.commiturl ? <a href={_lowerCaseCommitInfo.commiturl} target="_blank" rel="noopener" className="commit-hash" onClick={e => e.stopPropagation()}>
                        <Commit className="commit-hash__icon" />{_lowerCaseCommitInfo.commit}
                    </a> : null}
                    {selectedCommitInfo ? <div className="material-history__select-text" >
                        {_lowerCaseCommitInfo.isselected ? <Check className="align-right" /> : "Select"}
                    </div> : null}
                </div>
                { _lowerCaseCommitInfo.author ? <div className="material-history__text">Author: {_lowerCaseCommitInfo.author}</div> : null}
                { _lowerCaseCommitInfo.date ? <div className="material-history__text">Date: {_lowerCaseCommitInfo.date}</div> : null}
                { _lowerCaseCommitInfo.message ? <div className="material-history__text material-history-text--padded">{_lowerCaseCommitInfo.message}</div> : null}
            </>
        }

        {
            _isWebhook && _webhookData.eventactiontype == "merged" &&
            <>
                <div className="flex left pr-16" style={{ justifyContent: "space-between" }}>
                    <div className="ml-16 ">
                        {_webhookData.data.header ? <div className="flex left cn-9 fw-6 fs-13">{_webhookData.data.header}</div> : null}
                        {_webhookData.data["git url"] ? <a href={`${_webhookData.data["git url"]}`} target="_blank" rel="noopener noreferer" className="no-decor cb-5 "> View git url</a> : null}
                    </div>
                    {selectedCommitInfo ? <div className="material-history__select-text" >
                        {_lowerCaseCommitInfo.isselected ? <Check className="align-right" /> : "Select"}
                    </div> : null}
                </div>

                <div className="material-history__header ml-6 mt-12 mb-12">
                    <div className="flex left">
                        <BranchMain className="icon-dim-32" />
                        <div>
                            <div className="flex left mb-8">
                                {_webhookData.data["source branch name"] ? <div className=" mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6 mr-8">
                                    <BranchIcon className="icon-dim-12 vertical-align-middle" /> {_webhookData.data["source branch name"]}
                                </div> : null}
                                {_webhookData.data["source checkout"] ?
                                    <><Commit className="commit-hash__icon" />{_webhookData.data["source checkout"]}</>
                                : null}
                            </div>
                            <div className="flex left">
                                <div className="mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6 mr-8">
                                    <BranchIcon className="icon-dim-12 vertical-align-middle" /> {_webhookData.data["target branch name"]}  </div>
                                    <Commit className="commit-hash__icon" />{_webhookData.data["target checkout"]}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                { _webhookData.data.author ? <div className="material-history__text flex left"> <PersonIcon className="icon-dim-16 mr-8" /> {_webhookData.data.author}</div> : null}
                { _webhookData.data.date ? <div className="material-history__text flex left">  <CalendarIcon className="icon-dim-16 mr-8" /> {_webhookData.data.date}</div> : null}
                { _webhookData.data.message ? <div className="material-history__text flex left material-history-text--padded"><MessageIcon className="icon-dim-16 mr-8" />{_webhookData.data.message}</div> : null}
                </div>

                {!showSeeMore ? <div className="material-history__all-changes">
                    <div className="material-history__body" >
                        {Object.keys(_webhookData.data).map((_key) => <>
                            {( _key=="author" || _key == "date" || _key == "git url" || _key == "source branch name" || _key == "source checkout" || _key == "target branch name" || _key == "target checkout" || _key == "header") ? null
                                : <div key={_key} className="material-history__text material-history__grid left bcn-1"><div >{_key}</div><div>{_webhookData.data[_key]}</div> </div>
                            }
                        </>
                        )}
                    </div>
                </div> : null}

                {renderShowChangeButton()}
            </>

        }
        {
            _isWebhook && _webhookData.eventactiontype == "non-merged" && <>
                <div className="flex left pr-16" style={{ justifyContent: "space-between" }}>
                    <div className="flex left cn-9 fw-6 fs-13 ml-16 box-shadow"> {_webhookData.data["target checkout"]}</div>
                    {selectedCommitInfo ? <div className="material-history__select-text" >
                        {_lowerCaseCommitInfo.isselected ? <Check className="align-right" /> : "Select"}
                    </div> : null}
                </div>
                { _webhookData.data.author ? <div className="material-history__text flex left"> <PersonIcon className="icon-dim-16 mr-8" /> {_webhookData.data.author}</div> : null}
                { _webhookData.data.date ? <div className="material-history__text flex left">  <CalendarIcon className="icon-dim-16 mr-8" /> {_webhookData.data.date}</div> : null}
                { _webhookData.data.message ? <div className="material-history__text flex left material-history-text--padded"><MessageIcon className="icon-dim-16 mr-8" />{_webhookData.data.message}</div> : null}
                {!showSeeMore ? <div className="material-history__all-changes">
                    <div className="material-history__body" >
                        {Object.keys(_webhookData.data).map((_key) => <>
                            {(_key == "author" || _key == "date" || _key == "target checkout" ) ? null
                                : <div key={_key} className="material-history__text material-history__grid left bcn-1"><div >{_key}</div><div>{_webhookData.data[_key]}</div> </div>
                            }
                        </>
                        )}
                    </div>
                </div> : null}

                {renderShowChangeButton()}
            </>

        }

    </>

    )


}
