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

/* eslint-disable eqeqeq */
import { useState } from 'react'
import moment from 'moment'
import Tippy from '@tippyjs/react'
import ClipboardButton from '@Common/ClipboardButton/ClipboardButton'
import { ReactComponent as Circle } from '@Icons/ic-circle.svg'
import { ReactComponent as Commit } from '@Icons/ic-commit.svg'
import { ReactComponent as CommitIcon } from '@Icons/ic-code-commit.svg'
import { ReactComponent as PersonIcon } from '@Icons/ic-person.svg'
import { ReactComponent as CalendarIcon } from '@Icons/ic-calendar.svg'
import { ReactComponent as MessageIcon } from '@Icons/ic-message.svg'
import { ReactComponent as BranchIcon } from '@Icons/ic-branch.svg'
import { ReactComponent as BranchMain } from '@Icons/ic-branch-main.svg'
import { ReactComponent as Check } from '@Icons/ic-check-circle.svg'
import { ReactComponent as Abort } from '@Icons/ic-abort.svg'
import { SourceTypeMap, createGitCommitUrl } from '@Common/Common.service'
import { stopPropagation } from '@Common/Helper'
import { DATE_TIME_FORMATS } from '@Common/Constants'
import GitMaterialInfoHeader from './GitMaterialInfoHeader'
import { MATERIAL_EXCLUDE_TIPPY_TEXT } from '../../constants'
import { WEBHOOK_EVENT_ACTION_TYPE } from './constants'
import { GitCommitInfoGenericProps } from './types'

