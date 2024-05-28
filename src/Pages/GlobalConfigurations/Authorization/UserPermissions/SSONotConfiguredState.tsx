import React from 'react'
import { GenericEmptyState, InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import EmptyImage from '../../../../assets/img/empty-applist@2x.png'
import { SSO_NOT_CONFIGURED_STATE_TEXTS } from '../../../../config/constantMessaging'
import { ReactComponent as ErrorIcon } from '../../../../assets/icons/ic-error-exclamation.svg'

const Error = () => <ErrorIcon className="h-20" />

const SSONotConfiguredState = () => (
    <GenericEmptyState
        image={EmptyImage}
        classname="fs-16 dc__align-center lh-24 mb-8-imp mt-20"
        title={SSO_NOT_CONFIGURED_STATE_TEXTS.title}
        subTitle={
            <>
                {SSO_NOT_CONFIGURED_STATE_TEXTS.subTitle}
                <InfoColourBar
                    message={
                        <>
                            <span className="dc__bold">{SSO_NOT_CONFIGURED_STATE_TEXTS.notConfigured}</span>
                            {SSO_NOT_CONFIGURED_STATE_TEXTS.infoText}
                        </>
                    }
                    classname="error_bar mt-8 dc__align-left info-colour-bar svg p-8 pl-8-imp "
                    linkText={SSO_NOT_CONFIGURED_STATE_TEXTS.linkText}
                    redirectLink={SSO_NOT_CONFIGURED_STATE_TEXTS.redirectLink}
                    internalLink
                    Icon={Error}
                />
            </>
        }
    />
)

export default SSONotConfiguredState
