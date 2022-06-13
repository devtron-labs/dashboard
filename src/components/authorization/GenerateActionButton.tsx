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
        <div>
            <div className="modal__buttons w-100 p-16 flex content-space border-top">
                <div>
                    {showDelete && (
                        <button className="cta delete cancel mr-16" type="button" onClick={onDelete}>
                            Delete
                        </button>
                    )}
                </div>
                <div>
                    <button className="cta cancel mr-16" type="button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="cta" onClick={() => onSave()}>
                        {loader ? <Progressing /> : buttonText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GenerateActionButton
