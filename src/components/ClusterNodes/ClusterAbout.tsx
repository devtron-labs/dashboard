import React, { useState, useEffect } from 'react'
import { getClusterNote, patchClusterNote } from './clusterNodes.service'
import ReactMde from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { showError, Progressing, ErrorScreenManager } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterAboutPropType, MDEditorSelectedTabType } from './types'
import { ReactComponent as HeaderIcon } from '../../assets/icons/mdeditor/ic-header.svg'
import { ReactComponent as BoldIcon } from '../../assets/icons/mdeditor/ic-bold.svg'
import { ReactComponent as ItalicIcon } from '../../assets/icons/mdeditor/ic-italic.svg'
import { ReactComponent as LinkIcon } from '../../assets/icons/mdeditor/ic-link.svg'
import { ReactComponent as StrikethroughIcon } from '../../assets/icons/mdeditor/ic-strikethrough.svg'
import { ReactComponent as CodeIcon } from '../../assets/icons/mdeditor/ic-code.svg'
import { ReactComponent as QuoteIcon } from '../../assets/icons/mdeditor/ic-quote.svg'
import { ReactComponent as ImageIcon } from '../../assets/icons/mdeditor/ic-image.svg'
import { ReactComponent as OrderedListIcon } from '../../assets/icons/mdeditor/ic-ordered-list.svg'
import { ReactComponent as UnorderedListIcon } from '../../assets/icons/mdeditor/ic-unordered-list.svg'
import { ReactComponent as CheckedListIcon } from '../../assets/icons/mdeditor/ic-checked-list.svg'
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg'
import { ReactComponent as DescriptionIcon } from '../../assets/icons/ic-note.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import Tippy from '@tippyjs/react'
import {
    CLUSTER_DESCRIPTION_EMPTY_ERROR_MSG,
    CLUSTER_DESCRIPTION_UNSAVED_CHANGES_MSG,
    CLUSTER_DESCRIPTION_UPDATE_MSG,
    DEFAULT_MARKDOWN_EDITOR_PREVIEW_MESSAGE,
    MARKDOWN_EDITOR_COMMANDS,
    MARKDOWN_EDITOR_COMMAND_ICON_TIPPY_CONTENT,
    MARKDOWN_EDITOR_COMMAND_TITLE,
    MD_EDITOR_TAB,
    defaultClusterNote,
} from './constants'
import './clusterNodes.scss'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import { toast } from 'react-toastify'
import moment from 'moment'
import { Moment12HourFormat } from '../../config'
import { deepEqual } from '../common'

