import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    CONTACT_SALES_LINK,
    GenericModal,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'

const ENTERPRISE_PLAN_OFFERINGS = [
    'Unlimited clusters',
    'Managed Devtron installation',
    'Priority support',
    'Contribute to our roadmap',
    'Early access to enterprise features & more…',
]

const UpgradeToEnterpriseDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => (
    <GenericModal
        name="upgrade-to-enterprise"
        open={open}
        width={450}
        borderRadius={16}
        onClose={handleClose}
        onEscape={handleClose}
    >
        <GenericModal.Body>
            <div
                className="p-32 flexbox-col dc__gap-32"
                style={{
                    background:
                        'linear-gradient(183deg, var(--bg-primary) 5.64%, var(--bg-primary, #FFF) 41.13%, var(--B100) 76.62%, var(--V200) 94.36%)',
                }}
            >
                <div className="flexbox-col dc__gap-16">
                    <div className="flexbox dc__content-space dc__align-start">
                        <Icon name="ic-upgrade-enterprise" size={64} color={null} />
                        <Button
                            dataTestId="close-upgrade-dialog"
                            icon={<Icon name="ic-close-large" color={null} />}
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.negativeGrey}
                            onClick={handleClose}
                            ariaLabel="close-upgrade-dialog"
                            showAriaLabelInTippy={false}
                            size={ComponentSizeType.medium}
                        />
                    </div>
                    <div className="flexbox-col dc__gap-8">
                        <h1 className="fs-24 lh-1-5 fw-7 cn-9 m-0 font-merriweather">Upgrade to Enterprise Plan</h1>
                        <div className="flexbox-col dc__gap-20 fs-16 fw-4 cn-9 lh-1-5">
                            <span>
                                Freemium plan allows managing the Devtron host cluster along with one additional
                                cluster.
                            </span>
                            <span>Switch to Enterprise plan to scale without limits.</span>
                        </div>
                    </div>
                </div>
                <div className="flexbox-col border__primary-translucent bg__primary br-12 shadow__card--10">
                    <div className="flexbox-col dc__gap-16 p-20">
                        <span className="fs-15 fw-6 lh-1-5 cn-9">What’s included</span>
                        <div className="flexbox-col dc__gap-8">
                            {ENTERPRISE_PLAN_OFFERINGS.map((description) => (
                                <div key={description} className="flexbox dc__gap-8 dc__align-items-center">
                                    <Icon name="ic-check" color="G500" size={20} />
                                    <span className="fs-13 lh-20 fw-4 cn-9">{description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="divider__secondary--horizontal" />
                    <div className="p-20 flexbox-col dc__gap-20">
                        <div className="flexbox-col dc__gap-4">
                            <span className="fs-15 fw-6 lh-1-5 cn-9">Unlock Devtron&apos;s Full Potential</span>
                            <span className="fs-13 hw-4 lh-1-5 cn-9">
                                Scale your infrastructure, accelerate your teams, and get the resources you need to
                                grow.
                            </span>
                        </div>
                        <Button
                            dataTestId="upgrade-to-enterprise"
                            text="Contact to upgrade"
                            endIcon={<Icon name="ic-arrow-right" color={null} />}
                            component={ButtonComponentType.anchor}
                            anchorProps={{
                                href: CONTACT_SALES_LINK,
                            }}
                        />
                    </div>
                </div>
            </div>
        </GenericModal.Body>
    </GenericModal>
)

export default UpgradeToEnterpriseDialog
