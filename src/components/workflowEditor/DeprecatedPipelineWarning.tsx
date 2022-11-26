import React from 'react'
import { DEPRECATED_EXTERNAL_CI_MESSAGE, DOCUMENTATION } from '../../config'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'

export default function DeprecatedPipelineWarning() {
    const ExternalSecretHelpNote = () => {
        return (
            <div className="fs-13 fw-4 lh-18">
                {DEPRECATED_EXTERNAL_CI_MESSAGE}
                <br />
                <a className="dc__link" href={DOCUMENTATION.WEBHOOK_CI} rel="noreferrer noopener" target="_blank">
                    Refer documentation
                </a>
                &nbsp;to learn how to recieve images from authenticated sources.
            </div>
        )
    }
    return (
        <InfoColourBar
            message={<ExternalSecretHelpNote />}
            classname="warn dc__no-border-radius "
            Icon={Warn}
            iconClass="warning-icon"
        />
    )
}
