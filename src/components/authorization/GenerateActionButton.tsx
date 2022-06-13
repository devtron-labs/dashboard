import React from 'react'
import { Progressing } from '../common'
import { GenerateActionButtonType } from './authorization.type'

function GenerateActionButton({ loader, onCancel, onSave, buttonText }: GenerateActionButtonType) {
    return (
        <div className="modal__buttons w-100 p-16 flex right border-top">
            <button className="cta cancel mr-16" type="button" onClick={onCancel}>
                Cancel
            </button>
            {/* <GenerateActionButton handleGenerateRowActionButton={handleGenerateAPIToken} /> */}
            <button className="cta" onClick={() => onSave()}>
                {loader ? <Progressing /> : buttonText}
            </button>
        </div>
    )
}

export default GenerateActionButton
