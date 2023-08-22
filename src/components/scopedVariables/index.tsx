import React, { useState } from 'react'
import UploadScopedVariables from './UploadScopedVariables'
import { useFileReader } from './utils/hooks'
import CodeEditor from '../CodeEditor/CodeEditor'
import Descriptor from './Descriptor'
import { downloadData } from './utils/helpers'
import { FileView, SavedVariablesViewI } from './types'
import { VARIABLES_TEMPLATE, DROPDOWN_ITEMS } from './constants'
import { ReactComponent as ICFileDownload } from '../../assets/icons/ic-file-download.svg'
import './styles.scss'

const SavedVariablesView = ({ scopedVariables }: SavedVariablesViewI) => {
    const [showDropdown, setShowDropdown] = useState<boolean>(false)
    const [currentView, setCurrentView] = useState<FileView>(FileView.UPLOADED)

    const { status, progress, fileData, abortRead, readFile } = useFileReader()

    const handleDropdownClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation()
        setShowDropdown(!showDropdown)
    }

    const handleDownload = (item: string) => {
        switch (item) {
            case DROPDOWN_ITEMS[0]:
                downloadData(scopedVariables, 'scoped-variables.yaml', 'application/x-yaml')
                break
            case DROPDOWN_ITEMS[1]:
                downloadData(VARIABLES_TEMPLATE, 'scoped-variables-template.yaml', 'application/x-yaml')
                break
        }
    }
    return status?.status === true || status?.status == null ? (
        <div className="flex column dc__content-space h-100 default-bg-color" onClick={() => setShowDropdown(false)}>
            <Descriptor showUploadButton readFile={readFile}>
                <div className="scoped-variables-tab-container">
                    <button
                        className={`scoped-variables-tab ${
                            currentView === FileView.UPLOADED ? 'scoped-variables-active-tab' : ''
                        }`}
                        onClick={() => setCurrentView(FileView.UPLOADED)}
                    >
                        <div>Uploaded File</div>
                    </button>
                    <button
                        className={`scoped-variables-tab ${
                            currentView === FileView.SAVED ? 'scoped-variables-active-tab' : ''
                        }`}
                        onClick={() => setCurrentView(FileView.SAVED)}
                    >
                        <div>Saved Variables</div>
                    </button>
                </div>
            </Descriptor>

            <div className="uploaded-variables-editor-background">
                <div className="uploaded-variables-editor-container">
                    <div className="scoped-variables-editor-infobar">
                        <button className="scoped-variables-editor-infobar__btn" onClick={handleDropdownClick}>
                            <ICFileDownload width={20} height={20} />
                        </button>
                        {showDropdown && (
                            <div className="scoped-variables-editor-infobar__dropdown">
                                {DROPDOWN_ITEMS.map((item) => (
                                    <div
                                        key={item}
                                        className="scoped-variables-editor-infobar__dropdown-item"
                                        onClick={() => handleDownload(item)}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <CodeEditor value={scopedVariables} mode="yaml" height="100%" readOnly />
                </div>
            </div>
        </div>
    ) : (
        <></>
    )
}

const ScopedVariables = () => {
    const [scopedVariables, setScopedVariables] = useState(VARIABLES_TEMPLATE)

    if (scopedVariables) return <SavedVariablesView scopedVariables={scopedVariables} />

    return <UploadScopedVariables setScopedVariables={setScopedVariables} />
}

export default ScopedVariables
