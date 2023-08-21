import React from 'react'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICHelpOutline } from '../../assets/img/ic-help-outline.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from './constants'

const Descriptor = ({ children, showUploadButton }: { children?: React.ReactNode; showUploadButton?: boolean }) => {
    return (
        <div className="descriptor-container">
            <div className="flex center dc__gap-8">
                <p className="default-view-title-typography">{DEFAULT_TITLE}</p>
                <TippyCustomized
                    theme={TippyTheme.white}
                    className="w-300 h-100 fcv-5"
                    placement="right"
                    Icon={QuestionFilled}
                    heading={DEFAULT_TITLE}
                    infoText={DEFAULT_DESCRIPTION}
                    showCloseButton={true}
                    trigger="click"
                    interactive={true}
                >
                    <button className="descriptor-help-button">
                        <ICHelpOutline width={20} height={20} />
                    </button>
                </TippyCustomized>
            </div>
            {showUploadButton && <button className="descriptor-container__upload-button">Upload</button>}
            {children}
        </div>
    )
}

export default Descriptor
