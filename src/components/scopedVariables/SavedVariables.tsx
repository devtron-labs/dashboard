import React, { useState, useRef, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import ScopedVariablesLoader from './ScopedVariablesLoader'
import ScopedVariablesEditor from './ScopedVariablesEditor'
import VariablesList from './VariablesList'
import { useFileReader, useClickOutside } from '../common'
import CodeEditor from '../CodeEditor/CodeEditor'
import Descriptor from './Descriptor'
import { downloadData, parseIntoYAMLString } from './utils'
import { FileView, SavedVariablesViewInterface, VariablesListInterface } from './types'
import {
    DOWNLOAD_FILES_AS,
    DOWNLOAD_FILE_NAME,
    DOWNLOAD_TEMPLATE_NAME,
    DROPDOWN_ITEMS,
    SCOPED_VARIABLES_TEMPLATE_DATA,
} from './constants'
import { ReactComponent as ICPencil } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as ICFileDownload } from '../../assets/icons/ic-file-download.svg'

export default function SavedVariablesView({
    scopedVariablesData,
    jsonSchema,
    reloadScopedVariables,
    setScopedVariables,
}: SavedVariablesViewInterface) {
    const [showDropdown, setShowDropdown] = useState<boolean>(false)
    const [currentView, setCurrentView] = useState<FileView>(FileView.YAML)
    const [variablesList, setVariablesList] = useState<VariablesListInterface[]>([])
    const [showEditView, setShowEditView] = useState<boolean>(false)
    const dropdownRef = useRef(null)
    // No need to make it a state since editor here is read only and we don't need to update it
    let scopedVariablesYAML = parseIntoYAMLString(scopedVariablesData)

    const { status, progress, fileData, abortRead, readFile } = useFileReader()

    useEffect(() => {
        if (status?.status == null) {
            const variables = scopedVariablesData?.spec?.map((variable) => {
                return {
                    name: variable.name,
                    description: variable.description,
                }
            })
            if (variables) setVariablesList([...variables])
        }
    }, [scopedVariablesData])

    const handleDropdownClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation()
        setShowDropdown(!showDropdown)
    }

    useClickOutside(dropdownRef, () => {
        setShowDropdown(false)
    })

    const handleDownload = (item: string) => {
        if (!scopedVariablesYAML) return
        switch (item) {
            case DROPDOWN_ITEMS[0]:
                downloadData(scopedVariablesYAML, DOWNLOAD_FILE_NAME, DOWNLOAD_FILES_AS)
                setShowDropdown(false)
                break
            case DROPDOWN_ITEMS[1]:
                downloadData(SCOPED_VARIABLES_TEMPLATE_DATA, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS)
                setShowDropdown(false)
                break
        }
    }

    const onSearch = (query: string) => {
        const filteredVariables = scopedVariablesData?.spec?.filter((variable) => {
            return (
                variable.name.toLowerCase().includes(query.toLowerCase()) ||
                variable.description.toLowerCase().includes(query.toLowerCase())
            )
        })

        const variables = filteredVariables?.map((variable) => {
            return {
                name: variable.name,
                description: variable.description,
            }
        })
        setVariablesList(variables)
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

    if (status?.status === true) {
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
            className="flex column h-100 dc__content-space bcn-0"
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
                        onClick={() => setCurrentView(FileView.YAML)}
                    >
                        <div className="pb-6">YAML</div>
                    </button>

                    <button
                        className={`scoped-variables-tab pt-8 pr-16 pb-0 pl-0 fs-13 fw-4 lh-20 dc__capitalize cn-9 dc__no-background flex column dc__content-center dc__align-start dc__no-border dc__outline-none-imp ${
                            currentView === FileView.SAVED ? 'scoped-variables-active-tab' : ''
                        }`}
                        onClick={() => setCurrentView(FileView.SAVED)}
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
                            <Tippy
                                className="default-tt"
                                arrow
                                placement="top"
                                content={
                                    <div>
                                        <div className="flex column left">Edit</div>
                                    </div>
                                }
                            >
                                <button
                                    className="h-20 p-0 dc__no-background dc__no-border dc__outline-none-imp"
                                    onClick={() => setShowEditView(true)}
                                    data-testid="edit-variables-btn"
                                >
                                    <ICPencil className="icon-dim-20" />
                                </button>
                            </Tippy>

                            <Tippy
                                className="default-tt"
                                arrow
                                placement="top"
                                content={
                                    <div>
                                        <div className="flex column left">Download file/template</div>
                                    </div>
                                }
                            >
                                <button
                                    className="h-20 p-0 dc__no-background dc__no-border dc__outline-none-imp"
                                    onClick={handleDropdownClick}
                                    data-testid="dropdown-btn"
                                >
                                    <ICFileDownload className="icon-dim-20" />
                                </button>
                            </Tippy>
                            {showDropdown && (
                                <div
                                    className="scoped-variables-editor-infobar__dropdown pt-4 pb-4 pl-0 pr-0 bcn-0 flex column dc__content-start dc__align-start dc__position-abs bcn-0 dc__border dc__border-radius-4-imp"
                                    ref={dropdownRef}
                                >
                                    {DROPDOWN_ITEMS.map((item) => (
                                        <div
                                            key={item}
                                            className="scoped-variables-editor-infobar__dropdown-item bcn-0 p-8 flex center dc__align-self-stretch dc__gap-12 dc__content-start cursor cn-9 fs-13 lh-20 fw-4"
                                            onClick={() => handleDownload(item)}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            )}
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
