import React from 'react'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { InfoIconTippyType } from './Types'

export default function InfoIconWithTippy({ titleText, infoText, documentationLink }: InfoIconTippyType) {
    return (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300 h-100 fcv-5"
            placement="right"
            Icon={QuestionFilled}
            heading={titleText}
            infoText={infoText}
            showCloseButton
            trigger="click"
            interactive
            documentationLink={documentationLink}
            documentationLinkText="View Documentation"
        >
            <div className="icon-dim-20 fcn-9 ml-8 cursor">
                <Question />
            </div>
        </TippyCustomized>
    )
}
