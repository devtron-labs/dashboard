/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import CreatableSelect from 'react-select/creatable'
import Tippy from '@tippyjs/react'

import { InfoIconTippy, SelectPicker, SelectPickerVariantType, Toggle } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { ReactComponent as Abort } from '../../../../../../../assets/icons/ic-abort.svg'
import { ReactComponent as Check } from '../../../../../../../assets/icons/ic-check.svg'
import { ReactComponent as Connect } from '../../../../../../../assets/icons/ic-connected.svg'
import { ReactComponent as Close } from '../../../../../../../assets/icons/ic-cross.svg'
import { ReactComponent as Disconnect } from '../../../../../../../assets/icons/ic-disconnected.svg'
import { ReactComponent as ExitScreen } from '../../../../../../../assets/icons/ic-exit-fullscreen-2.svg'
import { ReactComponent as FullScreen } from '../../../../../../../assets/icons/ic-fullscreen-2.svg'
import { ReactComponent as Pencil } from '../../../../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Play } from '../../../../../../../assets/icons/ic-play-filled.svg'
import { ReactComponent as Stop } from '../../../../../../../assets/icons/ic-stop-filled.svg'
import { ReactComponent as Edit } from '../../../../../../../assets/icons/ic-visibility-on.svg'
import { CLUSTER_TERMINAL_MESSAGING } from '../../../../../../ClusterNodes/constants'
import { EditModeType, MANIFEST_SELECTION_MESSAGE, TerminalWrapperType } from './constants'
import {
    ClearTerminalType,
    CloseExpandView,
    ConnectionButtonType,
    ConnectionSwitchType,
    DebugModeType,
    EditManifestType,
    ReactSelectType,
    SelectWrapperType,
    WrapperTitleType,
} from './terminal.type'

const DownloadFileFolderButton = importComponentFromFELibrary('DownloadFileFolderButton', null, 'function')

