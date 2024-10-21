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

import { useState, useRef, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import ReactMde from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import moment from 'moment'
import Markdown from '../Markdown/MarkDown'
import { DATE_TIME_FORMATS, deepEqual, showError } from '..'
import './genericDescription.scss'
import { ReactComponent as Edit } from '../../Assets/Icon/ic-pencil.svg'
import { GenericDescriptionProps, MDEditorSelectedTabType } from './types'
import {
    DEFAULT_MARKDOWN_EDITOR_PREVIEW_MESSAGE,
    MARKDOWN_EDITOR_COMMANDS,
    MARKDOWN_EDITOR_COMMAND_TITLE,
    MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT,
} from '../Markdown/constant'
import { ButtonWithLoader, ToastManager, ToastVariantType } from '../../Shared'
import { ReactComponent as HeaderIcon } from '../../Assets/Icon/ic-header.svg'
import { ReactComponent as BoldIcon } from '../../Assets/Icon/ic-bold.svg'
import { ReactComponent as ItalicIcon } from '../../Assets/Icon/ic-italic.svg'
import { ReactComponent as LinkIcon } from '../../Assets/Icon/ic-link.svg'
import { ReactComponent as StrikethroughIcon } from '../../Assets/Icon/ic-strikethrough.svg'
import { ReactComponent as CodeIcon } from '../../Assets/Icon/ic-code.svg'
import { ReactComponent as QuoteIcon } from '../../Assets/Icon/ic-quote.svg'
import { ReactComponent as ImageIcon } from '../../Assets/Icon/ic-image.svg'
import { ReactComponent as OrderedListIcon } from '../../Assets/Icon/ic-ordered-list.svg'
import { ReactComponent as UnorderedListIcon } from '../../Assets/Icon/ic-unordered-list.svg'
import { ReactComponent as CheckedListIcon } from '../../Assets/Icon/ic-checked-list.svg'
import { DESCRIPTION_EMPTY_ERROR_MSG, DESCRIPTION_UNSAVED_CHANGES_MSG } from './constant'

const GenericDescription = ({
    text,
    updatedBy,
    updatedOn,
    isDescriptionPreview,
    tabIndex,
    updateDescription,
    title,
    minEditorHeight = 300,
}: GenericDescriptionProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isEditDescriptionView, setIsEditDescriptionView] = useState<boolean>(isDescriptionPreview)
    const [modifiedDescriptionText, setModifiedDescriptionText] = useState<string>(text)
    const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>(MDEditorSelectedTabType.WRITE)
    const isDescriptionModified = !deepEqual(text, modifiedDescriptionText)
    const mdeRef = useRef(null)

    useEffect(() => {
        setModifiedDescriptionText(text)
    }, [text])

    // TODO (Arun): Replace with dayjs
    const _moment = moment(updatedOn)
    const _date = _moment.isValid() ? _moment.format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT) : updatedOn

    const validateDescriptionText = (description: string): boolean => {
        let isValid = true
        if (description.length === 0) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: DESCRIPTION_EMPTY_ERROR_MSG,
            })
            isValid = false
        }
        return isValid
    }

    const toggleDescriptionView = () => {
        let isConfirmed: boolean = true
        if (isDescriptionModified && !isEditDescriptionView) {
            // eslint-disable-next-line no-alert
            isConfirmed = window.confirm(DESCRIPTION_UNSAVED_CHANGES_MSG)
        }
        if (isConfirmed) {
            setModifiedDescriptionText(text)
            setIsEditDescriptionView(!isEditDescriptionView)
            setSelectedTab(MDEditorSelectedTabType.WRITE)
        }
    }

    const handleSave = async () => {
        const trimmedDescription = modifiedDescriptionText.trim()
        const isValidate = validateDescriptionText(trimmedDescription)
        if (!isValidate) {
            return
        }
        try {
            setIsLoading(true)
            await updateDescription(trimmedDescription)
            setIsEditDescriptionView(true)
            // Explicitly updating the state, since the modified state gets corrupted
            setModifiedDescriptionText(trimmedDescription)
        } catch (error) {
            showError(error)
        } finally {
            setIsLoading(false)
        }
    }

    // TODO: add commandName
    // eslint-disable-next-line consistent-return
    const editorCustomIcon = (commandName: string): JSX.Element => {
        // eslint-disable-next-line default-case
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
        <div className="cluster__body-details">
            <div data-testid="generic-description-wrapper" className="dc__overflow-hidden">
                {isEditDescriptionView ? (
                    <div className="min-w-500 bcn-0 br-4 dc__border-top dc__border-left dc__border-right w-100 dc__border-bottom">
                        <div className="pt-8 pb-8 pl-16 pr-16 dc__top-radius-4 flex bc-n50 dc__border-bottom h-36">
                            <div className="flexbox dc__gap-6 dc__align-items-center">
                                <UnorderedListIcon className="icon-dim-16" />
                                <div className="fw-6 lh-20 cn-9 fs-13">{title}</div>
                            </div>
                            {updatedBy && _date && (
                                <div className="flex left fw-4 cn-7 ml-8 fs-12 h-20">
                                    Last updated by &nbsp;
                                    <span className="dc__ellipsis-right dc__mxw-200">{updatedBy}</span>&nbsp;on {_date}
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
                            value={text}
                            selectedTab="preview"
                            minPreviewHeight={150}
                            generateMarkdownPreview={(markdown) =>
                                Promise.resolve(<Markdown markdown={markdown} breaks disableEscapedText />)
                            }
                        />
                    </div>
                ) : (
                    <div className="min-w-500">
                        <ReactMde
                            ref={mdeRef}
                            classes={{
                                reactMde: `mark-down-editor-container dc__word-break ${
                                    // TODO (Eshank): The checks are broken here & the height as well
                                    isDescriptionPreview ? '' : 'create-app-description'
                                }`,
                                toolbar: 'mark-down-editor-toolbar tab-description',
                                preview: 'mark-down-editor-preview pt-8',
                                textArea: `mark-down-editor-textarea-wrapper ${
                                    isDescriptionPreview ? '' : 'h-200-imp'
                                }`,
                            }}
                            getIcon={(commandName: string) => editorCustomIcon(commandName)}
                            toolbarCommands={MARKDOWN_EDITOR_COMMANDS}
                            value={modifiedDescriptionText}
                            onChange={setModifiedDescriptionText}
                            minEditorHeight={minEditorHeight}
                            minPreviewHeight={150}
                            selectedTab={selectedTab}
                            onTabChange={setSelectedTab}
                            generateMarkdownPreview={(markdown: string) =>
                                Promise.resolve(
                                    <Markdown markdown={markdown || DEFAULT_MARKDOWN_EDITOR_PREVIEW_MESSAGE} breaks />,
                                )
                            }
                            childProps={{
                                writeButton: {
                                    className: `tab-list__tab pointer fs-13 ${
                                        selectedTab === MDEditorSelectedTabType.WRITE && 'cb-5 fw-6 active active-tab'
                                    }`,
                                },
                                previewButton: {
                                    className: `tab-list__tab pointer fs-13 ${
                                        selectedTab === MDEditorSelectedTabType.PREVIEW && 'cb-5 fw-6 active active-tab'
                                    }`,
                                },
                                textArea: {
                                    tabIndex,
                                },
                            }}
                        />
                        {selectedTab === MDEditorSelectedTabType.WRITE && (
                            <div className="form cluster__description-footer pt-12 pb-12">
                                <div className="form__buttons pl-16 pr-16">
                                    <button
                                        data-testid="description-edit-cancel-button"
                                        className="cta cancel flex h-36 mr-12"
                                        type="button"
                                        onClick={toggleDescriptionView}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <ButtonWithLoader
                                        isLoading={isLoading}
                                        disabled={isLoading}
                                        data-testid="description-edit-save-button"
                                        rootClassName="cta flex h-36"
                                        type="submit"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </ButtonWithLoader>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
export default GenericDescription
