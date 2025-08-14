import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    GenericModal,
    Icon,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICUpgradeToEnterprise } from './ic-upgrade-enterprise.svg'

const ENTERPRISE_PLAN_OFFERINGS = [
    'Unlimited clusters',
    'Managed Devtron installation',
    'Priority support',
    'Contribute to our roadmap',
    'Early access to enterprise features & more…',
]

const UpgradeToEnterpriseDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => (
    <GenericModal name="upgrade-to-enterprise" open={open} width={450} onClose={noop}>
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
                        <ICUpgradeToEnterprise className="icon-dim-64" />
                        <Button
                            dataTestId="close-upgrade-dialog"
                            icon={<Icon name="ic-close-large" color={null} />}
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.negativeGrey}
                            onClick={handleClose}
                            ariaLabel="close-upgrade-dialog"
                            showAriaLabelInTippy={false}
                        />
                    </div>
                    <div className="flexbox-col dc__gap-8">
                        <h1 className="fs-24 lh-1-5 fw-7 cn-9 m-0">Upgrade to Enterprise Plan</h1>
                        <span className="fs-16 fw-4 lh-1-5 cn-9">
                            Your freemium plan allows only 1 cluster. Unlock more to scale without limits.
                        </span>
                    </div>
                </div>
                <div className="flexbox-col border__primary-translucent br-12 shadow__card--10">
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
                    <div className="divider__primary--horizontal" />
                    <div className="p-20 flexbox-col dc__gap-20">
                        <div className="flexbox-col dc__gap-4">
                            <span className="fs-15 fw-6 lh-1-5 cn-9">Unlock Devtron&apos;s Full Potential</span>
                            <span className="fs-13 hw-4 lh-1-5 cn-9">
                                Scale your infrastructure, accelerate your teams, and get the resources you need to
                                grow.
                            </span>
                        </div>
                        {/* TODO: Add onClick handler */}
                        <Button
                            dataTestId="upgrade-to-enterprise"
                            text="Upgrade Now"
                            endIcon={<Icon name="ic-arrow-right" color={null} />}
                        />
                    </div>
                </div>
            </div>
        </GenericModal.Body>
    </GenericModal>
)

export default UpgradeToEnterpriseDialog
