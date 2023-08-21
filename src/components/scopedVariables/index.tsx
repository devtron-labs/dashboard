import React, { useState } from 'react'
import UploadScopedVariables from './UploadScopedVariables'
import { ReactComponent as ICFileDownload } from '../../assets/icons/ic-file-download.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import Descriptor from './Descriptor'
import { VARIABLES_TEMPLATE } from './constants'
import './styles.scss'

const ScopedVariables = () => {
    const [ScopedVariables, setScopedVariables] = useState(VARIABLES_TEMPLATE)
    if (ScopedVariables)
        return (
            <div className="flex column dc__content-space h-100 default-bg-color">
                <Descriptor showUploadButton>
                    <div className="scoped-variables-tab-container">
                        <button className="scoped-variables-tab">Uploaded File</button>

                        <button className="scoped-variables-tab">Saved Variables</button>
                    </div>
                </Descriptor>

                <div className="uploaded-variables-editor-background">
                    <div className="uploaded-variables-editor-container">
                        <div className="scoped-variables-editor-infobar">
                            <button className="scoped-variables-editor-infobar__btn">
                                <ICFileDownload width={20} height={20} />
                            </button>
                        </div>

                        <CodeEditor value={ScopedVariables} mode="yaml" height="100%" />
                    </div>
                </div>
            </div>
        )
    return <UploadScopedVariables setScopedVariables={setScopedVariables} />
}

export default ScopedVariables
