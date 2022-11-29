import React, { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import MessageUI, { MsgUIType } from '../v2/common/message.ui'
import { getclusterManifest } from './clusterNodes.service'
import YAML from 'yaml'
import { showError } from '../common'

export default function ClusterManifest({ clusterId }) {
    const [manifestValue, setManifest] = useState('')
    const [loading, setLoading] = useState<boolean>()

    useEffect(() => {
        setLoading(true)
        getclusterManifest(clusterId).then((response) => {
            setLoading(false)
            const _manifest = YAML.stringify(response.result?.manifest)
            setManifest(_manifest)
        }).catch((error) => {
            showError(error)
        })
    },[])

    return (
        <CodeEditor
            defaultValue={manifestValue}
            theme="vs-dark--dt"
            height={'100%'}
            loading={loading}
            value={manifestValue}
            mode="yaml"
            readOnly={true}
            customLoader={<MessageUI msg={'Fetching manifest'} icon={MsgUIType.LOADING} size={24} />}
        />
    )
}
