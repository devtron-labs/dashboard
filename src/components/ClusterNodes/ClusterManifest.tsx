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

import { useState, useEffect } from 'react'
import YAML from 'yaml'
import { VisibleModal2, YAMLStringify, CodeEditor } from '@devtron-labs/devtron-fe-common-lib'
import MessageUI, { MsgUIType } from '../v2/common/message.ui'
import { getClusterManifest } from './clusterNodes.service'
import { ManifestMessaging, MESSAGING_UI, MODES } from '../../config'
import { ClusterManifestType, ManifestPopuptype } from './types'
import { ReactComponent as Pencil } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { defaultManifestErrorText, manifestCommentsRegex } from './constants'
import { EditModeType } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/constants'
import { getTrimmedManifestData } from '../v2/appDetails/k8Resource/nodeDetail/nodeDetail.util'

export default function ClusterManifest({
    terminalAccessId,
    manifestMode,
    setManifestMode,
    setManifestData,
    errorMessage,
    setManifestAvailable,
    selectTerminalTab,
    hideManagedFields,
}: ClusterManifestType) {
    // Manifest data with managed fields
    const [originalManifest, setOriginalManifest] = useState('')
    // Manifest data that we would be comparing with the edited manifest
    const [defaultManifest, setDefaultManifest] = useState('')
    const [manifestValue, setManifest] = useState('')
    const [loading, setLoading] = useState<boolean>(true)
    const [isResourceMissing, setResourceMissing] = useState(false)

    useEffect(() => {
        if (terminalAccessId) {
            setManifestMode(EditModeType.NON_EDIT)
            getClusterManifest(terminalAccessId)
                .then((response) => {
                    const _manifest = YAMLStringify(response.result?.manifest)
                    setOriginalManifest(_manifest)
                    const trimmedManifest = YAML.stringify(getTrimmedManifestData(response.result?.manifest))
                    setDefaultManifest(trimmedManifest)
                    // Ideally should have been setManifest(trimmedManifest).
                    if (hideManagedFields) {
                        setManifest(trimmedManifest)
                    } else {
                        setManifest(_manifest)
                    }
                    setLoading(false)
                    setManifestAvailable(true)
                })
                .catch((error) => {
                    setResourceMissing(true)
                    setManifestAvailable(false)
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            setResourceMissing(true)
            setLoading(false)
            setManifestAvailable(false)
        }
    }, [terminalAccessId])

    // NOTE: Need to remove this useEffect since manifestMode changes on events only.
    // Since there can be alot of ways this useEffect interferes with other handlers, causing bugs.
    // Plus it might be a case when this useEffect will run before we have manifest, which will cause issues.
    useEffect(() => {
        const regex = manifestCommentsRegex
        if (manifestMode === EditModeType.NON_EDIT) {
            const _manifest = hideManagedFields ? defaultManifest : originalManifest
            setManifest(_manifest)
        } else if (manifestMode === EditModeType.APPLY) {
            const _manifestValue = manifestValue.replace(regex, 'apiVersion:')
            if (_manifestValue !== defaultManifest) {
                try {
                    if (YAML.parse(_manifestValue)) {
                        setManifestData(JSON.stringify(YAML.parse(_manifestValue)))
                    } else {
                        setManifest(defaultManifestErrorText)
                        setManifestMode(EditModeType.EDIT)
                    }
                } catch (error) {
                    // Since we check error in edit as well, we can ignore this error and somehow infinite loop is created if we setManifest here.
                    setManifestMode(EditModeType.EDIT)
                }
            } else {
                selectTerminalTab()
                setManifestMode(EditModeType.NON_EDIT)
            }
        } else if (manifestMode === EditModeType.EDIT) {
            try {
                // Parsing will remove earlier comments, which will fix internal issues of code, currently the errorMessage is not getting cleared due to line 83.
                const parsedManifest = YAML.parse(manifestValue)
                if (parsedManifest) {
                    // Explicitly setting getTrimmedManifestData(parsedManifest) as object to avoid type error from YAMLStringify.
                    const trimmedManifest = YAMLStringify(getTrimmedManifestData(parsedManifest) as object)
                    const errorDetails = errorMessage?.length ? `${defaultManifestErrorText}# ${errorMessage}\n#\n` : ''
                    setManifest(errorDetails + trimmedManifest)
                } else {
                    setManifest(defaultManifestErrorText)
                }
            } catch (error) {
                // Should we directly use error object here?
                setManifest(`${defaultManifestErrorText}# ${error}\n#\n${manifestValue}`)
            }
        }
    }, [manifestMode, hideManagedFields])

    const switchToEditMode = (): void => {
        setManifestMode(EditModeType.EDIT)
    }

    const renderManifest = () => {
        if (isResourceMissing) {
            return <MessageUI msg={MESSAGING_UI.MANIFEST_NOT_AVAILABLE} size={24} minHeight="100%" />
        }
        if (loading) {
            return (
                <MessageUI msg={MESSAGING_UI.FETCHING_MANIFEST} icon={MsgUIType.LOADING} size={24} minHeight="100%" />
            )
        }
        return (
            <div className="h-100 flexbox-col">
                {manifestMode === EditModeType.REVIEW && (
                    <div className="dc__grid-half py-4 text__white vertical-divider">
                        <div className="flex dc__content-space px-12">
                            <span>Pod manifest</span>
                            <span className="flex" data-testid="close-to-edit-manifest" onClick={switchToEditMode}>
                                <Close className="icon-dim-16 cursor icon-fill__white" />
                            </span>
                        </div>
                        <div className="flex left px-12">
                            <Pencil className="icon-dim-16 mr-10 icon-stroke__white" />
                            <span>Manifest (Editing)</span>
                        </div>
                    </div>
                )}
                <CodeEditor
                    height="100%"
                    mode={MODES.YAML}
                    noParsing
                    readOnly={manifestMode !== EditModeType.EDIT && manifestMode !== EditModeType.REVIEW}
                    diffView={manifestMode === EditModeType.REVIEW}
                    {...(manifestMode === EditModeType.REVIEW
                        ? {
                              diffView: true,
                              originalValue: defaultManifest,
                              modifiedValue: manifestValue,
                          }
                        : {
                              diffView: false,
                              value: manifestValue,
                              onChange: setManifest,
                          })}
                />
            </div>
        )
    }

    return <div className="dc__overflow-hidden h-100">{renderManifest()}</div>
}

export const ManifestPopupMenu = ({ closePopup, podName, namespace, forceDeletePod }: ManifestPopuptype) => {
    const closePopupDoNothing = (): void => {
        closePopup(false)
    }

    const forceDelete = (): void => {
        forceDeletePod(true)
    }

    return (
        <VisibleModal2 className="confirmation-dialog">
            <div className="confirmation-dialog__body ">
                <div className="flexbox dc__content-space mb-20">
                    <WarningIcon className="h-48 mw-48" />
                    <Close className="icon-dim-24 cursor" onClick={closePopupDoNothing} />
                </div>
                <div className="flex left column ">
                    <h3 className="confirmation-dialog__title lh-1-5 dc__break-word w-100">
                        {ManifestMessaging.POD_NAME_EXIST_IN_NAMESPACE}
                    </h3>
                    <p className="fs-14 fw-4">
                        {`${ManifestMessaging.POD_NAME} "${podName}" ${ManifestMessaging.ALREADY_EXIST} “${namespace}” ${ManifestMessaging.NAMESPACE}.`}
                    </p>
                    <p className="fs-14 fw-4">{ManifestMessaging.CONTINUE_TERMINATE_EXISTING_POD}</p>
                    <p className="fs-14 fw-4">{ManifestMessaging.SURE_WANT_TO_CONTINUE}</p>
                </div>
                <div className="flex right confirmation-dialog__button-group">
                    <button
                        type="button"
                        tabIndex={3}
                        className="cta cancel sso__warn-button"
                        onClick={closePopupDoNothing}
                        data-testid="terminate-existing-pod-cancel-button"
                    >
                        {ManifestMessaging.CANCEL}
                    </button>
                    <button
                        className="cta sso__warn-button btn-confirm"
                        data-testid="terminate-existing-pod-button"
                        onClick={forceDelete}
                    >
                        {ManifestMessaging.TERMINATE_EXISTING_POD}
                    </button>
                </div>
            </div>
        </VisibleModal2>
    )
}
