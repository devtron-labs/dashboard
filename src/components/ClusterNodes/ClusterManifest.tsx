import React, { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import MessageUI, { MsgUIType } from '../v2/common/message.ui'
import { getClusterManifest } from './clusterNodes.service'
import YAML from 'yaml'
import { MESSAGING_UI, MODES } from '../../config'

export default function ClusterManifest({ terminalAccessId }: { terminalAccessId: number }) {
    const [manifestValue, setManifest] = useState('')
    const [loading, setLoading] = useState<boolean>(true)
    const [isResourceMissing, setResourceMissing] = useState(false)

    useEffect(() => {
        if (terminalAccessId) {
            getClusterManifest(terminalAccessId)
                .then((response) => {
                    setLoading(false)
                    const _manifest = YAML.stringify(response.result?.manifest)
                    setManifest(_manifest)
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

    const renderManifest = () => {
        if (isResourceMissing) {
            return <MessageUI msg={MESSAGING_UI.MANIFEST_NOT_AVAILABLE} size={24} />
        } else if (loading) {
            return <MessageUI msg={MESSAGING_UI.FETCHING_MANIFEST} icon={MsgUIType.LOADING} size={24} />
        } else {
            return (
                manifestValue && (
                    <CodeEditor
                        defaultValue={manifestValue}
                        theme="vs-dark--dt"
                        height="100%"
                        value={manifestValue}
                        mode={MODES.YAML}
                        readOnly={true}
                    />
                )
            )
        }
    }

    return <div className="dc__overflow-hidden h-100">{renderManifest()}</div>
}
