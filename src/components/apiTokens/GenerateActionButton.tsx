import React from 'react'
import { Progressing } from '../common'
import { GenerateActionButtonType } from './authorization.type'

function GenerateActionButton({
    loader,
    onCancel,
    onSave,
    buttonText,
    showDelete = false,
    onDelete,
}: GenerateActionButtonType) {
    return (
        <div className={`modal__buttons w-100 p-16 flex ${showDelete ? 'content-space ' : 'right'} border-top`}>
            {showDelete && (
                <button className="cta delete cancel mr-16" type="button" onClick={onDelete}>
                    Delete
                </button>
            )}
            <div>
                <button className="cta cancel mr-16" type="button" onClick={onCancel}>
                    Cancel
                </button>
                <button className="cta" onClick={() => onSave()}>
                    {loader ? <Progressing /> : buttonText}
                </button>
            </div>
        </div>
    )
}

export default GenerateActionButton
