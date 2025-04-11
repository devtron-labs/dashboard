import {
    Button,
    ComponentSizeType,
    DOCUMENTATION,
    getHandleOpenURL,
    Icon,
    TESTIMONIAL_CARD_DATA,
    TestimonialContent,
} from '@devtron-labs/devtron-fe-common-lib'

interface EnterpriseTrialDialogProps {
    featureTitle: string
    featureDescription: string
}

const EnterpriseTrialDialog = ({ featureTitle, featureDescription }: EnterpriseTrialDialogProps) => {
    const testimonialCount = TESTIMONIAL_CARD_DATA.length
    const randomNumber = Math.round(Math.random() * testimonialCount) % testimonialCount
    const testimonialConfig = TESTIMONIAL_CARD_DATA[randomNumber]

    return (
        <div
            className="flexbox-col br-16 border__primary dc__overflow-hidden"
            style={{
                background:
                    'linear-gradient(249deg, var(--bg-primary, #FFF) 0%, var(--bg-primary, #FFF) 70.16%, var(--B100, #E5F2FF) 84.88%, var(--V200, #C5BBFA) 100%)',
            }}
        >
            <div className="p-24 flexbox-col dc__gap-16 border__secondary--bottom">
                <Icon name="ic-enterprise-tag" size={null} color={null} />
                <div className="flexbox-col dc__gap-8 ">
                    <span className="fs-24 fw-7 lh-1-5 cn-9 font-merriweather">{featureTitle}</span>
                    <span className="fs-16 fw-4 lh-1-5">{featureDescription}</span>
                </div>
            </div>
            <div className="p-24 flexbox-col dc__gap-24">
                <div className="flex dc__content-space">
                    <span className="fs-16 fw-6 lh-1-5 cn-9">Unlock Devtron&apos;s Full Potential</span>
                    <Button
                        dataTestId="get-free-trial"
                        text="Get free trial"
                        endIcon={<Icon name="ic-arrow-right" color={null} />}
                        onClick={getHandleOpenURL(DOCUMENTATION.ENTERPRISE_LICENSE)}
                        size={ComponentSizeType.medium}
                    />
                </div>
                <div className="p-24 flexbox dc__gap-12 br-8 border__primary bg__primary">
                    <div className="flexbox-col dc__align-items-center h-100 dc__gap-8">
                        <Icon name="ic-quote" color="N900" />
                        <div className="border__primary--left w-1 flex-grow-1" />
                    </div>
                    <div className="flexbox-col dc__gap-20">
                        <TestimonialContent {...testimonialConfig} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EnterpriseTrialDialog
