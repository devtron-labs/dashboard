import { DocLink, Icon, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'

import { LearnMoreProps } from './types'

const AdditionalContent = ({
    documentationText,
    documentationLink,
    devtronDocLink,
}: Pick<LearnMoreProps, 'documentationLink' | 'documentationText' | 'devtronDocLink'>) => (
    <div className="pl-12 pb-12">
        {documentationLink && documentationText && (
            <a
                href={documentationLink}
                target="_blank"
                rel="noreferrer noreferrer"
                className="anchor flexbox flex-align-center fs-13 dc__gap-4 mb-8"
            >
                {documentationText}
                <Icon name="ic-arrow-square-out" color="B500" size={14} />
            </a>
        )}
        <DocLink
            docLinkKey={devtronDocLink}
            text="View documentation"
            dataTestId="learn-more-about-view-documentation-link"
            showExternalIcon
            openInNewTab
        />
    </div>
)

const LearnMoreTippy = ({
    heading,
    infoText,
    documentationText,
    documentationLink,
    devtronDocLink,
}: LearnMoreProps) => (
    <TippyCustomized
        theme={TippyTheme.white}
        className="w-300 h-100 dc__align-left"
        placement="right"
        iconClass="fcv-5"
        infoText={infoText}
        additionalContent={
            <AdditionalContent
                documentationText={documentationText}
                documentationLink={documentationLink}
                devtronDocLink={devtronDocLink}
            />
        }
        heading={heading}
        showCloseButton
        trigger="click"
        interactive
    >
        <div className="anchor cursor dc__inline-block">Learn more</div>
    </TippyCustomized>
)

export default LearnMoreTippy
