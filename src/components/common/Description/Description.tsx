import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { patchApplicationNote, patchClusterNote } from '../../ClusterNodes/clusterNodes.service'
import ReactMde from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { showError, toastAccessDenied } from '@devtron-labs/devtron-fe-common-lib'
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
import { ReactComponent as DescriptionIcon } from '../../../assets/icons/ic-note.svg'
import { ReactComponent as DropDownIcon } from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import Tippy from '@tippyjs/react'
import { deepEqual } from '..'
import { toast } from 'react-toastify'
import moment from 'moment'
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
import './description.scss'
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
    tabIndex
} : {
    isClusterTerminal: boolean,
    clusterId?: string,
    isSuperAdmin: boolean,
    appId?: number,
    descriptionId?: number,
    initialDescriptionText?: string,
    initialDescriptionUpdatedBy?: string,
    initialDescriptionUpdatedOn?: string,
    initialEditDescriptionView: boolean,
    updateCreateAppFormDescription?: (string) => void
    appMetaInfo?: AppMetaInfo 
    tabIndex?: number
}) {
    const [clusterAboutLoader, setClusterAboutLoader] = useState(false)
    const [isEditDescriptionView, setEditDescriptionView] = useState<boolean>(initialEditDescriptionView)
    const [descriptionText, setDescriptionText] = useState<string>(initialDescriptionText)
    const [descriptionUpdatedBy, setDescriptionUpdatedBy] = useState<string>(initialDescriptionUpdatedBy)
    const [descriptionUpdatedOn, setDescriptionUpdatedOn] = useState<string>(initialDescriptionUpdatedOn)
    const [modifiedDescriptionText, setModifiedDescriptionText] = useState<string>(initialDescriptionText)
    const [showExpandableIcon, setExpandableIcon] = useState<boolean>(false)
    const [showAllText, setShowAllText] = useState(false)
    const [selectedTab, setSelectedTab] = useState<MDEditorSelectedTabType>(MD_EDITOR_TAB.WRITE)
    const isDescriptionModified: boolean = !deepEqual(descriptionText, modifiedDescriptionText)
    const mdeRef = useRef(null)
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
            toast.error(CLUSTER_DESCRIPTION_EMPTY_ERROR_MSG)
            isValid = false
        }
        return isValid
    }

    const toggleShowText = () => {
        setShowAllText(!showAllText)
    }

    const isAuthorized = (): boolean => {
        if (!isSuperAdmin && isClusterTerminal) {
            toastAccessDenied()
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
        setClusterAboutLoader(true)
        patchApplicationNote(requestPayload)
            .then((response) => {
                if (response.result) {
                    setDescriptionText(response.result.description)
                    setDescriptionUpdatedBy(response.result.updatedBy)
                    let _moment = moment(response.result.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                    const _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.updatedOn
                    setDescriptionUpdatedOn(_date)
                    setModifiedDescriptionText(response.result.description)
                    appMetaInfo.description = response.result
                    toast.success(CLUSTER_DESCRIPTION_UPDATE_MSG)
                    setEditDescriptionView(true)
                }
                setClusterAboutLoader(false)
            })
            .catch((error) => {
                showError(error)
                setClusterAboutLoader(false)
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
        setClusterAboutLoader(true)
        patchClusterNote(requestPayload)
            .then((response) => {
                if (response.result) {
                    setDescriptionText(response.result.description)
                    setDescriptionUpdatedBy(response.result.updatedBy)
                    let _moment = moment(response.result.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                    const _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.updatedOn
                    setDescriptionUpdatedOn(_date)
                    setModifiedDescriptionText(response.result.description)
                    toast.success(CLUSTER_DESCRIPTION_UPDATE_MSG)
                    setEditDescriptionView(true)
                }
                setClusterAboutLoader(false)
            })
            .catch((error) => {
                showError(error)
                setClusterAboutLoader(false)
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
                        <HeaderIcon className="icon-dim-16 flex" />
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
                        <BoldIcon className="icon-dim-16 flex" />
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
                        <ItalicIcon className="icon-dim-16 flex" />
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
                        <StrikethroughIcon className="icon-dim-16 flex" />
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
                        <LinkIcon className="icon-dim-16 flex" />
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
                        <QuoteIcon className="icon-dim-16 flex" />
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
                        <CodeIcon className="icon-dim-16 flex" />
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
                        <ImageIcon className="icon-dim-16 flex" />
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
                        <UnorderedListIcon className="icon-dim-16 flex" />
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
                        <OrderedListIcon className="icon-dim-16 flex" />
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
                        <CheckedListIcon className="icon-dim-16 flex" />
                    </Tippy>
                )
        }
    }
    

    return (
        <div
            className={`cluster__body-details ${
                initialEditDescriptionView ? 'pl-16 pr-16 pt-16 pb-16 dc__border-bottom-n1' : ''
            }`}
        >
            <div
                data-testid="cluster-note-wrapper"
                className={!isEditDescriptionView ? 'dc__overflow-auto' : 'dc__overflow-hidden'}
            >
                {isEditDescriptionView ? (
                    <div className="min-w-500 bcn-0 br-4 dc__border-top dc__border-left dc__border-right w-100">
                        <div className="pt-8 pb-8 pl-16 pr-16 dc__top-radius-4 flex bc-n50 dc__border-bottom h-36 fs-13">
                            <div className="flex left fw-6 lh-20 cn-9">
                                <DescriptionIcon className="icon-dim-20 mr-8" />
                                Description
                            </div>
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
                                reactMde: 'mark-down-editor-container pb-16 pt-8 mark-down-editor__no-border',
                                toolbar: 'mark-down-editor__hidden',
                                preview: `mark-down-editor-preview dc__bottom-radius-4 ${
                                    appId && !showAllText && showExpandableIcon ? 'mxh-300-imp' : ''
                                }`,
                                textArea: 'mark-down-editor__hidden',
                            }}
                            value={descriptionText}
                            selectedTab="preview"
                            minPreviewHeight={150}
                            generateMarkdownPreview={(markdown) =>
                            Promise.resolve(<MarkDown markdown={markdown} breaks disableEscapedText setExpandableIcon={setExpandableIcon} />)
                            }
                        />
                        {!isClusterTerminal && (
                            <div className="bcn-0 pl-16 pt-8 pb-12 dc__position-rel dc__zi-4 flex left br-4 dc__border-bottom">
                                {showExpandableIcon && (
                                    <div className="cursor cb-5 fs-13 fw-6 h-20 flex left" onClick={toggleShowText}>
                                        {`${showAllText ? 'Show less' : 'Show more'}`}
                                        <DropDownIcon
                                            style={{ ['--rotateBy' as any]: `${180 * Number(showAllText)}deg` }}
                                            className="fcb-5 ml-4 icon-dim-20 rotate pointer"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="min-w-500">
                        <ReactMde
                            ref={mdeRef}
                            classes={{
                                reactMde: `mark-down-editor-container ${
                                    initialEditDescriptionView ? '' : 'create-app-description'
                                }`,
                                toolbar: 'mark-down-editor-toolbar tab-list',
                                preview: 'mark-down-editor-preview',
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
                                    tabIndex: tabIndex
                                }
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
                                        onClick={() => {
                                            if (isClusterTerminal) {
                                                updateClusterAbout()
                                            } else {
                                                updateApplicationAbout()
                                            }
                                        }}
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
