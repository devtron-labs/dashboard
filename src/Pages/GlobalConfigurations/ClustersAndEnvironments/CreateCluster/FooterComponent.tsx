import { Children, PropsWithChildren, ReactElement } from 'react'

import { Button, ButtonVariantType, NewClusterFormFooterProps } from '@devtron-labs/devtron-fe-common-lib'

import { FooterComponentChildKey } from './types'

const StartComponent = ({ children }: PropsWithChildren<{ __TYPE: FooterComponentChildKey.START }>) => (
    <div className="flex-grow-1">{children}</div>
)

StartComponent.defaultProps = {
    // Defining for our internal use. We can't rely on name of the component due to minification
    __TYPE: FooterComponentChildKey.START,
}

const CTAComponent = ({ children }: PropsWithChildren<{ __TYPE: FooterComponentChildKey.CTA }>) =>
    children as JSX.Element

CTAComponent.defaultProps = {
    __TYPE: FooterComponentChildKey.CTA,
}

/**
 * FooterComponent uses composition pattern. We want to take components as children but render them in a specific order
 * Therefore if the user want to render the CTA button, they simply need to wrap it with <FooterComponent.CTA>
 */
const FooterComponent = ({
    apiCallInProgress,
    handleModalClose,
    children,
}: PropsWithChildren<NewClusterFormFooterProps>) => {
    const childrenArray = Children.toArray(children)
    // We need to find the children that are of type CTA and Start
    const CTA = childrenArray.find((child) => (child as ReactElement)?.props?.__TYPE === FooterComponentChildKey.CTA)
    const Start = childrenArray.find(
        (child) => (child as ReactElement)?.props?.__TYPE === FooterComponentChildKey.START,
    )

    return (
        <footer className="dc__position-abs dc__bottom-0 dc__left-0 w-100 dc__zi-1 bg__primary flexbox dc__content-end dc__border-top-n1 px-20 py-16 dc__gap-12 dc__no-shrink">
            {Start}

            <div className="flexbox dc__gap-12">
                <Button
                    dataTestId="cancel-create-cluster-button"
                    onClick={handleModalClose}
                    disabled={apiCallInProgress}
                    text="Cancel"
                    variant={ButtonVariantType.secondary}
                />

                {CTA}
            </div>
        </footer>
    )
}

FooterComponent.Start = StartComponent
FooterComponent.CTA = CTAComponent

export default FooterComponent
