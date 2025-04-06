import { Button, ButtonVariantType, NewClusterFormFooterProps } from '@devtron-labs/devtron-fe-common-lib'
import { PropsWithChildren } from 'react'

const FooterComponent = ({
    apiCallInProgress,
    handleModalClose,
    children,
}: PropsWithChildren<NewClusterFormFooterProps>) => (
    <footer className="dc__position-abs dc__bottom-0 dc__left-0 w-100 dc__zi-1 bg__primary flexbox dc__content-end dc__border-top-n1 px-20 py-16 dc__gap-12 dc__no-shrink">
        <Button
            dataTestId="cancel-create-cluster-button"
            onClick={handleModalClose}
            disabled={apiCallInProgress}
            text="Cancel"
            variant={ButtonVariantType.secondary}
        />

        {children}
    </footer>
)

export default FooterComponent
