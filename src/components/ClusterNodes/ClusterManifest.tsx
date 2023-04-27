import React, { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import MessageUI, { MsgUIType } from '../v2/common/message.ui'
import { getClusterManifest } from './clusterNodes.service'
import YAML from 'yaml'
import { MESSAGING_UI, MODES } from '../../config'
import { ClusterManifestType } from './types'
import { EDIT_MODE_TYPE } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/constants'
import { ReactComponent as Pencil } from '../../assets/icons/ic-pencil.svg'

export default function ClusterManifest({ terminalAccessId, manifestMode, setManifestMode, setManifestData }: ClusterManifestType) {
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
                })
                .catch((error) => {
                    setResourceMissing(true)
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            setResourceMissing(true)
            setLoading(false)
        }
    }, [terminalAccessId])

    useEffect(() => {
        if (manifestMode === EDIT_MODE_TYPE.NON_EDIT) {
            setManifest(defaultManifest)
        } else if (manifestMode === EDIT_MODE_TYPE.APPLY) {
            setManifestData(manifestValue)
        }
    }, [manifestMode])

    const renderManifest = () => {
        if (isResourceMissing) {
            return <MessageUI msg={MESSAGING_UI.MANIFEST_NOT_AVAILABLE} size={24} />
        } else if (loading) {
            return <MessageUI msg={MESSAGING_UI.FETCHING_MANIFEST} icon={MsgUIType.LOADING} size={24} />
        } else {
            return (
                <div className="h-100 flexbox dc__flex-direction">
                    {manifestMode === EDIT_MODE_TYPE.REVIEW && (
                        <div className="cluster-manifest-header pt-4 pb-4 cn-0 scn-0 flex">
                            <div className=" pl-12 flex left">Pod manifest</div>
                            <div className="pl-12 flex left">
                                <Pencil className="icon-dim-16 mr-10" /> Manifest (Editing)
                            </div>
                        </div>
                    )}
                    <div className="pt-8 pb-8 dc__flex-1">
                        <CodeEditor
                            defaultValue={defaultManifest}
                            theme="vs-dark--dt"
                            height="100%"
                            value={manifestValue}
                            mode={MODES.YAML}
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
