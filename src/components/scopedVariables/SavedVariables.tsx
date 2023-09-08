import React, { useState, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import { PopupMenu } from '@devtron-labs/devtron-fe-common-lib'
import ScopedVariablesLoader from './ScopedVariablesLoader'
import ScopedVariablesEditor from './ScopedVariablesEditor'
import VariablesList from './VariablesList'
import { useFileReader } from '../common'
import CodeEditor from '../CodeEditor/CodeEditor'
import Descriptor from './Descriptor'
import { downloadData, parseIntoYAMLString } from './utils'
import { FileView, SavedVariablesViewProps, VariableType } from './types'
import {
    DOWNLOAD_FILES_AS,
    DOWNLOAD_FILE_NAME,
    DOWNLOAD_TEMPLATE_NAME,
    DROPDOWN_ITEMS,
    SCOPED_VARIABLES_TEMPLATE_DATA,
} from './constants'
import { ReactComponent as ICPencil } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as ICFileDownload } from '../../assets/icons/ic-file-download.svg'
import { FileReaderStatus } from '../common/hooks/types'

export default function SavedVariablesView({
    scopedVariablesData,
    jsonSchema,
    reloadScopedVariables,
    setScopedVariables,
}: SavedVariablesViewProps) {
    const [currentView, setCurrentView] = useState<FileView>(FileView.YAML)
    const [variablesList, setVariablesList] = useState<VariableType[]>([])
    const [showEditView, setShowEditView] = useState<boolean>(false)
    // No need to make it a state since editor here is read only and we don't need to update it
    const scopedVariablesYAML = parseIntoYAMLString(scopedVariablesData)

    const { status, progress, fileData, abortRead, readFile } = useFileReader()

    useEffect(() => {
        if (status?.status == null) {
            const variables = scopedVariablesData?.spec?.map((variable) => ({
                name: variable.name,
                description: variable.description,
            }))
            if (variables) setVariablesList([...variables])
        }
    }, [scopedVariablesData])

    const handleActivateEditView = () => setShowEditView(true)

    const handleSetYAMLView = () => setCurrentView(FileView.YAML)

    const handleSetSavedView = () => setCurrentView(FileView.SAVED)

    const onSearch = (query: string) => {
        const filteredVariables = scopedVariablesData?.spec?.filter(
            (variable) =>
                variable.name.toLowerCase().includes(query.toLowerCase()) ||
                variable.description.toLowerCase().includes(query.toLowerCase()),
        )

        const variables = filteredVariables?.map((variable) => ({
            name: variable.name,
            description: variable.description,
        }))
        setVariablesList(variables)
    }

    const rendeDropdownItems = (item) => {
        const handleDownloadFileClick = () => {
            if (!scopedVariablesYAML) return
            switch (item) {
                case DROPDOWN_ITEMS[0]:
                    downloadData(scopedVariablesYAML, DOWNLOAD_FILE_NAME, DOWNLOAD_FILES_AS)
                    break
                case DROPDOWN_ITEMS[1]:
                    downloadData(SCOPED_VARIABLES_TEMPLATE_DATA, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS)
                    break
            }
        }

        return (
            <div
                key={item}
                className="scoped-variables-editor-infobar__dropdown-item bcn-0 p-8 flex center dc__align-self-stretch dc__gap-12 dc__content-start cursor cn-9 fs-13 lh-20 fw-4 dc__hover-n50"
                onClick={handleDownloadFileClick}
            >
                {item}
            </div>
        )
    }

    if (showEditView) {
        return (
            <ScopedVariablesEditor
                variablesData={scopedVariablesYAML}
                name={fileData?.name}
                abortRead={null}
                reloadScopedVariables={reloadScopedVariables}
                jsonSchema={jsonSchema}
                setShowEditView={setShowEditView}
                setScopedVariables={setScopedVariables}
            />
        )
    }

    if (status?.status === FileReaderStatus.SUCCESS) {
        return (
            <ScopedVariablesEditor
                variablesData={status?.message?.data}
                name={fileData?.name}
                abortRead={abortRead}
                reloadScopedVariables={reloadScopedVariables}
                jsonSchema={jsonSchema}
                setScopedVariables={setScopedVariables}
            />
        )
    }

    return status?.status == null ? (
        <div
            className="flex column h-100 dc__content-space bcn-0 saved-variables__default-view"
            style={{
                overflowY: 'hidden',
            }}
        >
            <Descriptor
                showUploadButton
                onSearch={currentView === FileView.SAVED ? onSearch : null}
                readFile={readFile}
            >
                <div className="dc__border-bottom bcn-0 pt-0 pb-0 pl-20 pr-20 flexbox dc__align-self-stretch dc__align-items-center">
                    <button
                        className={`scoped-variables-tab pt-8 pr-16 pb-0 pl-0 fs-13 fw-4 lh-20 dc__capitalize cn-9 dc__no-background flex column dc__content-center dc__align-start dc__no-border dc__outline-none-imp ${
                            currentView === FileView.YAML ? 'scoped-variables-active-tab' : ''
                        }`}
                        type="button"
                        onClick={handleSetYAMLView}
                    >
                        <div className="pb-6">YAML</div>
                    </button>

                    <button
                        className={`scoped-variables-tab pt-8 pr-16 pb-0 pl-0 fs-13 fw-4 lh-20 dc__capitalize cn-9 dc__no-background flex column dc__content-center dc__align-start dc__no-border dc__outline-none-imp ${
                            currentView === FileView.SAVED ? 'scoped-variables-active-tab' : ''
                        }`}
                        type="button"
                        onClick={handleSetSavedView}
                    >
                        <div className="pb-6">Variable List</div>
                    </button>
                </div>
            </Descriptor>

            {currentView === FileView.YAML ? (
                <div className="dc__window-bg flex-grow-1 dc__no-shrink p-8 flex column dc__align-start dc__content-start dc__gap-16 dc__align-self-stretch">
                    <div className="flex-grow-1 dc__no-shrink dc__border dc__border-radius-4-imp flex column dc__content-space dc__align-self-stretch dc__align-start">
                        <div className="dc__position-rel dc__top-radius-4 dc__border-bottom flex pt-8 pb-8 pl-12 pr-12 bcn-0 dc__gap-16 dc__content-space dc__align-items-center dc__align-self-stretch">
                            <p className="flex-grow-1 dc__no-shrink cn-9 fs-13 fw-4 lh-20 m-0">Last saved file</p>
                            <Tippy className="default-tt" arrow placement="top" content="Edit">
                                <button
                                    className="h-20 p-0 dc__no-background dc__no-border dc__outline-none-imp"
                                    type="button"
                                    onClick={handleActivateEditView}
                                    data-testid="edit-variables-btn"
                                >
                                    <ICPencil className="icon-dim-20" />
                                </button>
                            </Tippy>

                            <PopupMenu autoClose>
                                <PopupMenu.Button
                                    isKebab={true}
                                    rootClassName="h-20 p-0 dc__no-background dc__no-border dc__outline-none-imp"
                                    dataTestId="dropdown-btn"
                                >
                                    <Tippy
                                        className="default-tt"
                                        arrow
                                        placement="top"
                                        content="Download file/template"
                                    >
                                        <div>
                                            <ICFileDownload className="icon-dim-20" />
                                        </div>
                                    </Tippy>
                                </PopupMenu.Button>

                                <PopupMenu.Body rootClassName="scoped-variables-editor-infobar__dropdown pt-4 pb-4 pl-0 pr-0 bcn-0 flex column dc__content-start dc__align-start dc__position-abs bcn-0 dc__border dc__border-radius-4-imp">
                                    {DROPDOWN_ITEMS.map((item) => rendeDropdownItems(item))}
                                </PopupMenu.Body>
                            </PopupMenu>
                        </div>

                        <CodeEditor value={scopedVariablesYAML} mode="yaml" height="100%" readOnly noParsing />
                    </div>
                </div>
            ) : (
                <VariablesList variablesList={variablesList} />
            )}
        </div>
    ) : (
        <div className="flex column h-100 dc__content-space">
            <Descriptor />
            <div className="flex center flex-grow-1">
                <div className="flex column center dc__gap-20 w-320 dc__no-shrink">
                    <div className="flex column center dc__gap-8 bc-n50 dc__align-self-stretch dc__border-dashed w-320 h-128 br-4">
                        <ScopedVariablesLoader
                            status={status}
                            progress={progress}
                            fileData={fileData}
                            abortRead={abortRead}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
