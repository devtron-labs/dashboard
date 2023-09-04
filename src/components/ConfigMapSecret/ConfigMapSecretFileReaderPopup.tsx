import { ConditionalWrap, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'

function ConfigMapSecretFileReaderPopup({ toggleFileReaderPopup, showFileReaderPopup }) {
    const renderFileContent = (): JSX.Element => {
        return <></>
    }

    return (
        <div>
            <ConditionalWrap
                condition={!!showFileReaderPopup}
                wrap={(children) => (
                    <TippyCustomized
                        hideHeading={true}
                        noHeadingBorder={true}
                        theme={TippyTheme.white}
                        className="default-tt p-12"
                        arrow={false}
                        placement="bottom"
                        trigger="click"
                        additionalContent={renderFileContent()}
                        interactive={true}
                    ><div>
                                  <div className="cb-5 ml-4" onClick={toggleFileReaderPopup}>Import from file...</div>

                    </div>
                    </TippyCustomized>
                )}
            >
              test
          
            </ConditionalWrap>
        </div>
    )
}

export default ConfigMapSecretFileReaderPopup
