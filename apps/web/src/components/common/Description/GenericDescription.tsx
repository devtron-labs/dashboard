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

import React, { useState, useEffect, useRef } from 'react'
import ReactMde from 'react-mde'
import Tippy from '@tippyjs/react'
import moment from 'moment'
import { patchApplicationNote, patchClusterNote } from '../../ClusterNodes/clusterNodes.service'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { showError, TOAST_ACCESS_DENIED, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { MDEditorSelectedTabType } from '../../ClusterNodes/types'
import { ReactComponent as HeaderIcon } from '../../../assets/icons/mdeditor/ic-header.svg'
import { ReactComponent as BoldIcon } from '../../../assets/icons/mdeditor/ic-bold.svg'
import { ReactComponent as ItalicIcon } from '../../../assets/icons/mdeditor/ic-italic.svg'
import { ReactComponent as LinkIcon } from '../../../assets/icons/mdeditor/ic-link.svg'
import { ReactComponent as StrikethroughIcon } from '../../../assets/icons/mdeditor/ic-strikethrough.svg'
import { ReactComponent as CodeIcon } from '../../../assets/icons/mdeditor/ic-code.svg'
import { ReactComponent as QuoteIcon } from '../../../assets/icons/mdeditor/ic-quote.svg'
import { ReactComponent as ImageIcon } from '../../../assets/icons/mdeditor/ic-image.svg'
import { ReactComponent as OrderedListIcon } from '../../../assets/icons/mdeditor/ic-ordered-list.svg'
import { ReactComponent as UnorderedListIcon } from '../../../assets/icons/mdeditor/ic-unordered-list.svg'
import { ReactComponent as CheckedListIcon } from '../../../assets/icons/mdeditor/ic-checked-list.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { deepEqual } from '..'
import { Moment12HourFormat } from '../../../config'
import {
    DEFAULT_MARKDOWN_EDITOR_PREVIEW_MESSAGE,
    MARKDOWN_EDITOR_COMMANDS,
    MD_EDITOR_TAB,
    CLUSTER_DESCRIPTION_EMPTY_ERROR_MSG,
    CLUSTER_DESCRIPTION_UNSAVED_CHANGES_MSG,
    CLUSTER_DESCRIPTION_UPDATE_MSG,
    MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT,
    MARKDOWN_EDITOR_COMMAND_TITLE,
} from '../../ClusterNodes/constants'
import './GenericDescription.scss'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import { AppMetaInfo } from '../../app/types'

export default function GenericDescription({
    isClusterTerminal,
    clusterId,
    isSuperAdmin,
    appId,
    descriptionId,
    initialDescriptionText,
    initialDescriptionUpdatedBy,
    initialDescriptionUpdatedOn,
    initialEditDescriptionView,
    updateCreateAppFormDescription,
    appMetaInfo,
    tabIndex,
}: {
    isClusterTerminal: boolean
    clusterId?: string
    isSuperAdmin: boolean
    appId?: number
    descriptionId?: number
    initialDescriptionText?: string
    initialDescriptionUpdatedBy?: string
    initialDescriptionUpdatedOn?: string
    initialEditDescriptionView: boolean
    updateCreateAppFormDescription?: (string) => void
    appMetaInfo?: AppMetaInfo
    tabIndex?: number
}) {
    const [isEditDescriptionView, setEditDescriptionView] = useState<boolean>(initialEditDescriptionView)
    const [descriptionText, setDescriptionText] = useState<string>(initialDescriptionText)
    const [descriptionUpdatedBy, setDescriptionUpdatedBy] = useState<string>(initialDescriptionUpdatedBy)
    const [descriptionUpdatedOn, setDescriptionUpdatedOn] = useState<string>(initialDescriptionUpdatedOn)
    const [modifiedDescriptionText, setModifiedDescriptionText] = useState<string>(initialDescriptionText)
    const [selectedTab, setSelectedTab] = useState<MDEditorSelectedTabType>(MD_EDITOR_TAB.WRITE)
    const isDescriptionModified: boolean = !deepEqual(descriptionText, modifiedDescriptionText)
    const mdeRef = useRef(null)

    useEffect(() => {
        if (typeof updateCreateAppFormDescription === 'function') {
            updateCreateAppFormDescription(modifiedDescriptionText)
        }
    }, [modifiedDescriptionText])

    useEffect(() => {
        if (!isClusterTerminal && appId == 0) {
            mdeRef.current?.finalRefs?.textarea?.current?.focus()
        }
    }, [isEditDescriptionView])

    const validateDescriptionText = (): boolean => {
        let isValid = true
        if (modifiedDescriptionText.length === 0) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: CLUSTER_DESCRIPTION_EMPTY_ERROR_MSG,
            })
            isValid = false
        }
        return isValid
    }

    const toggleDescriptionView = () => {
        if (isAuthorized()) {
            let isConfirmed: boolean = true
            if (isDescriptionModified) {
                isConfirmed = window.confirm(CLUSTER_DESCRIPTION_UNSAVED_CHANGES_MSG)
            }
            if (isConfirmed) {
                setModifiedDescriptionText(descriptionText)
                setEditDescriptionView(!isEditDescriptionView)
                setSelectedTab(MD_EDITOR_TAB.WRITE)
            }
        }
    }

    const handleSave = () => {
        if (isClusterTerminal) {
            updateClusterAbout()
        } else {
            updateApplicationAbout()
        }
    }

    const isAuthorized = (): boolean => {
        if (!isSuperAdmin && isClusterTerminal) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
            return false
        }
        return true
    }

    const updateApplicationAbout = (): void => {
        const isValidate = validateDescriptionText()
        if (!isValidate) {
            return
        }
        const requestPayload = {
            id: descriptionId,
            identifier: Number(appId),
            description: modifiedDescriptionText,
        }
        patchApplicationNote(requestPayload)
            .then((response) => {
                if (response.result) {
                    setDescriptionText(response.result.description)
                    setDescriptionUpdatedBy(response.result.updatedBy)
                    const _moment = moment(response.result.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                    const _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.updatedOn
                    setDescriptionUpdatedOn(_date)
                    setModifiedDescriptionText(response.result.description)
                    appMetaInfo.note = response.result
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: CLUSTER_DESCRIPTION_UPDATE_MSG,
                    })
                    setEditDescriptionView(true)
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    const updateClusterAbout = (): void => {
        const isValidate = validateDescriptionText()
        if (!isValidate) {
            return
        }
        const requestPayload = {
            id: descriptionId,
            identifier: Number(clusterId),
            description: modifiedDescriptionText,
        }
        patchClusterNote(requestPayload)
            .then((response) => {
                if (response.result) {
                    setDescriptionText(response.result.description)
                    setDescriptionUpdatedBy(response.result.updatedBy)
                    const _moment = moment(response.result.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                    const _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.updatedOn
                    setDescriptionUpdatedOn(_date)
                    setModifiedDescriptionText(response.result.description)
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: CLUSTER_DESCRIPTION_UPDATE_MSG,
                    })
                    setEditDescriptionView(true)
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    const editorCustomIcon = (commandName: string): JSX.Element => {
        switch (commandName) {
            case MARKDOWN_EDITOR_COMMAND_TITLE.HEADER:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <HeaderIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.BOLD:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <BoldIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.ITALIC:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <ItalicIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.STRIKETHROUGH:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <StrikethroughIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.LINK:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <LinkIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.QUOTE:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <QuoteIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.CODE:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <CodeIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.IMAGE:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <ImageIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.UNORDERED_LIST:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <UnorderedListIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.ORDERED_LIST:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <OrderedListIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
            case MARKDOWN_EDITOR_COMMAND_TITLE.CHECKED_LIST:
                return (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT[commandName]}
                    >
                        <div className="flex">
                            <CheckedListIcon className="icon-dim-16 flex" />
                        </div>
                    </Tippy>
                )
        }
    }

    return (
        <div className={`cluster__body-details ${initialEditDescriptionView ? 'pb-16 dc__overflow-scroll' : ''}`}>
            <div
                data-testid="cluster-note-wrapper"
                className={!isEditDescriptionView ? 'dc__overflow-auto' : 'dc__overflow-hidden'}
            >
                {isEditDescriptionView ? (
                    <div className="min-w-500 bcn-0 br-4 dc__border-top dc__border-left dc__border-right w-100 dc__border-bottom">
                        <div className="pt-8 pb-8 pl-16 pr-16 dc__top-radius-4 flex bc-n50 dc__border-bottom h-36 fs-13">
                            <div className="fw-6 lh-20 cn-9">Readme</div>
                            {descriptionUpdatedBy && descriptionUpdatedOn && (
                                <div className="flex left fw-4 cn-7 ml-8">
                                    Last updated by {descriptionUpdatedBy} on {descriptionUpdatedOn}
                                </div>
                            )}
                            <div
                                data-testid="description-edit-button"
                                className="dc__align-right pencil-icon cursor flex fw-6 cn-7"
                                onClick={toggleDescriptionView}
                            >
                                <Edit className="icon-dim-16 mr-4 scn-7" /> Edit
                            </div>
                        </div>
                        <ReactMde
                            classes={{
                                reactMde:
                                    'mark-down-editor-container dc__word-break pb-16 pt-8 mark-down-editor__no-border',
                                toolbar: 'mark-down-editor__hidden',
                                preview: 'mark-down-editor-preview dc__bottom-radius-4',
                                textArea: 'mark-down-editor__hidden',
                            }}
                            value={descriptionText}
                            selectedTab="preview"
                            minPreviewHeight={150}
                            generateMarkdownPreview={(markdown) =>
                                Promise.resolve(<MarkDown markdown={markdown} breaks disableEscapedText />)
                            }
                        />
                    </div>
                ) : (
                    <div className="min-w-500">
                        <ReactMde
                            ref={mdeRef}
                            classes={{
                                reactMde: `mark-down-editor-container dc__word-break ${
                                    initialEditDescriptionView ? '' : 'create-app-description'
                                }`,
                                toolbar: 'mark-down-editor-toolbar tab-description',
                                preview: 'mark-down-editor-preview pt-8',
                                textArea: `mark-down-editor-textarea-wrapper ${
                                    initialEditDescriptionView ? '' : 'h-200-imp'
                                }`,
                            }}
                            getIcon={(commandName: string) => editorCustomIcon(commandName)}
                            toolbarCommands={MARKDOWN_EDITOR_COMMANDS}
                            value={modifiedDescriptionText}
                            onChange={setModifiedDescriptionText}
                            minEditorHeight={window.innerHeight - 165}
                            minPreviewHeight={150}
                            selectedTab={selectedTab}
                            onTabChange={setSelectedTab}
                            generateMarkdownPreview={(markdown: string) =>
                                Promise.resolve(
                                    <MarkDown markdown={markdown || DEFAULT_MARKDOWN_EDITOR_PREVIEW_MESSAGE} breaks />,
                                )
                            }
                            childProps={{
                                writeButton: {
                                    className: `tab-list__tab pointer fs-13 ${
                                        selectedTab === MD_EDITOR_TAB.WRITE && 'cb-5 fw-6 active active-tab'
                                    }`,
                                },
                                previewButton: {
                                    className: `tab-list__tab pointer fs-13 ${
                                        selectedTab === MD_EDITOR_TAB.PREVIEW && 'cb-5 fw-6 active active-tab'
                                    }`,
                                },
                                textArea: {
                                    tabIndex,
                                },
                            }}
                        />
                        {initialEditDescriptionView && (
                            <div className="form cluster__description-footer pt-12 pb-12">
                                <div className="form__buttons pl-16 pr-16">
                                    <button
                                        data-testid="description-edit-cancel-button"
                                        className="cta cancel flex h-36 mr-12"
                                        type="button"
                                        onClick={toggleDescriptionView}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        data-testid="description-edit-save-button"
                                        className="cta flex h-36"
                                        type="submit"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