const GitCommitInfoGeneric = ({
    materialSourceType,
    materialSourceValue,
    commitInfo,
    selectedCommitInfo,
    materialUrl,
    showMaterialInfoHeader,
    canTriggerBuild = false,
    index,
    isExcluded = false,
}: GitCommitInfoGenericProps) => {
    const [showSeeMore, setShowSeeMore] = useState(true)

    function _lowerCaseObject(input): any {
        const _output = {}
        if (!input) {
            return _output
        }
        Object.keys(input).forEach((_key) => {
            const _modifiedKey = _key.toLowerCase()
            const _value = input[_key]
            if (_value && typeof _value === 'object') {
                _output[_modifiedKey] = _lowerCaseObject(_value)
            } else {
                _output[_modifiedKey] = _value
            }
        })
        return _output
    }

    const _lowerCaseCommitInfo = _lowerCaseObject(commitInfo)
    const _isWebhook =
        materialSourceType === SourceTypeMap.WEBHOOK ||
        (_lowerCaseCommitInfo && _lowerCaseCommitInfo.webhookdata && _lowerCaseCommitInfo.webhookdata.id !== 0)
    const _webhookData = _isWebhook ? _lowerCaseCommitInfo.webhookdata : {}
    // eslint-disable-next-line no-nested-ternary
    const _commitUrl = _isWebhook
        ? null
        : _lowerCaseCommitInfo.commiturl
          ? _lowerCaseCommitInfo.commiturl
          : createGitCommitUrl(materialUrl, _lowerCaseCommitInfo.commit)

    function renderBasicGitCommitInfoForWebhook() {
        let _date
        if (_webhookData.data.date) {
            const _moment = moment(_webhookData.data.date, 'YYYY-MM-DDTHH:mm:ssZ')
            _date = _moment.isValid() ? _moment.format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT) : _webhookData.data.date
        }
        return (
            <>
                {_webhookData.data.author ? (
                    <div className="material-history__text lh-20 flex left dc__gap-8">
                        <PersonIcon className="icon-dim-16" /> {_webhookData.data.author}
                    </div>
                ) : null}
                {_date ? (
                    <div className="material-history__text lh-20 flex left dc__gap-8">
                        <CalendarIcon className="icon-dim-16" />
                        <time className="cn-7 fs-12">{_date}</time>
                    </div>
                ) : null}
                {_webhookData.data.message ? (
                    <div className="material-history__text lh-20 flex left dc__gap-8 top material-history-text--padded">
                        <MessageIcon className="icon-dim-16 mw-16 mr-8 mt-2" />
                        {_webhookData.data.message}
                    </div>
                ) : null}
            </>
        )
    }

    function renderMoreDataForWebhook(_moreData) {
        return !showSeeMore ? (
            <div className="material-history__all-changes">
                <div className="material-history__body mt-4">
                    {Object.keys(_moreData).map((_key, idx) => {
                        let classes
                        if (idx % 2 == 0) {
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
    }

    function renderSeeMoreButtonForWebhook() {
        return (
            <button
                type="button"
                className="fs-12 fw-6 pt-12 mt-12 pl-12 pr-12 w-100 bcn-0 flex left br-4 dc__box-shadow-top cb-5 dc__no-border"
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
        const _moreData = {}
        if (_webhookData.eventactiontype === WEBHOOK_EVENT_ACTION_TYPE.MERGED) {
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
        } else if (_webhookData.eventactiontype === WEBHOOK_EVENT_ACTION_TYPE.NON_MERGED) {
            Object.keys(_webhookData.data).forEach((_key) => {
                if (_key !== 'author' && _key !== 'date' && _key !== 'target checkout') {
                    _moreData[_key] = _webhookData.data[_key]
                }
            })
        }

        const _hasMoreData = Object.keys(_moreData).length > 0

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
                    interactive
                >
                    <span
                        data-testid="excluded-git-commit"
                        className="dc_max-width__max-content flex left cr-5 cursor-not-allowed dc__uppercase"
                    >
                        <Abort className="mr-4 fcr-5" />
                        Excluded
                    </span>
                </Tippy>
            )
        }

        return <Circle data-testid="valid-git-commit" />
    }

    const renderCommitStatus = () => {
        if (_lowerCaseCommitInfo.isselected) {
            return <Check data-testid="selected-git-commit" className="dc__align-right icon-dim-20" />
        }
        return matSelectionText()
    }

    return (
        <div className="git-commit-info-generic__wrapper cn-9 fs-12">
            {showMaterialInfoHeader && (_isWebhook || _lowerCaseCommitInfo.commit) && (
                <GitMaterialInfoHeader
                    index={index}
                    repoUrl={materialUrl}
                    materialType={materialSourceType}
                    materialValue={materialSourceValue}
                />
            )}
            <div className="flexbox-col left dc__gap-8 p-16">
                {!_isWebhook && (
                    <>
                        {_lowerCaseCommitInfo.commit && (
                            <div className="flex dc__content-space">
                                {_commitUrl ? (
                                    <div className="flex dc__gap-8">
                                        <a
                                            href={_commitUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="commit-hash"
                                            onClick={stopPropagation}
                                            data-testid={`deployment-history-source-code-material-history${index}`}
                                        >
                                            <div
                                                className="material-history__header flex dc__gap-4"
                                                data-testid={`git-commit-credential${index}`}
                                            >
                                                <Commit className="commit-hash__icon mr-0" />
                                                {_lowerCaseCommitInfo.commit.slice(0, 7)}
                                            </div>
                                        </a>
                                        <span
                                            className="git-commit-info-generic__copy dc__visibility-hidden p-2"
                                            data-testid="git-commit-copy"
                                        >
                                            <ClipboardButton content={_lowerCaseCommitInfo.commit} />
                                        </span>
                                    </div>
                                ) : null}
                                {selectedCommitInfo ? renderCommitStatus() : null}
                            </div>
                        )}
                        {_lowerCaseCommitInfo.message ? (
                            <div
                                data-testid={`${_lowerCaseCommitInfo.message.trim()}-${isExcluded ? 'excluded' : 'included'}`}
                                className="material-history__text lh-20 flex left dc__gap-8 top material-history-text--padded dc__word-break-all"
                            >
                                <span className="fs-13 fw-6 lh-20 cn-9  dc__truncate--clamp-3">
                                    {_lowerCaseCommitInfo.message}
                                </span>
                            </div>
                        ) : null}
                        <div className="flexbox-col dc__gap-4">
                            {_lowerCaseCommitInfo.author ? (
                                <div className="material-history__text lh-20 flex left dc__gap-8">
                                    <PersonIcon className="icon-dim-16" />
                                    <span className="lh-20"> {_lowerCaseCommitInfo.author}</span>
                                </div>
                            ) : null}
                            {_lowerCaseCommitInfo.date ? (
                                <div className="material-history__text lh-20 flex left dc__gap-8">
                                    <CalendarIcon className="icon-dim-16" />
                                    <span className="lh-20">
                                        {moment(_lowerCaseCommitInfo.date).format(
                                            DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT,
                                        )}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </>
                )}

                {_isWebhook && _webhookData.eventactiontype === WEBHOOK_EVENT_ACTION_TYPE.MERGED && (
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
                                        rel="noopener noreferrer"
                                        className="dc__no-decor cb-5"
                                    >
                                        View git url
                                    </a>
                                ) : null}
                            </div>
                            {selectedCommitInfo ? (
                                <div className="flexbox dc__align-items-center dc__content-end fs-12">
                                    {_lowerCaseCommitInfo.isselected ? (
                                        <Check className="dc__align-right" />
                                    ) : (
                                        <Circle data-testid="valid-git-commit" />
                                    )}
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
                                                    rel="noopener noreferrer"
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
                                                    rel="noopener noreferrer"
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
                {_isWebhook && _webhookData.eventactiontype === WEBHOOK_EVENT_ACTION_TYPE.NON_MERGED && (
                    <>
                        <div className="flex left pr-16 pb-8 dc__content-space">
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
            </div>
        </div>
    )
}

export default GitCommitInfoGeneric
