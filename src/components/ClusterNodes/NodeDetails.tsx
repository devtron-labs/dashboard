import React, { useState, useEffect } from 'react'
import { useRouteMatch } from 'react-router'
import './clusterNodes.scss'
import { Progressing, showError, sortObjectArrayAlphabetically } from '../common'

export default function NodeDetails() {
    const match = useRouteMatch()
    const [loader, setLoader] = useState(false)

    useEffect(() => {}, [])

    if (loader) {
        return <Progressing />
    }

    return <div>Node Details</div>
}
