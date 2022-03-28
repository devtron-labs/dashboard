import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Drawer } from '../../../../common'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import IndexStore from '../../index.store'
import { AggregatedNodes } from '../../../../app/types'
import { aggregateNodes } from '../../../../app/details/appDetails/utils'
import './environmentStatus.scss'

function AppStatusDetailModal({ close, appStreamData }: { close: () => void; appStreamData: any }) {
    const _appDetails = IndexStore.getAppDetails()

    const nodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(_appDetails.resourceTree.nodes || [], _appDetails.resourceTree.podMetadata || [])
    }, [_appDetails])
    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof close === 'function') {
            evt.preventDefault()
            close()
        }
    }
    const [nodeStatusMap, setNodeStatusMap] = useState(new Map())
    const [showSeeMore, setShowSeeMore] = useState(true)

    useEffect(() => {
        const stats = appStreamData?.result?.application?.status.operationState.syncResult.resources.reduce(
            (agg, curr) => {
                agg.set(`${curr.kind}/${curr.name}`, curr)
                return agg
            },
            new Map(),
        )
        setNodeStatusMap(stats)
    }, [appStreamData])

    function getNodeMessage(kind: string, name: string) {
        if (nodeStatusMap && nodeStatusMap.has(`${kind}/${name}`)) {
            const { status, message } = nodeStatusMap.get(`${kind}/${name}`)
            if (status === 'SyncFailed') return 'Unable to apply changes: ' + message
        }
        return ''
    }

    let message = null
    const conditions = _appDetails.resourceTree.conditions
    const Rollout = nodes?.nodes?.Rollout
    if (
        ['progressing', 'degraded'].includes(_appDetails.resourceTree.status.toLowerCase()) &&
        Array.isArray(conditions) &&
        conditions?.length > 0 &&
        conditions[0].message
    ) {
        message = conditions[0].message
    } else if (Array.isArray(Rollout) && Rollout.length > 0 && Rollout[0].health && Rollout[0].health.message) {
        message = Rollout[0]?.health?.message
    }

    function handleShowMoreButton() {
        setShowSeeMore(!showSeeMore)
    }

    const _hasMoreData = message.length >= 126

    function renderShowMoreButton() {
        return (
            <div onClick={handleShowMoreButton} className="cb-5 fw-6 cursor">
                {showSeeMore ? 'Show More' : 'Show Less'}
            </div>
        )
    }

    const outsideClickHandler = (evt): void => {
        if (
            appStatusDetailRef.current &&
            !appStatusDetailRef.current.contains(evt.target) &&
            typeof close === 'function'
        ) {
            close()
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    return (
        <Drawer position="right" width="50%">
            <div className="app-status-detail-modal bcn-0" ref={appStatusDetailRef}>
                <div className="app-status-detail__header box-shadow pb-12 pt-12 mb-20 bcn-0">
                    <div className="title flex content-space cn-9 fs-16 fw-6 pl-20 pr-20 ">
                        App status detail
                        <span className="cursor" onClick={close}>
                            <Close className="icon-dim-24" />
                        </span>
                    </div>
                    <div>
                        <div
                            className={`subtitle app-summary__status-name fw-6 pl-20 f-${_appDetails.resourceTree.status.toLowerCase()} mr-16`}
                        >
                            {_appDetails.resourceTree.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="app-status-detail__body">
                    {message && (
                        <div
                            className={` ${
                                showSeeMore ? 'app-status__message-wrapper' : ''
                            } bcr-1 cn-9 pt-10 pb-10 pl-20 pr-20`}
                        >
                            <span className="fw-6 ">Message: </span> {message}
                            {_hasMoreData && renderShowMoreButton()}
                        </div>
                    )}
                    <table>
                        <thead>
                            <tr className="border-bottom cn-7">
                                {['name', 'status', 'message'].map((n, index) => (
                                    <th className="pl-20 pt-8 pb-8" key={`header_${index}`}>
                                        {n.toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {nodes &&
                                Object.keys(nodes.nodes)
                                    .filter((kind) => kind.toLowerCase() !== 'rollout')
                                    .map((kind, index) =>
                                        Array.from(nodes.nodes[kind] as Map<string, any>).map(
                                            ([nodeName, nodeDetails]) => (
                                                <tr key={`${nodeDetails.kind}/${nodeDetails.name}`}>
                                                    <td className="pl-20 pt-12 pb-12" valign="top">
                                                        <div className="kind-name">
                                                            <div className="fw-6">{nodeDetails.kind}/</div>
                                                            <div className="ellipsis-left">{nodeDetails.name}</div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        valign="top"
                                                        className={`pl-20 pt-12 pb-12 app-summary__status-name f-${
                                                            nodeDetails.health && nodeDetails.health.status
                                                                ? nodeDetails.health.status.toLowerCase()
                                                                : ''
                                                        }`}
                                                    >
                                                        {nodeDetails.status
                                                            ? nodeDetails.status
                                                            : nodeDetails.health
                                                            ? nodeDetails.health.status
                                                            : ''}
                                                    </td>
                                                    <td valign="top" className="pl-20 pt-12 pb-12">
                                                        <div>
                                                            {getNodeMessage(kind, nodeDetails.name) && (
                                                                <div>{getNodeMessage(kind, nodeDetails.name)}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        ),
                                    )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Drawer>
    )
}

export default AppStatusDetailModal
