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
import { getTabText } from './notifications.util'

export const ConfigurationTabDrawerModal = ({
    renderContent,
    closeModal,
    modal,
    isLoading,
    saveConfigModal,
    disableSave,
}: ConfigurationTabDrawerModalProps) => {
    const renderFooter = () => (
        <div className="px-20 py-16 flex right dc__gap-12 dc__zi-1 dc__border-top bg__primary">
            <Button
                dataTestId={`${modal}-config-modal-close-button`}
                size={ComponentSizeType.large}
                onClick={closeModal}
                text="Cancel"
                disabled={isLoading}
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
            />
            <Button
                dataTestId={`add-${modal}-save-button`}
                size={ComponentSizeType.large}
                onClick={saveConfigModal}
                text="Save"
                isLoading={isLoading}
                disabled={disableSave}
            />
        </div>
    )

    const renderModalContent = () => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="flexbox-col flex-grow-1 mh-0">
                {renderContent()}
                {renderFooter()}
            </div>
        )
    }

    return (
        <Drawer position="right" onEscape={closeModal}>
            <div
                className={`configuration-drawer h-100 modal__body w-${modal === ConfigurationsTabTypes.WEBHOOK ? '1024' : '600'} modal__body--p-0 dc__no-border-radius mt-0 flex-grow-1 flexbox-col`}
            >
                <div className="flex flex-align-center dc__border-bottom flex-justify bg__primary pb-12 pt-12 pl-20 pr-20">
                    <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure {getTabText(modal)}</h1>
                    <Button
                        ariaLabel="close-button"
                        icon={<Close />}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.xs}
                        onClick={closeModal}
                        dataTestId="add-ses-close-button"
                        showAriaLabelInTippy={false}
                        variant={ButtonVariantType.borderLess}
                    />
                </div>
                {renderModalContent()}
            </div>
        </Drawer>
    )
}
