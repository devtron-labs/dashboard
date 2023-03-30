import React from 'react'
import { DEPRECATED_EXTERNAL_CI_MESSAGE, DOCUMENTATION } from '../../config'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'

export default function DeprecatedPipelineWarning() {
    const ExternalSecretHelpNote = () => {
        return (
            <div className="fs-13 fw-4 lh-18">
                {`${DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_ONE} ${DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_TWO} ${DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_THREE}`}
                &nbsp;
                <a className="dc__link" href={DOCUMENTATION.WEBHOOK_CI} rel="noreferrer noopener" target="_blank">
                    {DEPRECATED_EXTERNAL_CI_MESSAGE.DOC_LINK_TEXT}
                </a>
            </div>
        )
    }
    return (
        <InfoColourBar
            message={<ExternalSecretHelpNote />}
            classname="warn dc__no-border-radius dc__no-border"
            Icon={Warn}
            iconClass="warning-icon"
        />
    )
}