const creatableSelectWrapper = (selectData: SelectWrapperType) => {
    if (selectData.hideTerminalStripComponent) {
        return null
    }
    return (
        <>
            <span className="bcn-2 mr-8" style={{ width: '1px', height: '16px' }} />
            {selectData.showInfoTippy && (
                <InfoIconTippy
                    heading="Image"
                    iconClass="icon-dim-20 fcv-5"
                    additionalContent={selectData.infoContent}
                    iconClassName="icon-dim-16 fcn-6"
                />
            )}
            <div className="cn-6">{selectData.title}</div>
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
    if (selectData.hideTerminalStripComponent) {
        return null
    }
    return (
        <>
            {selectData.showDivider && <span className="bcn-2 mr-8" style={{ width: '1px', height: '16px' }} />}
            <div className="cn-6 mr-10">{selectData.title}</div>
            <SelectPicker
                inputId="cluster-terminal-debug-mode"
                name="cluster-terminal-debug-mode"
                placeholder={selectData.placeholder}
                classNamePrefix={selectData.classNamePrefix}
                options={selectData.options}
                value={selectData.value}
                onChange={selectData.onChange}
                variant={SelectPickerVariantType.COMPACT}
                showSelectedOptionIcon={false}
            />
        </>
    )
}

const titleName = (titleData: WrapperTitleType) => {
    if (titleData.hideTerminalStripComponent) {
        return null
    }
    return (
        <>
            <div className="cn-6 mr-16">{titleData.title}</div>
            <div className="flex fw-6 fs-13 mr-20" data-testid={titleData.dataTestId}>
                {titleData.value}
            </div>
            <span className="bcn-2 mr-16 h-32" style={{ width: '1px' }} />
        </>
    )
}

const connectionButton = (connectData: ConnectionButtonType) => {
    if (connectData.hideTerminalStripComponent) {
        return null
    }
    return (
        <Tippy
            className="default-tt"
            arrow={false}
            placement="bottom"
            // NOTE: cluster terminal does not show this button instead it shows the connection switch button
            content={connectData.connectTerminal ? 'Disconnect terminal' : 'Connect to terminal'}
        >
            {connectData.connectTerminal ? (
                <span className="flex">
                    <Disconnect
                        className="icon-dim-16 mr-4 cursor"
                        data-testid="node-details-terminal-disconnect"
                        onClick={connectData.closeTerminalModal}
                    />
                </span>
            ) : (
                <span className="flex">
                    <Connect
                        className="icon-dim-16 mr-4 cursor"
                        data-testid="node-details-terminal-connect"
                        onClick={connectData.reconnectTerminal}
                    />
                </span>
            )}
        </Tippy>
    )
}

const closeExpandView = (viewData: CloseExpandView) => {
    if (viewData.hideTerminalStripComponent) {
        return null
    }
    return (
        <span className="flex dc__align-right">
            {viewData.showExpand && (
                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="top"
                    content={viewData.isFullScreen ? 'Restore height' : 'Maximize height'}
                >
                    <div>
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
                    </div>
                </Tippy>
            )}
            <Tippy className="default-tt" arrow={false} placement="top" content="Close">
                <div className="flex">
                    <Close
                        className="icon-dim-20 cursor fcr-5 dc__hover-r100 br-4 fcn-6 mr-20"
                        data-testid="cluster-terminal-close-screen-button"
                        onClick={viewData.closeTerminalModal}
                    />
                </div>
            </Tippy>
        </span>
    )
}

const connectionSwitch = (switchProps: ConnectionSwitchType) => {
    if (switchProps.hideTerminalStripComponent) {
        return null
    }
    return (
        <>
            <span className="bcn-2 h-32" style={{ width: '1px' }} />
            <Tippy
                className="default-tt cursor"
                arrow={false}
                placement="bottom"
                content={switchProps.toggleButton ? 'Disconnect from pod' : 'Reconnect to pod'}
            >
                {switchProps.toggleButton ? (
                    <span className="flex" data-testid="disconnect-button">
                        <Stop className="icon-dim-16 fcr-5 mr-4 cursor" onClick={switchProps.stopTerminalConnection} />
                    </span>
                ) : (
                    <span className="flex" data-testid="play-button">
                        <Play className="icon-dim-16 fcg-5 mr-4 cursor" onClick={switchProps.resumePodConnection} />
                    </span>
                )}
            </Tippy>
        </>
    )
}

const clearTerminal = (clearProps: ClearTerminalType) => {
    if (clearProps.hideTerminalStripComponent) {
        return null
    }
    return (
        <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
            <div className="flex" data-testid={clearProps.dataTestId}>
                <Abort className="icon-dim-16 mr-4 fcn-6 cursor" onClick={clearProps.setTerminalCleared} />
            </div>
        </Tippy>
    )
}

const debugModeToggleButton = (selectData: DebugModeType) => {
    if (selectData.hideTerminalStripComponent) {
        return null
    }
    return (
        <>
            <span className="bcn-2 h-32" style={{ width: '1px' }} />
            {selectData.showInfoTippy && (
                <InfoIconTippy
                    heading="Debug mode"
                    iconClass="icon-dim-20 fcv-5"
                    additionalContent={
                        <div className="p-12 w-300 fs-13 fw-4">{CLUSTER_TERMINAL_MESSAGING.DEBUG_MODE_TEXT}</div>
                    }
                    iconClassName="icon-dim-16 fcn-6 mr-8"
                />
            )}
            <span>Debug Mode</span>
            <span className="toggle-icon-dim">
                <Toggle onSelect={selectData.onToggle} dataTestId="toggle-debug-mode" selected={selectData.isEnabled} />
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
            <span
                className="flex cb-5 ml-4 cursor fw-6 fs-12 scb-5 left"
                data-testid={`${buttonSelectionState}-manifest`}
                onClick={config.onClick}
            >
                {config.icon}
                {config.message}
            </span>
        )
    }

    return (
        <>
            <span className="bcn-2 h-32" style={{ width: '1px' }} />
            {renderButtons()}
            {buttonSelectionState !== EditModeType.NON_EDIT && (
                <span
                    className="ml-12 cn-7 fw-6 fs-12 cursor"
                    data-testid="cancel-edit-manifest"
                    onClick={cancelChanges}
                >
                    {MANIFEST_SELECTION_MESSAGE.CANCEL}
                </span>
            )}
        </>
    )
}

const downloadFileFolderButton = (elementData): JSX.Element => {
    if (elementData.hideTerminalStripComponent || !DownloadFileFolderButton) {
        return null
    }

    return (
        <DownloadFileFolderButton
            appDetails={elementData.appDetails}
            containerName={elementData.containerName}
            isResourceBrowserView={elementData.isResourceBrowserView}
            isClusterTerminalView={elementData.isClusterTerminalView}
            clusterViewPodName={elementData.podName}
        />
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
        case TerminalWrapperType.CONNECTION_SWITCH:
            return connectionSwitch(elementData)
        case TerminalWrapperType.CLEAR_BUTTON:
            return clearTerminal(elementData)
        case TerminalWrapperType.MANIFEST_EDIT_BUTTONS:
            return manifestEditButtons(elementData)
        case TerminalWrapperType.DEBUG_MODE_TOGGLE_BUTTON:
            return debugModeToggleButton(elementData)
        case TerminalWrapperType.CUSTOM_COMPONENT:
            return elementData.customComponent()
        case TerminalWrapperType.DOWNLOAD_FILE_FOLDER:
            return downloadFileFolderButton(elementData)
        default:
            return null
    }
}

// To fix the scrollbar issue with Xterm in edit mode, we need to restrict the width and height of the xterm-accessibility div as same as xterm-screen div
// CON: In case of resize, we need to call this function again
export const restrictXtermAccessibilityWidth = () => {
    const xtermScreen = document.querySelector('.xterm-screen') as HTMLElement
    const xtermAccessibility = document.querySelector('.xterm-accessibility') as HTMLElement

    if (xtermScreen && xtermAccessibility) {
        xtermAccessibility.style.width = `${xtermScreen.clientWidth}px`
        xtermAccessibility.style.height = `${xtermScreen.clientHeight}px`
    }
}
