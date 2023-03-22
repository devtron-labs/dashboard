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
            <div className={`modal__buttons w-100 p-16 pl-0-imp flex ${regenerateButton ? 'right ml-auto' : 'left ml-0'} dc__border-top-1`}>
                <ButtonWithLoader
                    rootClassName={`flex cta cancel h-36 ${regenerateButton ? 'mr-12 first' : 'second'}`}
                    onClick={onCancel}
                    disabled={loader}
                    isLoading={false}
                    loaderColor="white"
                >
                    Cancel
                </ButtonWithLoader>
                <ButtonWithLoader
                    rootClassName= {`flex cta h-36 ${regenerateButton ? 'second' : 'mr-12 first'}`}
                    onClick={() => onSave()}
                    disabled={loader}
                    isLoading={loader}
                    loaderColor="white"
                >
                    {buttonText}
                </ButtonWithLoader>
            </div>
    )
}

export default GenerateActionButton
