import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import MessageUI, { MsgUIType } from '../v2/common/message.ui'
import { getclusterManifest } from './clusterNodes.service'
import YAML from 'yaml'
import { MODES } from '../../config'

export default function ClusterManifest({ clusterId }) {
    const [manifestValue, setManifest] = useState('')
    const [loading, setLoading] = useState<boolean>()
    const [isResourceMissing, setIsResourceMissing] = useState(false)

    useEffect(() => {
        setLoading(true)
        if (clusterId) {
            getclusterManifest(clusterId)
                .then((response) => {
                    setLoading(false)
                    const _manifest = YAML.stringify(response.result?.manifest)
                    setManifest(_manifest)
                })
                .catch((error) => {
                    setIsResourceMissing(true)
                    setLoading(false)
                })
        } else {
            setIsResourceMissing(true)
            setLoading(false)
        }
    }, [clusterId])

    const renderManifest = () => {
        if (isResourceMissing) {
            return <MessageUI msg="Manifest not available" size={24} />
        } else if (loading) {
            return <MessageUI msg={'Fetching manifest'} icon={MsgUIType.LOADING} size={24} />
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
