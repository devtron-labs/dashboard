import { Button, ButtonStyleType, ButtonVariantType, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { HeaderSectionProps } from './types'

const HeaderSection = ({ isJobView, handleClose, isCloseDisabled }: HeaderSectionProps) => (
    <div className="flex flex-align-center flex-justify border__primary--bottom py-12 px-20">
        <h2 className="fs-16 fw-6 lh-1-43 m-0">Create {isJobView ? 'Job' : 'Devtron Application'}</h2>
        <Button
            onClick={handleClose}
            dataTestId={`close-create-custom${isJobView ? 'job' : 'app'}-wing`}
            icon={<ICClose />}
            disabled={isCloseDisabled}
            ariaLabel="Close"
            showAriaLabelInTippy={false}
            style={ButtonStyleType.negativeGrey}
            size={ComponentSizeType.small}
            variant={ButtonVariantType.borderLess}
        />
    </div>
)

export default HeaderSection
