import React from 'react'
import { MESSAGING_UI } from '../../config'
import { ButtonWithLoader } from '../common'
import { GenerateActionButtonType } from './authorization.type'
import { API_LIST_MESSAGING } from './constants'

function GenerateActionButton({
    loader,
    onCancel,
    onSave,
    buttonText,
    showDelete = false,
    onDelete,
}: GenerateActionButtonType) {
    return (
        <div className={`modal__buttons w-100 p-16 flex ${showDelete ? 'dc__content-space ' : 'right'} dc__border-top`}>
            {showDelete && (
                <ButtonWithLoader
                    rootClassName="flex cta delete h-36 mr-16"
                    onClick={onDelete}
                    disabled={loader}
                    isLoading={false}
                    loaderColor="white"
                >
                    {API_LIST_MESSAGING.DELETE_TOKEN}
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
                    {MESSAGING_UI.CANCEL}
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
