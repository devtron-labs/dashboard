import React, { useState } from 'react'
import { ReactComponent as Commit } from '../../assets/icons/ic-commit.svg';
import { ReactComponent as PersonIcon } from '../../assets/icons/ic-person.svg';
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/ic-message.svg';
import { ReactComponent as BranchIcon } from '../../assets/icons/ic-branch.svg';
import { ReactComponent as BranchMain } from '../../assets/icons/ic-branch-main.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check-circle.svg';
import { SourceTypeMap } from '../../config';
import { CiPipelineSourceConfig } from '../ciPipeline/CiPipelineSourceConfig';
import { createGitCommitUrl } from '../common/helpers/git';

export default function GitCommitInfoGeneric({ materialSourceType, materialSourceValue, commitInfo, selectedCommitInfo, materialUrl, showMaterialInfo }) {

    const [showSeeMore, setShowSeeMore] = useState(true)
    let _lowerCaseCommitInfo = lowerCaseObject(commitInfo);
    let _isWebhook = (materialSourceType === SourceTypeMap.WEBHOOK) || (_lowerCaseCommitInfo && _lowerCaseCommitInfo.webhookdata && _lowerCaseCommitInfo.webhookdata.id !== 0);
    let _webhookData = _isWebhook ? _lowerCaseCommitInfo.webhookdata : {};
    let _commitUrl = _isWebhook ? null : (_lowerCaseCommitInfo.commiturl ? _lowerCaseCommitInfo.commiturl : createGitCommitUrl(materialUrl, _lowerCaseCommitInfo.commit));

    function renderShowChangeButton() {

        return <button type="button" className="fs-12 fw-6 pt-8 pb-8 mt-12 pl-12 pr-12 w-100 bcn-0 flex left br-4 box-shadow-top cb-5" style={{ border: "none" }} onClick={(event) => {
            event.stopPropagation();
            setShowSeeMore(!showSeeMore)
        }}>
            {showSeeMore ? "See More" : "See Less"}
        </button>
    }

    function lowerCaseObject(input): any {
        let _output = {};
        if (!input) {
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
                <div className="ml-16 mr-16 mono flex left" style={{ justifyContent: "space-between" }}>
                    {_commitUrl ? <a href={_commitUrl} target="_blank" rel="noopener" className="commit-hash" onClick={e => e.stopPropagation()}>
                        <Commit className="commit-hash__icon" />{_lowerCaseCommitInfo.commit}
                    </a> : null}
                    {selectedCommitInfo ? <div className="material-history__select-text" >
                        {_lowerCaseCommitInfo.isselected ? <Check className="align-right" /> : "Select"}
                    </div> : null}
                </div>
                { _lowerCaseCommitInfo.author ? <div className="material-history__text flex left"><PersonIcon className="icon-dim-16 mr-8" /> {_lowerCaseCommitInfo.author}</div> : null}
                { _lowerCaseCommitInfo.date ? <div className="material-history__text flex left"><CalendarIcon className="icon-dim-16 mr-8" />{_lowerCaseCommitInfo.date}</div> : null}
                { _lowerCaseCommitInfo.message ? <div className="material-history__text material-history-text--padded flex left"><MessageIcon className="icon-dim-16 mr-8" />{_lowerCaseCommitInfo.message}</div> : null}
            </>
        }

        {
            _isWebhook && _webhookData.eventactiontype == "merged" &&
            <>
                <div className="flex left pr-16 box-shadow pb-12" style={{ justifyContent: "space-between" }}>
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
                                    <div className="flex left cb-5 bcb-1 br-4 pl-8 pr-8"><Commit className="commit-hash__icon" />{_webhookData.data["source checkout"]}</div>
                                    : null}
                            </div>
                            <div className="flex left">
                                <div className="mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6 mr-8">
                                    <BranchIcon className="icon-dim-12 vertical-align-middle" /> {_webhookData.data["target branch name"]}  </div>
                                <div className="flex left cb-5 bcb-1 br-4 pl-8 pr-8"><Commit className="commit-hash__icon" />{_webhookData.data["target checkout"]}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {_webhookData.data.author ? <div className="material-history__text flex left"> <PersonIcon className="icon-dim-16 mr-8" /> {_webhookData.data.author}</div> : null}
                    {_webhookData.data.date ? <div className="material-history__text flex left">  <CalendarIcon className="icon-dim-16 mr-8" /> {_webhookData.data.date}</div> : null}
                    {_webhookData.data.message ? <div className="material-history__text flex left material-history-text--padded"><MessageIcon className="icon-dim-16 mr-8" />{_webhookData.data.message}</div> : null}
                </div>

                {!showSeeMore ? <div className="material-history__all-changes">
                    <div className="material-history__body" >
                        {Object.keys(_webhookData.data).map((_key) => <>
                            {(_key == "author" || _key == "date" || _key == "git url" || _key == "source branch name" || _key == "source checkout" || _key == "target branch name" || _key == "target checkout" || _key == "header") ? null
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
                <div className="flex left pr-16 pb-12" style={{ justifyContent: "space-between" }}>
                    <div className="flex left cn-9 fw-6 fs-13 ml-16"> {_webhookData.data["target checkout"]}</div>
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
                            {(_key == "author" || _key == "date" || _key == "target checkout") ? null
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
