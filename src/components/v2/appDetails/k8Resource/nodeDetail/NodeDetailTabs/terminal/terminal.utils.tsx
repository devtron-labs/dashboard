import React from 'react'
import CreatableSelect from 'react-select/creatable'
import { ReactComponent as Disconnect } from '../../../../../../../assets/icons/ic-disconnected.svg'
import { ReactComponent as Close } from '../../../../../../../assets/icons/ic-cross.svg'
import { ReactComponent as FullScreen } from '../../../../../../../assets/icons/ic-fullscreen-2.svg'
import { ReactComponent as ExitScreen } from '../../../../../../../assets/icons/ic-exit-fullscreen-2.svg'
import { ReactComponent as HelpIcon } from '../../../../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Connect } from '../../../../../../../assets/icons/ic-connected.svg'
import { ReactComponent as Help } from '../../../../../../../assets/icons/ic-help.svg'
import { ReactComponent as Play } from '../../../../../../../assets/icons/ic-play.svg'
import { ReactComponent as Abort } from '../../../../../../../assets/icons/ic-abort.svg'
import Tippy from '@tippyjs/react'
import ReactSelect from 'react-select'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import {
    SelectWrapperType,
    ReactSelectType,
    WrapperTitleType,
    ConnectionButtonType,
    CloseExpandView,
    ConnectionSwitchType,
    ClearTerminalType,
} from './terminal.type'

const creatableSelectWrapper = (selectData: SelectWrapperType) => {
    if (selectData.hideTerminalStripComponent) return null
    return (
        <>
            <span className="bcn-2 mr-8" style={{ width: '1px', height: '16px' }} />
            <div className="cn-6 ml-8 mr-4">{selectData.title}</div>
            {selectData.showInfoTippy && (
                <TippyCustomized
                    theme={TippyTheme.white}
                    heading="Image"
                    placement="top"
                    interactive={true}
                    trigger="click"
                    className="w-300"
                    Icon={Help}
                    showCloseButton={true}
                    iconClass="icon-dim-20 fcv-5"
                    additionalContent={selectData.infoContent}
                >
                    <HelpIcon className="icon-dim-16 mr-8 cursor" />
                </TippyCustomized>
            )}
            <div>
                <CreatableSelect
                    placeholder={selectData.placeholder}
                    options={selectData.options}
                    defaultValue={selectData.defaultValue}
                    value={selectData.value}
                    onChange={selectData.onChange}
                    styles={selectData.styles}
                    components={selectData.components}
                />
            </div>
        </>
    )
}

const reactSelect = (selectData: ReactSelectType) => {
    if (selectData.hideTerminalStripComponent) return null
    return (
        <>
            {selectData.showDivider && <span className="bcn-2 mr-8" style={{ width: '1px', height: '16px' }} />}
            <div className="cn-6 mr-10">{selectData.title}</div>
            <div style={{ minWidth: '145px' }}>
                <ReactSelect
                    placeholder={selectData.placeholder}
                    options={selectData.options}
                    defaultValue={selectData.defaultValue}
                    value={selectData.value}
                    onChange={selectData.onChange}
                    styles={selectData.styles}
                    components={selectData.components}
                />
            </div>
        </>
    )
}

const titleName = (titleData: WrapperTitleType) => {
    if (titleData.hideTerminalStripComponent) return null
    return (
        <>
            <div className="cn-6 mr-16">{titleData.title}</div>
            <div className="flex fw-6 fs-13 mr-20">{titleData.value}</div>
            <span className="bcn-2 mr-16 h-32" style={{ width: '1px' }} />
        </>
    )
}

const connectionButton = (connectData: ConnectionButtonType) => {
    if (connectData.hideTerminalStripComponent) return null
    return (
        <Tippy
            className="default-tt"
            arrow={false}
            placement="bottom"
            content={connectData.connectTerminal ? 'Disconnect and terminate pod' : 'Connect to terminal'}
        >
            {connectData.connectTerminal ? (
                <span className="flex mr-8">
                    <Disconnect className="icon-dim-16 mr-4 cursor" onClick={connectData.closeTerminalModal} />
                </span>
            ) : (
                <span className="flex mr-8">
                    <Connect className="icon-dim-16 mr-4 cursor" onClick={connectData.reconnectTerminal} />
                </span>
            )}
        </Tippy>
    )
}

const closeExpandView = (viewData: CloseExpandView) => {
    if (viewData.hideTerminalStripComponent) return null
    return (
        <span className="flex dc__align-right">
            {viewData.showExpand && (
                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="top"
                    content={viewData.isFullScreen ? 'Restore height' : 'Maximise height'}
                >
                    {viewData.isFullScreen ? (
                        <ExitScreen
                            className="mr-12 dc__hover-n100 br-4  cursor fcn-6"
                            onClick={viewData.toggleScreenView}
                        />
                    ) : (
                        <FullScreen
                            className="mr-12 dc__hover-n100 br-4  cursor fcn-6"
                            onClick={viewData.toggleScreenView}
                        />
                    )}
                </Tippy>
            )}
            <Tippy className="default-tt" arrow={false} placement="top" content={'Close'}>
                <Close
                    className="icon-dim-20 cursor fcr-5 dc__hover-r100 br-4 fcn-6 mr-20"
                    onClick={viewData.closeTerminalModal}
                />
            </Tippy>
        </span>
    )
}

const connectionSwitch = (switchProps: ConnectionSwitchType) => {
    if (switchProps.hideTerminalStripComponent) return null
    return (
        <>
            <span className="bcn-2 mr-8 h-28" style={{ width: '1px' }} />
            <Tippy
                className="default-tt cursor"
                arrow={false}
                placement="bottom"
                content={switchProps.toggleButton ? 'Disconnect from pod' : 'Reconnect to pod'}
            >
                {switchProps.toggleButton ? (
                    <span className="mr-8 cursor">
                        <div
                            className="icon-dim-12 mt-4 mr-4 mb-4 br-2 bcr-5"
                            onClick={switchProps.stopTerminalConnection}
                        />
                    </span>
                ) : (
                    <span className="mr-8 flex">
                        <Play className="icon-dim-16 mr-4 cursor" onClick={switchProps.resumePodConnection} />
                    </span>
                )}
            </Tippy>
        </>
    )
}

const clearTerminal = (clearProps: ClearTerminalType) => {
    if (clearProps.hideTerminalStripComponent) return null
    return (
        <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
            <div className="flex mr-8">
                <Abort className="icon-dim-16 mr-4 fcn-6 cursor" onClick={clearProps.setTerminalCleared} />
            </div>
        </Tippy>
    )
}

export default function terminalStripTypeData(elementData) {
    switch (elementData.type) {
        case 'creatableSelect':
            return creatableSelectWrapper(elementData)
        case 'connectionButton':
            return connectionButton(elementData)
        case 'titleName':
            return titleName(elementData)
        case 'closeExpandView':
            return closeExpandView(elementData)
        case 'reactSelect':
            return reactSelect(elementData)
        case 'connectionSwitch':
            return connectionSwitch(elementData)
        case 'clearButton':
            return clearTerminal(elementData)
        case 'customComponent':
            return elementData.customComponent()
        default:
            return null
    }
}
