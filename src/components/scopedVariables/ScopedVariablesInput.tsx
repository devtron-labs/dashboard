import React from 'react'
import { ScopedVariablesInputI } from './types'
import { UPLOAD_DESCRIPTION_L1, UPLOAD_DESCRIPTION_L2 } from './constants'
import { ReactComponent as ICUpload } from '../../assets/icons/ic-upload-blue.svg'

const ScopedVariablesInput = ({ handleFileUpload }: ScopedVariablesInputI) => {
    return (
        <>
            <input
                type="file"
                id="scoped-variables-input"
                accept=".yaml, .yml, .json"
                style={{
                    display: 'none',
                }}
                onChange={handleFileUpload}
            />

            <label
                htmlFor="scoped-variables-input"
                className="flex column center"
                style={{ cursor: 'pointer', width: '100%', height: '100%' }}
            >
                <div className="flex center upload-scoped-variables-button__icon">
                    <ICUpload width={20} height={20}/>
                </div>
                <div className="flex column center">
                    <p className="upload-description-l1-typography">{UPLOAD_DESCRIPTION_L1}</p>
                    <p className="upload-description-l2-typography">{UPLOAD_DESCRIPTION_L2}</p>
                </div>
            </label>
        </>
    )
}

export default ScopedVariablesInput
