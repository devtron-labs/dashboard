import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Drawer,
    Progressing,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { ConfigurationsTabTypes } from './constants'
import { ConfigurationTabDrawerModalProps } from './types'

export const ConfigurationTabDrawerModal = ({
    renderContent,
    closeModal,
    modal,
    isLoading,
    saveConfigModal,
    disableSave,
}: ConfigurationTabDrawerModalProps) => {
    const renderLoadingState = () => (
        <div className="h-100">
            <Progressing pageLoader />
        </div>
    )

    const renderFooter = () => (
        <div className="form__button-group-bottom flex right dc__gap-16 dc__zi-1">
            <Button
                dataTestId="ses-config-modal-close-button"
                size={ComponentSizeType.medium}
                onClick={closeModal}
                text="Cancel"
                disabled={isLoading}
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
            />
            <Button
                dataTestId="add-ses-save-button"
                size={ComponentSizeType.medium}
                onClick={saveConfigModal}
                text="Save"
                isLoading={isLoading}
                disabled={disableSave}
            />
        </div>
    )

    const renderModalContent = () => (
        <div className="flexbox-col flex-grow-1 mh-0">
            {renderContent()}
            {renderFooter()}
        </div>
    )
    return (
        <Drawer position="right">
            <div
                className={`h-100 modal__body w-${modal === ConfigurationsTabTypes.WEBHOOK ? '1024' : '600'} modal__body--p-0 dc__no-border-radius mt-0 flex-grow-1 flexbox-col`}
            >
                <div className="flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                    <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure {modal}</h1>
                    <Button
                        ariaLabel="close-button"
                        icon={<Close />}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.small}
                        onClick={closeModal}
                        dataTestId="add-ses-close-button"
                        showAriaLabelInTippy={false}
                        variant={ButtonVariantType.borderLess}
                    />
                </div>
                {isLoading ? renderLoadingState() : renderModalContent()}
            </div>
        </Drawer>
    )
}
