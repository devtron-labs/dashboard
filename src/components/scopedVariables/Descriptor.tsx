import React from 'react'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICHelpOutline } from '../../assets/img/ic-help-outline.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { ReactComponent as ICUpload } from '../../assets/icons/ic-upload.svg'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from './constants'

const Descriptor = ({ children, showUploadButton }: { children?: React.ReactNode; showUploadButton?: boolean }) => {
    return (
        <>
            <div
                className="descriptor-container"
                style={children ? { padding: '16px 20px 8px 20px', borderBottom: 'none' } : {}}
            >
                <div className="flex dc__gap-8 w-100 dc__content-space">
                    <div className="flex dc__gap-8">
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
                    {showUploadButton && (
                        <button className="descriptor-container__upload-button">
                            <ICUpload width={14} height={14} /> Upload new file to replace
                        </button>
                    )}
                </div>
            </div>
            {children}
        </>
    )
}

export default Descriptor
