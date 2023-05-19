import React from 'react'
import CreatableSelect from 'react-select/creatable'
import { ReactComponent as Disconnect } from '../../../../../../../assets/icons/ic-disconnected.svg'
import { ReactComponent as Close } from '../../../../../../../assets/icons/ic-cross.svg'
import { ReactComponent as FullScreen } from '../../../../../../../assets/icons/ic-fullscreen-2.svg'
import { ReactComponent as ExitScreen } from '../../../../../../../assets/icons/ic-exit-fullscreen-2.svg'
import { ReactComponent as HelpIcon } from '../../../../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Connect } from '../../../../../../../assets/icons/ic-connected.svg'
import { ReactComponent as Help } from '../../../../../../../assets/icons/ic-help.svg'
import { ReactComponent as Play } from '../../../../../../../assets/icons/ic-play-filled.svg'
import { ReactComponent as Abort } from '../../../../../../../assets/icons/ic-abort.svg'
import { ReactComponent as Check } from '../../../../../../../assets/icons/ic-check.svg'
import { ReactComponent as Pencil } from '../../../../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Edit } from '../../../../../../../assets/icons/ic-visibility-on.svg'
import { ReactComponent as Stop } from '../../../../../../../assets/icons/ic-stop-filled.svg'
import Tippy from '@tippyjs/react'
import ReactSelect from 'react-select'
import { TippyCustomized, TippyTheme, Toggle } from '@devtron-labs/devtron-fe-common-lib'
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
import { EditModeType, MANIFEST_SELECTION_MESSAGE, TerminalWrapperType } from './constants'
import { CLUSTER_TERMINAL_MESSAGING } from '../../../../../../ClusterNodes/constants'

const creatableSelectWrapper = (selectData: SelectWrapperType) => {
    if (selectData.hideTerminalStripComponent) return null
    return (
        <>
            <span className="bcn-2 mr-8" style={{ width: '1px', height: '16px' }} />
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
                    <HelpIcon className="icon-dim-16 cursor" />
                </TippyCustomized>
            )}
            <div className="cn-6 ml-8 mr-4">{selectData.title}</div>
            <div>
                <CreatableSelect
                    placeholder={selectData.placeholder}
                    classNamePrefix={selectData.classNamePrefix}
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
                    classNamePrefix={selectData.classNamePrefix}
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
            <div className="flex fw-6 fs-13 mr-20" data-testid={titleData.dataTestId} >{titleData.value}</div>
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
                            data-testid="cluster-terminal-exit-screen-button"
                            onClick={viewData.toggleScreenView}
                        />
                    ) : (
                        <FullScreen
                            className="mr-12 dc__hover-n100 br-4  cursor fcn-6"
                            data-testid="cluster-terminal-full-screen-button"
                            onClick={viewData.toggleScreenView}
                        />
                    )}
                </Tippy>
            )}
            <Tippy className="default-tt" arrow={false} placement="top" content={'Close'}>
                <Close
                    className="icon-dim-20 cursor fcr-5 dc__hover-r100 br-4 fcn-6 mr-20"
                    data-testid="cluster-terminal-close-screen-button"
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
                    <span className="mr-8 flex" data-testid="disconnect-button">
                        <Stop className="icon-dim-16 fcr-5 mr-4 cursor" onClick={switchProps.stopTerminalConnection} />
                    </span>
                ) : (
                    <span className="mr-8 flex" data-testid="play-button">
                        <Play className="icon-dim-16 fcg-5 mr-4 cursor" onClick={switchProps.resumePodConnection} />
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
            <div className="flex mr-8" data-testid={clearProps.dataTestId}>
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
        setManifestButtonState(EditModeType.EDIT)
    }

    const selectReviewMode = () => {
        setManifestButtonState(EditModeType.REVIEW)
    }

    const applyChanges = () => {
        setManifestButtonState(EditModeType.APPLY)
    }

    const cancelChanges = () => {
        setManifestButtonState(EditModeType.NON_EDIT)
    }

    const renderButtons = () => {
        const buttonConfig = {
            edit: {
                icon: <Edit className="icon-dim-16 mr-6" />,
                message: MANIFEST_SELECTION_MESSAGE.REVIEW_CHANGES,
                onClick: selectReviewMode,
            },
            review: {
                icon: <Check className="icon-dim-16 mr-6" />,
                message: MANIFEST_SELECTION_MESSAGE.APPLY_CHANGES,
                onClick: applyChanges,
            },
            noEdit: {
                icon: <Pencil className="icon-dim-16 mr-6" />,
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
            {buttonSelectionState !== EditModeType.NON_EDIT && (
                <span className="ml-12 cn-7 fw-6 fs-12 cursor" onClick={cancelChanges}>
                    {MANIFEST_SELECTION_MESSAGE.CANCEL}
                </span>
            )}
        </>
    )
}

export default function terminalStripTypeData(elementData) {
    switch (elementData.type) {
        case TerminalWrapperType.CREATABLE_SELECT:
            return creatableSelectWrapper(elementData)
        case TerminalWrapperType.CONNECTION_BUTTON:
            return connectionButton(elementData)
        case TerminalWrapperType.TITLE_NAME:
            return titleName(elementData)
        case TerminalWrapperType.CLOSE_EXPAND_VIEW:
            return closeExpandView(elementData)
        case TerminalWrapperType.REACT_SELECT:
            return reactSelect(elementData)
        case TerminalWrapperType.CONNCTION_SWITCH:
            return connectionSwitch(elementData)
        case TerminalWrapperType.CLEAR_BUTTON:
            return clearTerminal(elementData)
        case TerminalWrapperType.MANIFEST_EDIT_BUTTONS:
            return manifestEditButtons(elementData)
        case TerminalWrapperType.DEBUG_MODE_TOGGLE_BUTTON:
            return debugModeToggleButton(elementData)
        case TerminalWrapperType.CUSTOM_COMPONENT:
            return elementData.customComponent()
        default:
            return null
    }
}
