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
import { ReactComponent as Check } from '../../../../../../../assets/icons/ic-check.svg'
import { ReactComponent as Pencil } from '../../../../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Edit } from '../../../../../../../assets/icons/ic-visibility-on.svg'
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
    EditManifestType,
    DebugModeType,
} from './terminal.type'
import { EDIT_MODE_TYPE, MANIFEST_SELECTION_MESSAGE, TERMINAL_WRAPPER_COMPONENT_TYPE } from './constants'
import Toggle from '../../../../../../common/Toggle/Toggle'
import { CLUSTER_TERMINAL_MESSAGING } from '../../../../../../ClusterNodes/constants'

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

const debugModeToggleButton = (selectData: DebugModeType) => {
    if (selectData.hideTerminalStripComponent) return null
    return (
        <>
            <span className="bcn-2 mr-8 h-28" style={{ width: '1px' }} />
            {selectData.showInfoTippy && (
                <TippyCustomized
                    theme={TippyTheme.white}
                    heading="Debug mode"
                    placement="top"
                    interactive={true}
                    trigger="click"
                    className="w-300"
                    Icon={Help}
                    showCloseButton={true}
                    iconClass="icon-dim-20 fcv-5"
                    additionalContent={
                        <div className="p-12 w-300 fs-13 fw-4">{CLUSTER_TERMINAL_MESSAGING.DEBUG_MODE_TEXT}</div>
                    }
                >
                    <HelpIcon className="icon-dim-16 mr-8 cursor" />
                </TippyCustomized>
            )}
            <span>Debug Mode</span>
            <span className="toggle-icon-dim ml-8">
                <Toggle onSelect={selectData.onToggle} selected={selectData.isEnabled} />
            </span>
        </>
    )
}

const manifestEditButtons = ({
    hideTerminalStripComponent,
    buttonSelectionState,
    setManifestButtonState,
}: EditManifestType) => {
    if (hideTerminalStripComponent) {
        return null
    }

    const selectEditMode = () => {
        setManifestButtonState(EDIT_MODE_TYPE.EDIT)
    }

    const selectReviewMode = () => {
        setManifestButtonState(EDIT_MODE_TYPE.REVIEW)
    }

    const applyChanges = () => {
        setManifestButtonState(EDIT_MODE_TYPE.APPLY)
    }

    const cancelChanges = () => {
        setManifestButtonState(EDIT_MODE_TYPE.NON_EDIT)
    }

    const renderButtons = () => {
        const buttonConfig = {
            edit: {
                icon: <Pencil className="icon-dim-16 mr-6" />,
                message: MANIFEST_SELECTION_MESSAGE.REVIEW_CHANGES,
                onClick: selectReviewMode,
            },
            review: {
                icon: <Check className="icon-dim-16 mr-6" />,
                message: MANIFEST_SELECTION_MESSAGE.APPLY_CHANGES,
                onClick: applyChanges,
            },
            noEdit: {
                icon: <Edit className="icon-dim-16 mr-6" />,
                message: MANIFEST_SELECTION_MESSAGE.EDIT_MANIFEST,
                onClick: selectEditMode,
            },
        }

        const config = buttonConfig[buttonSelectionState] || buttonConfig.noEdit

        return (
            <span className="flex cb-5 ml-4 cursor fw-6 fs-12 scb-5 left" onClick={config.onClick}>
                {config.icon}
                {config.message}
            </span>
        )
    }

    return (
        <>
            <span className="bcn-2 mr-8 h-28" style={{ width: '1px' }} />
            {renderButtons()}
            {buttonSelectionState !== EDIT_MODE_TYPE.NON_EDIT && (
                <span className="ml-12 cn-7 fw-6 fs-12 cursor" onClick={cancelChanges}>
                    {MANIFEST_SELECTION_MESSAGE.CANCEL}
                </span>
            )}
        </>
    )
}

export default function terminalStripTypeData(elementData) {
    switch (elementData.type) {
        case TERMINAL_WRAPPER_COMPONENT_TYPE.CREATABLE_SELECT:
            return creatableSelectWrapper(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.CONNECTION_BUTTON:
            return connectionButton(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.TITLE_NAME:
            return titleName(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.CLOSE_EXPAND_VIEW:
            return closeExpandView(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.REACT_SELECT:
            return reactSelect(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.CONNCTION_SWITCH:
            return connectionSwitch(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.CLEAR_BUTTON:
            return clearTerminal(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.MANIFEST_EDIT_BUTTONS:
            return manifestEditButtons(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.DEBUG_MODE_TOGGLE_BUTTON:
            return debugModeToggleButton(elementData)
        case TERMINAL_WRAPPER_COMPONENT_TYPE.CUSTOM_COMPONENT:
            return elementData.customComponent()
        default:
            return null
    }
}
