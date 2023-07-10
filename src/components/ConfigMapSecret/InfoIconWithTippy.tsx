import React from 'react'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'

export default function InfoIconWithTippy({
    infoText,
    documentationLink,
}: {
    infoText: string
    documentationLink: string
}) {
    return (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300 h-100 fcv-5"
            placement="right"
            Icon={QuestionFilled}
            heading={'API tokens'}
            infoText={infoText}
            showCloseButton={true}
            trigger="click"
            interactive={true}
            documentationLink={documentationLink}
            documentationLinkText="View Documentation"
        >
            <div className="icon-dim-16 fcn-9 ml-8 cursor">
                <Question />
            </div>
        </TippyCustomized>
    )
}
