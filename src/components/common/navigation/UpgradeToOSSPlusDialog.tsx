import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    GenericModal,
    Icon,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import './UpgradeToOSSPlusDialog.scss'

const UpgradeToOSSPlusDialog = () => {
    const { showUpgradeToOSSPlusDialog, setShowUpgradeToOSSPlusDialog } = useMainContext()

    const handleClose = () => {
        setShowUpgradeToOSSPlusDialog(false)
    }

    return (
        <GenericModal
            name="upgrade-to-oss-plus"
            onClose={handleClose}
            onEscape={handleClose}
            open={showUpgradeToOSSPlusDialog}
            width={450}
            borderVariant="primary"
            borderRadius={16}
        >
            <div className="upgrade-to-oss-plus-dialog__container">
                <div className="flexbox-col p-32 dc__gap-16">
                    <div className="flexbox dc__content-space dc__align-start">
                        <Icon name="ic-medium-upgrade" size={56} color={null} />
                        <Button
                            dataTestId="close-upgrade-to-oss-plus-dialog-btn"
                            onClick={handleClose}
                            icon={<Icon name="ic-close-large" color={null} />}
                            ariaLabel="Close Upgrade to OSS Plus Dialog"
                            showAriaLabelInTippy={false}
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.negativeGrey}
                            size={ComponentSizeType.medium}
                        />
                    </div>

                    <div className="flexbox-col dc__gap-8">
                        <h2 className="m-0 cn-9 fs-24 fw-7 lh-1-5 font-merriweather">
                            Run Devtron OSS with Expert Support
                        </h2>
                        <p className="cn-9 fs-16 fw-4 lh-1-5 m-0">
                            Ensure smoother onboarding and quicker issue resolution with expert support.
                        </p>
                    </div>
                </div>

                <div className="px-20 pb-20">
                    <div className="flexbox p-20 flexbox-col dc__gap-20 br-12 border__primary-translucent bg__primary shadow__card--10">
                        <div className="flexbox-col dc__gap-8">
                            <h3 className="m-0 cn-9 fs-18 fw-6 lh-1-5">Designed for Growing Teams</h3>
                            <p className="m-0 cn-9 fs-15 fw-4 lh-1-5">
                                Ideal for teams running Devtron in production who need faster responses and expert
                                guidance without moving to Enterprise.
                            </p>
                        </div>

                        <div className="flexbox dc__gap-12">
                            <Button
                                dataTestId="request-upgrade-to-oss-plus-btn"
                                size={ComponentSizeType.large}
                                text="Request Upgrade"
                                endIcon={<Icon name="ic-arrow-right" color={null} />}
                                component={ButtonComponentType.anchor}
                                anchorProps={{
                                    href: 'https://devtron.ai/oss-plus?utm_source=oss&utm_medium=oss-plus&utm_campaign=oss-devtron',
                                }}
                            />

                            <Button
                                dataTestId="see-all-plans-btn"
                                size={ComponentSizeType.large}
                                text="See all plans"
                                variant={ButtonVariantType.secondary}
                                component={ButtonComponentType.anchor}
                                anchorProps={{
                                    href: 'https://devtron.ai/pricing?utm_source=oss&utm_medium=oss-plus&utm_campaign=oss-devtron',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </GenericModal>
    )
}

export default UpgradeToOSSPlusDialog
