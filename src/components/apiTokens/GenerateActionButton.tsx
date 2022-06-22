import React from 'react'
import { ButtonWithLoader } from '../common'
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
                <ButtonWithLoader
                    rootClassName="flex cta delete h-36 mr-16"
                    onClick={onDelete}
                    disabled={loader}
                    isLoading={false}
                    loaderColor="white"
                >
                    Delete token
                </ButtonWithLoader>
            )}
            <div className="flex">
                <ButtonWithLoader
                    rootClassName="flex cta cancel h-36 mr-16"
                    onClick={onCancel}
                    disabled={loader}
                    isLoading={false}
                    loaderColor="white"
                >
                    Cancel
                </ButtonWithLoader>
                <ButtonWithLoader
                    rootClassName="flex cta h-36"
                    onClick={() => onSave()}
                    disabled={loader}
                    isLoading={loader}
                    loaderColor="white"
                >
                    {buttonText}
                </ButtonWithLoader>
            </div>
        </div>
    )
}

export default GenerateActionButton
