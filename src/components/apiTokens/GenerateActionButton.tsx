import React from 'react'
import { ButtonWithLoader } from '../common'
import { GenerateActionButtonType } from './authorization.type'

function GenerateActionButton({
    loader,
    onCancel,
    onSave,
    buttonText,
    regenerateButton
}: GenerateActionButtonType) {
    return (
        <div
            className={`modal__buttons w-100 pl-0 pt-16 pb-16 pr-16 flex ${
                regenerateButton ? 'right ml-auto' : 'left ml-0'
            } dc__border-top-n1`}
        >
            <ButtonWithLoader
                rootClassName={`flex cta cancel h-36 ${regenerateButton ? 'mr-12 order-first' : 'order-second'}`}
                onClick={onCancel}
                disabled={loader}
                dataTestId="cancel-button"
                isLoading={false}
                loaderColor="white"
            >
                Cancel
            </ButtonWithLoader>
            <ButtonWithLoader
                rootClassName={`flex cta h-36 ${regenerateButton ? 'order-second' : 'mr-12 order-first'}`}
                onClick={onSave}
                disabled={loader}
                isLoading={loader}
                loaderColor="white"
                dataTestId={buttonText.toLowerCase().replace(' ', '-')}
            >
                {buttonText}
            </ButtonWithLoader>
        </div>
    )
}

export default GenerateActionButton
