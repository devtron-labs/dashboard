import React, { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import MessageUI, { MsgUIType } from '../v2/common/message.ui'
import { getClusterManifest } from './clusterNodes.service'
import YAML from 'yaml'
import { ManifestMessaging, MESSAGING_UI, MODES } from '../../config'
import { ClusterManifestType, ManifestPopuptype } from './types'
import { EDIT_MODE_TYPE } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/constants'
import { ReactComponent as Pencil } from '../../assets/icons/ic-pencil.svg'
import { VisibleModal2 } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { defaultManifestErrorText } from './constants'

export default function ClusterManifest({
    terminalAccessId,
    manifestMode,
    setManifestMode,
    setManifestData,
    errorMessage,
    setManifestAvailable
}: ClusterManifestType) {
    const [defaultManifest, setDefaultManifest] = useState('')
    const [manifestValue, setManifest] = useState('')
    const [loading, setLoading] = useState<boolean>(true)
    const [isResourceMissing, setResourceMissing] = useState(false)

    useEffect(() => {
        if (terminalAccessId) {
            setManifestMode(EDIT_MODE_TYPE.NON_EDIT)
            getClusterManifest(terminalAccessId)
                .then((response) => {
                    const _manifest = YAML.stringify(response.result?.manifest)
                    setDefaultManifest(_manifest)
                    setManifest(_manifest)
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

    useEffect(() => {
        const regex = /^(.*?apiVersion:)/s
        if (manifestMode === EDIT_MODE_TYPE.NON_EDIT) {
            setManifest(defaultManifest)
        } else if (manifestMode === EDIT_MODE_TYPE.APPLY) {
            const _manifestValue = manifestValue.replace(regex, 'apiVersion:')
            if (_manifestValue !== defaultManifest) {
                try {
                    if(YAML.parse(_manifestValue)){
                        setManifestData(JSON.stringify(YAML.parse(_manifestValue)))
                    }else {
                        setManifest(defaultManifestErrorText)
                    }
                } catch (error) {
                    setManifest(defaultManifestErrorText + '# ' + error + '\n#\n' + _manifestValue)
                    setManifestMode(EDIT_MODE_TYPE.EDIT)
                }
            } else {
                setManifest(defaultManifestErrorText + _manifestValue)
                setManifestMode(EDIT_MODE_TYPE.EDIT)
            }
        } else if (manifestMode === EDIT_MODE_TYPE.EDIT) {
            if (errorMessage?.length) {
                setManifest(defaultManifestErrorText + '# ' + errorMessage + '\n#\n' + manifestValue)
            }
        }
    }, [manifestMode])

    const switchToEditMode = (): void => {
        setManifestMode(EDIT_MODE_TYPE.EDIT)
    }

    const renderManifest = () => {
        if (isResourceMissing) {
            return <MessageUI msg={MESSAGING_UI.MANIFEST_NOT_AVAILABLE} size={24} minHeight="100%" />
        } else if (loading) {
            return <MessageUI msg={MESSAGING_UI.FETCHING_MANIFEST} icon={MsgUIType.LOADING} size={24}  minHeight="100%" />
        } else {
            return (
                <div className="h-100 flexbox dc__flex-direction">
                    {manifestMode === EDIT_MODE_TYPE.REVIEW && (
                        <div className="cluster-manifest-header pt-4 pb-4 cn-0 flex">
                            <div className="pl-12 flex dc__content-space">Pod manifest<Close className="icon-dim-16 cursor fcn-0" onClick={switchToEditMode} /></div>
                            <div className="pl-12 flex left">
                                <Pencil className="icon-dim-16 mr-10 scn-0" /> Manifest (Editing)
                            </div>
                        </div>
                    )}
                    <div className="pt-8 pb-8 dc__flex-1 dc__overflow-hidden">
                        <CodeEditor
                            defaultValue={defaultManifest}
                            theme="vs-dark--dt"
                            height="100%"
                            value={manifestValue}
                            mode={MODES.YAML}
                            noParsing
                            onChange={setManifest}
                            readOnly={manifestMode !== EDIT_MODE_TYPE.EDIT && manifestMode !== EDIT_MODE_TYPE.REVIEW}
                            diffView={manifestMode === EDIT_MODE_TYPE.REVIEW}
                        />
                    </div>
                </div>
            )
        }
    }

    return <div className="dc__overflow-hidden h-100">{renderManifest()}</div>
}

export function ManifestPopupMenu({ closePopup, podName, namespace, forceDeletePod }: ManifestPopuptype) {
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
                    >
                        {ManifestMessaging.CANCEL}
                    </button>
                    <button className="cta sso__warn-button btn-confirm" onClick={forceDelete}>
                        {ManifestMessaging.TERMINATE_EXISTING_POD}
                    </button>
                </div>
            </div>
        </VisibleModal2>
    )
}
