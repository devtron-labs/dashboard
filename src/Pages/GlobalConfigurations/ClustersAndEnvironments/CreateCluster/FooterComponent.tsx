import { Children, PropsWithChildren, ReactElement } from 'react'

import { Button, ButtonVariantType, NewClusterFormFooterProps } from '@devtron-labs/devtron-fe-common-lib'

const StartComponent = ({ children }: PropsWithChildren<{ __TYPE: 'Start' }>) => (
    <div className="flex-grow-1">{children}</div>
)

StartComponent.defaultProps = {
    __TYPE: 'Start',
}

const CTAComponent = ({ children }: PropsWithChildren<{ __TYPE: 'CTA' }>) => children as JSX.Element

CTAComponent.defaultProps = {
    __TYPE: 'CTA',
}

const FooterComponent = ({
    apiCallInProgress,
    handleModalClose,
    children,
}: PropsWithChildren<NewClusterFormFooterProps>) => {
    const childrenArray = Children.toArray(children)
    const CTA = childrenArray.find((child) => (child as ReactElement)?.props?.__TYPE === 'CTA')
    const Start = childrenArray.find((child) => (child as ReactElement)?.props?.__TYPE === 'Start')

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
