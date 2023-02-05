import React, { useEffect, useState } from 'react'
import { showError, Progressing, useAsync, sortCallback } from '../common'
import { getClusterListMinWithoutAuth, getDockerRegistryList } from '../../services/service'
import { DOCUMENTATION } from '../../config'
import Reload from '../Reload/Reload'
import { CollapsedList } from './CollapsedList'

export default function Docker({ ...props }) {
    const [loading, result, error, reload] = useAsync(getDockerRegistryList)
    const [clusterOption, setClusterOptions] = useState([])
    const [clusterLoader, setClusterLoader] = useState(false)

    const _getInit = async () => {
        setClusterLoader(true)
        await getClusterListMinWithoutAuth()
            .then((clusterListRes) => {
                if (Array.isArray(clusterListRes.result)) {
                    setClusterOptions([
                        { label: 'All clusters', value: '-1' },
                        ...clusterListRes.result.map((cluster) => {
                            return {
                                label: cluster.cluster_name,
                                value: cluster.id,
                            }
                        }),
                    ])
                }
                setClusterLoader(false)
            })
            .catch((err) => {
                showError(err)
                setClusterLoader(false)
            })
    }

    useEffect(() => {
        _getInit()
    }, [])

    if ((loading && !result) || clusterLoader) return <Progressing pageLoader />
    if (error) {
        showError(error)
        if (!result) return <Reload />
    }
    if (clusterOption.length === 0) {
        return <Reload />
    }

    let dockerRegistryList = result.result || []
    dockerRegistryList = dockerRegistryList.sort((a, b) => sortCallback('id', a, b))
    dockerRegistryList = [{ id: null }].concat(dockerRegistryList)
    return (
        <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
            <h2 className="form__title">Container Registries</h2>
            <p className="form__subtitle">
                Manage your organization’s container registries.&nbsp;
                <a
                    className="dc__link"
                    href={DOCUMENTATION.GLOBAL_CONFIG_DOCKER}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    Learn more
                </a>
            </p>
            {dockerRegistryList.map((docker) => (
                <CollapsedList
                    reload={reload}
                    {...docker}
                    clusterOption={clusterOption}
                    key={docker.id || Math.random().toString(36).substr(2, 5)}
                />
            ))}
        </section>
    )
}
