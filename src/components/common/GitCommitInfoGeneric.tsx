import React, { useState } from 'react'
import { ReactComponent as Commit } from '../../assets/icons/ic-commit.svg'
import { ReactComponent as CommitIcon } from '../../assets/icons/ic-code-commit.svg'
import { ReactComponent as PersonIcon } from '../../assets/icons/ic-person.svg'
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg'
import { ReactComponent as MessageIcon } from '../../assets/icons/ic-message.svg'
import { ReactComponent as BranchIcon } from '../../assets/icons/ic-branch.svg'
import { ReactComponent as BranchMain } from '../../assets/icons/ic-branch-main.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check-circle.svg'
import { ReactComponent as Abort } from '../../assets/icons/ic-abort.svg'
import { SourceTypeMap, Moment12HourFormat } from '../../config'
import { createGitCommitUrl } from '../common/helpers/git'
import { GitMaterialInfoHeader } from './GitMaterialInfo'
import moment from 'moment'
import { stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { MATERIAL_EXCLUDE_TIPPY_TEXT } from '../material/constants'

export default function GitCommitInfoGeneric({
    materialSourceType,
    materialSourceValue,
    commitInfo,
    selectedCommitInfo,
    materialUrl,
    showMaterialInfoHeader,
    canTriggerBuild = false,
    index,
    isExcluded = false
}) {
    const [showSeeMore, setShowSeeMore] = useState(true)
    let _lowerCaseCommitInfo = _lowerCaseObject(commitInfo)
    let _isWebhook =
        materialSourceType === SourceTypeMap.WEBHOOK ||
        (_lowerCaseCommitInfo && _lowerCaseCommitInfo.webhookdata && _lowerCaseCommitInfo.webhookdata.id !== 0)
    let _webhookData = _isWebhook ? _lowerCaseCommitInfo.webhookdata : {}
    let _commitUrl = _isWebhook
        ? null
        : _lowerCaseCommitInfo.commiturl
        ? _lowerCaseCommitInfo.commiturl
        : createGitCommitUrl(materialUrl, _lowerCaseCommitInfo.commit)

    function _lowerCaseObject(input): any {
        let _output = {}
        if (!input) {
            return _output
        }
        Object.keys(input).forEach((_key) => {
            let _modifiedKey = _key.toLowerCase()
            let _value = input[_key]
            if (_value && typeof _value === 'object') {
                _output[_modifiedKey] = _lowerCaseObject(_value)
            } else {
                _output[_modifiedKey] = _value
            }
        })
        return _output
    }

    function renderBasicGitCommitInfoForWebhook() {
        let _date
        if (_webhookData.data.date) {
            let _moment = moment(_webhookData.data.date, 'YYYY-MM-DDTHH:mm:ssZ')
            _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : _webhookData.data.date
        }
        return (
            <>
                {_webhookData.data.author ? (
                    <div className="material-history__text flex left">
                        <PersonIcon className="icon-dim-16 mr-8" /> {_webhookData.data.author}
                    </div>
                ) : null}
                {_date ? (
                    <div className="material-history__text flex left">
                        <CalendarIcon className="icon-dim-16 mr-8" />
                        <time className="cn-7 fs-12">{_date}</time>
                    </div>
                ) : null}
                {_webhookData.data.message ? (
                    <div className="material-history__text flex left top material-history-text--padded">
                        <MessageIcon className="icon-dim-16 mw-16 mr-8 mt-2" />
                        {_webhookData.data.message}
                    </div>
                ) : null}
            </>
        )
    }

    function renderMoreDataForWebhook(_moreData) {
        return (
                !showSeeMore ? (
                    <div className="material-history__all-changes">
                        <div className="material-history__body mt-4">
                            {Object.keys(_moreData).map((_key, index) => {
                                let classes
                                if (index % 2 == 0) {
                                    classes = 'bcn-1'
                                }
                                return (
                                    <div
                                        key={_key}
                                        className={`material-history__text material-history__grid left pt-4 pb-4 ${classes}`}
                                    >
                                        <div>{_key}</div>
                                        <div>{_moreData[_key]}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : null
        )
    }

    function renderSeeMoreButtonForWebhook() {
        return (
            <button
                type="button"
                className="fs-12 fw-6 pt-12 mt-12 pl-12 pr-12 w-100 bcn-0 flex left br-4 dc__box-shadow-top cb-5"
                style={{ border: 'none' }}
                onClick={(event) => {
                    event.stopPropagation()
                    setShowSeeMore(!showSeeMore)
                }}
            >
                {showSeeMore ? 'See More' : 'See Less'}
            </button>
        )
    }

    function handleMoreDataForWebhook() {
        let _moreData = {}
        if (_webhookData.eventactiontype == 'merged') {
            Object.keys(_webhookData.data).forEach((_key) => {
                if (
                    _key != 'author' &&
                    _key != 'date' &&
                    _key != 'git url' &&
                    _key != 'source branch name' &&
                    _key != 'source checkout' &&
                    _key != 'target branch name' &&
                    _key != 'target checkout' &&
                    _key != 'title'
                ) {
                    _moreData[_key] = _webhookData.data[_key]
                }
            })
        } else if (_webhookData.eventactiontype == 'non-merged') {
            Object.keys(_webhookData.data).forEach((_key) => {
                if (_key != 'author' && _key != 'date' && _key != 'target checkout') {
                    _moreData[_key] = _webhookData.data[_key]
                }
            })
        }

        let _hasMoreData = Object.keys(_moreData).length > 0

        return (
            <>
                {_hasMoreData && renderMoreDataForWebhook(_moreData)}
                {_hasMoreData && renderSeeMoreButtonForWebhook()}
            </>
        )
    }

    const matSelectionText = (): JSX.Element => {
        if (isExcluded) {
            return (
                <Tippy
                    className="default-tt w-200 dc__align-left fw-4 fs-12 dc__no-text-transform"
                    arrow={false}
                    placement="bottom"
                    content={MATERIAL_EXCLUDE_TIPPY_TEXT}
                    interactive={true}
                >
                    <span data-testid="excluded-git-commit" className="flex left cr-5 cursor-not-allowed">
                        <Abort className="mr-4 fcr-5" />
                        Excluded
                    </span>
                </Tippy>
            )
        }

        return <span data-testid="valid-git-commit" >Select</span>
    }

    return (
        <>
            {showMaterialInfoHeader && (_isWebhook || _lowerCaseCommitInfo.commit) && (
                <GitMaterialInfoHeader
                    index={index}
                    repoUrl={materialUrl}
                    materialType={materialSourceType}
                    materialValue={materialSourceValue}
                />
            )}

            {!_isWebhook && (
                <>
                    {_lowerCaseCommitInfo.commit && (
                        <div className="ml-16 mr-16 flex dc__content-space">
                            {_commitUrl ? (
                                <a
                                    href={_commitUrl}
                                    target="_blank"
                                    rel="noopener"
                                    className="commit-hash"
                                    onClick={stopPropagation}
                                    data-testid={`deployment-history-source-code-material-history${index}`}
                                >
                                    <div
                                        className="material-history__header"
                                        data-testid={`git-commit-credential${index}`}
                                    >
                                        <Commit className="commit-hash__icon" />
                                        {_lowerCaseCommitInfo.commit}
                                    </div>
                                </a>
                            ) : null}
                            {selectedCommitInfo ? (
                                <div className="material-history__select-text dc_max-width__max-content">
                                    {_lowerCaseCommitInfo.isselected ? (
                                        <Check data-testid="selected-git-commit" className="dc__align-right" />
                                    ) : (
                                        matSelectionText()
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}
                    {_lowerCaseCommitInfo.author ? (
                        <div className="material-history__text flex left">
                            <PersonIcon className="icon-dim-16 mr-8" /> {_lowerCaseCommitInfo.author}
                        </div>
                    ) : null}
                    {_lowerCaseCommitInfo.date ? (
                        <div className="material-history__text flex left">
                            <CalendarIcon className="icon-dim-16 mr-8" /> {_lowerCaseCommitInfo.date}
                        </div>
                    ) : null}
                    {_lowerCaseCommitInfo.message ? (
                        <div data-testid={`${_lowerCaseCommitInfo.message.trim()}-${isExcluded ? "excluded": "included"}`} className="material-history__text flex left top material-history-text--padded">
                            <MessageIcon className="icon-dim-16 mw-16 mr-8 mt-2" />
                            {_lowerCaseCommitInfo.message}
                        </div>
                    ) : null}
                </>
            )}

            {_isWebhook && _webhookData.eventactiontype == 'merged' && (
                <>
                    <div className="flex dc__content-space pr-16 ">
                        <div className="ml-16 ">
                            {_webhookData.data.title ? (
                                <div className="flex left cn-9  fs-13">{_webhookData.data.title}</div>
                            ) : null}
                            {_webhookData.data['git url'] ? (
                                <a
                                    href={`${_webhookData.data['git url']}`}
                                    target="_blank"
                                    rel="noopener noreferer"
                                    className="dc__no-decor cb-5"
                                >
                                    View git url
                                </a>
                            ) : null}
                        </div>
                        {selectedCommitInfo ? (
                            <div className="material-history__select-text material-history__header">
                                {_lowerCaseCommitInfo.isselected ? <Check className="dc__align-right" /> : 'Select'}
                            </div>
                        ) : null}
                    </div>

                    <div className="material-history__header ml-6 mt-12 mb-12">
                        <div className="flex left">
                            <BranchMain className="icon-dim-32" />
                            <div>
                                <div className="flex left mb-8">
                                    {_webhookData.data['source branch name'] ? (
                                        <div className=" mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6">
                                            <BranchIcon className="icon-dim-12 dc__vertical-align-middle" />{' '}
                                            {_webhookData.data['source branch name']}
                                        </div>
                                    ) : null}
                                    {_webhookData.data['source checkout'] ? (
                                        <div className="flex left cb-5 br-4 pl-8 pr-8">
                                            <a
                                                href={createGitCommitUrl(
                                                    materialUrl,
                                                    _webhookData.data['source checkout'],
                                                )}
                                                target="_blank"
                                                rel="noopener"
                                                className="commit-hash"
                                                onClick={stopPropagation}
                                            >
                                                <Commit className="commit-hash__icon" />
                                                {_webhookData.data['source checkout']}
                                            </a>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex left">
                                    <div className="mono cn-7 fs-12 lh-1-5 br-4 bcn-1 pl-6 pr-6">
                                        {_webhookData.data['target branch name'] ? (
                                            <>
                                                <BranchIcon className="icon-dim-12 dc__vertical-align-middle" />{' '}
                                                {_webhookData.data['target branch name']}{' '}
                                            </>
                                        ) : null}
                                    </div>
                                    <div className="flex left cb-5 br-4 pl-8 pr-8">
                                        {canTriggerBuild && (
                                            <div className="flex left bcn-1 br-4 cn-5 pl-8 pr-8">
                                                <CommitIcon className="commit-hash__icon " />
                                                HEAD
                                            </div>
                                        )}
                                        {!canTriggerBuild && (
                                            <a
                                                href={createGitCommitUrl(
                                                    materialUrl,
                                                    _webhookData.data['target checkout'],
                                                )}
                                                target="_blank"
                                                rel="noopener"
                                                className="commit-hash"
                                                onClick={stopPropagation}
                                            >
                                                <Commit className="commit-hash__icon" />
                                                {_webhookData.data['target checkout']}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {renderBasicGitCommitInfoForWebhook()}
                    {handleMoreDataForWebhook()}
                </>
            )}
            {_isWebhook && _webhookData.eventactiontype == 'non-merged' && (
                <>
                    <div className="flex left pr-16 pb-8" style={{ justifyContent: 'space-between' }}>
                        <div className="flex left cn-9 fs-13 ml-16"> {_webhookData.data['target checkout']}</div>
                        {selectedCommitInfo ? (
                            <div className="material-history__select-text">
                                {_lowerCaseCommitInfo.isselected ? <Check className="dc__align-right" /> : 'Select'}
                            </div>
                        ) : null}
                    </div>
                    {renderBasicGitCommitInfoForWebhook()}
                    {handleMoreDataForWebhook()}
                </>
            )}
        </>
    )
}