export default function ClusterAbout({ clusterId }: ClusterAboutPropType) {
    const [errorResponseCode, setErrorResponseCode] = useState<number>()
    const [clusterAboutLoader, setClusterAboutLoader] = useState(false)
    const [isEditDescriptionView, setEditDescriptionView] = useState<boolean>(true)
    const [descriptionText, setDescriptionText] = useState<string>(defaultClusterNote)
    const [descriptionUpdatedBy, setDescriptionUpdatedBy] = useState<string>(defaultClusterNote)
    const [descriptionUpdatedOn, setDescriptionUpdatedOn] = useState<string>('')
    const [modifiedDescriptionText, setModifiedDescriptionText] = useState<string>('')
    const [clusterCreatedOn, setClusterCreatedOn] = useState<string>('')
    const [clusterCreatedBy, setClusterCreatedBy] = useState<string>('')
    const [clusterDetailsName, setClusterDetailsName] = useState<string>('')
    const [selectedTab, setSelectedTab] = useState<MDEditorSelectedTabType>(MD_EDITOR_TAB.WRITE)

    const getClusterAbout = (): void => {
        setClusterAboutLoader(true)
        setErrorResponseCode(null)
        getClusterNote(clusterId)
            .then((response) => {
                if (response.result) {
                    let _moment: moment.Moment
                    let _date: string
                    if (response.result.clusterNote) {
                        setDescriptionText(response.result.clusterNote.description)
                        setModifiedDescriptionText(response.result.clusterNote.description)
                        setDescriptionUpdatedBy(response.result.clusterNote.updatedBy)
                        _moment = moment(response.result.clusterNote.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                        _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.clusterNote.updatedOn
                        setDescriptionUpdatedOn(_date)
                    } else {
                        setDescriptionText(defaultClusterNote)
                        setModifiedDescriptionText(defaultClusterNote)
                        setDescriptionUpdatedBy('')
                        setDescriptionUpdatedOn('')
                    }
                    _moment = moment(response.result.clusterCreatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
                    _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : response.result.clusterCreatedOn
                    setClusterCreatedOn(_date)
                    setClusterCreatedBy(response.result.clusterCreatedBy)
                    setClusterDetailsName(response.result.clusterName)
                }
                setClusterAboutLoader(false)
            })
            .catch((error) => {
                showError(error)
                setErrorResponseCode(error.code)
                setClusterAboutLoader(false)
            })
    }

    const validateDescriptionText = (): boolean => {
        let isValid = true
        if (modifiedDescriptionText.length === 0) {
            toast.error(CLUSTER_DESCRIPTION_EMPTY_ERROR_MSG)
            isValid = false
        }
        return isValid
    }

    const updateClusterAbout = (): void => {
        const isValidate = validateDescriptionText()
        if (!isValidate) {
            return
        }
        const requestPayload = {
            clusterId: Number(clusterId),
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

    useEffect(() => {
        getClusterAbout()
    }, [clusterId])

    const isDescriptionModified: boolean = !deepEqual(descriptionText, modifiedDescriptionText)

    const toggleDescriptionView = () => {
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

    const randerClusterNote = (): JSX.Element => {
        return (
            <div className="cluster__body-details h-100 mb-16">
                <div
                    data-testid="cluster-note-wrapper"
                    className="dc__overflow-auto pl-16 pr-16 pt-16 pb-16 h-100 mb-16"
                >
                    {isEditDescriptionView ? (
                        <div className="min-w-500 bcn-0 br-4 dc__border w-100">
                            <div className="pt-8 pb-8 pl-16 pr-16 dc__top-radius-4 flex bc-n50 dc__border-bottom h-36 fs-13">
                                <div className="flex left fw-6 lh-20 cn-9">
                                    <DescriptionIcon className="tags-icon icon-dim-20 mr-8" />
                                    Description
                                </div>
                                {descriptionUpdatedBy && descriptionUpdatedOn && (
                                    <div className="flex left fw-4 cn-7 ml-8">
                                        Last updated by {descriptionUpdatedBy} on {descriptionUpdatedOn}
                                    </div>
                                )}
                                <div
                                    className="dc__align-right pencil-icon cursor flex fw-6 cn-7"
                                    onClick={toggleDescriptionView}
                                >
                                    <Edit className="icon-dim-16 mr-4 scn-7" /> Edit
                                </div>
                            </div>
                            <ReactMde
                                classes={{
                                    reactMde: 'mark-down-editor-container mark-down-editor__no-border',
                                    toolbar: 'mark-down-editor__hidden',
                                    preview: 'mark-down-editor-preview dc__bottom-radius-4',
                                    textArea: 'mark-down-editor__hidden',
                                }}
                                value={descriptionText}
                                selectedTab="preview"
                                minPreviewHeight={150}
                                generateMarkdownPreview={(markdown) =>
                                    Promise.resolve(<MarkDown markdown={markdown} breaks />)
                                }
                            />
                        </div>
                    ) : (
                        <div className="min-w-500">
                            <ReactMde
                                classes={{
                                    reactMde: 'mark-down-editor-container',
                                    toolbar: 'mark-down-editor-toolbar tab-list',
                                    preview: 'mark-down-editor-preview',
                                    textArea: 'mark-down-editor-textarea-wrapper',
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
                                        <MarkDown
                                            markdown={markdown || DEFAULT_MARKDOWN_EDITOR_PREVIEW_MESSAGE}
                                            breaks
                                        />,
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
                                }}
                            />
                            <div className="form cluster__description-footer pt-12 pb-12">
                                <div className="form__buttons pl-16 pr-16">
                                    <button
                                        className="cta cancel flex h-36 mr-12"
                                        type="button"
                                        onClick={toggleDescriptionView}
                                    >
                                        Cancel
                                    </button>
                                    <button className="cta flex h-36" type="submit" onClick={updateClusterAbout}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (errorResponseCode) {
        return (
            <div className="dc__loading-wrapper">
                <ErrorScreenManager code={errorResponseCode} />
            </div>
        )
    }
    return (
        <div className="flexbox dc__overflow-hidden h-100">
            <div className="cluster-column-container w-250 bcn-0 dc__border-right">
                <div className="pr-16 pt-16 pl-16 pb-16">
                    <div className="icon-dim-48 flex br-4 cb-5 bcb-1 scb-5">
                        <ClusterIcon className="flex cluster-icon icon-dim-24" />
                    </div>
                    <div className="fs-14 lh-20 pt-12 fw-6 show-shimmer-loading">
                        <div
                            data-testid="cluster-name"
                            className={!clusterDetailsName ? 'child-shimmer-loading' : 'dc__break-word'}
                        >
                            {clusterDetailsName}
                        </div>
                    </div>
                </div>
                <hr className="mt-0 mb-0" />
                <div className="pr-16 pt-16 pl-16 show-shimmer-loading">
                    <div className="fs-12 fw-4 lh-20 cn-7">Added by</div>
                    <div className={!clusterCreatedBy ? 'child-shimmer-loading fs-13 fw-4 lh-20 cn-9 mt-2' : 'fs-13 fw-4 lh-20 cn-9 mt-2'}>
                        {clusterCreatedBy}
                    </div>
                    <div className="fs-12 fw-4 lh-20 cn-7 mt-16">Added on</div>
                    <div className={!clusterCreatedOn ? 'child-shimmer-loading' : 'fs-13 fw-4 lh-20 cn-9 mt-2'}>
                        {clusterCreatedOn}
                    </div>
                </div>
            </div>
            {clusterAboutLoader ? <Progressing pageLoader /> : randerClusterNote()}
        </div>
    )
}
