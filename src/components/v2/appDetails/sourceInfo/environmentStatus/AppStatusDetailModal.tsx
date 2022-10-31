import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Drawer } from '../../../../common'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import IndexStore from '../../index.store'
import { AggregatedNodes } from '../../../../app/types'
import { aggregateNodes } from '../../../../app/details/appDetails/utils'
import './environmentStatus.scss'
import { APP_STATUS_CUSTOM_MESSAGES, APP_STATUS_HEADERS } from '../../../../../config'
import { StatusFilterButtonComponent } from '../../k8Resource/StatusFilterButton.component'
import { AppStatusDetailType, NodeStatus } from '../../appDetails.type'

interface NodeStreamMap {
    group: string
    kind: string
    message: string
    name: string
    namespace: string
    status: string
    syncPhase: string
    version: string
}

const STATUS_SORTING_ORDER = {
    [NodeStatus.Missing]: 1,
    [NodeStatus.Degraded]: 2,
    [NodeStatus.Progressing]: 3,
    [NodeStatus.Healthy]: 4,
}

function AppStatusDetailModal({ close, appStreamData, showAppStatusMessage }: AppStatusDetailType) {
    const _appDetails = IndexStore.getAppDetails()

    const nodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(_appDetails.resourceTree?.nodes || [], _appDetails.resourceTree?.podMetadata || [])
    }, [_appDetails])
    const nodesKeyArray = Object.keys(nodes?.nodes || {})
    let flattenedNodes = []
    if (nodesKeyArray.length > 0) {
        for (let index = 0; index < nodesKeyArray.length; index++) {
            const element = nodes.nodes[nodesKeyArray[index]]
            element.forEach((childElement) => {
                childElement.health && flattenedNodes.push(childElement)
            })
        }
        flattenedNodes.sort((a, b) => {
            return (
                STATUS_SORTING_ORDER[a.health.status?.toLowerCase()] -
                STATUS_SORTING_ORDER[b.health.status?.toLowerCase()]
            )
        })
    }
    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof close === 'function') {
            evt.preventDefault()
            close()
        }
    }
    const [nodeStatusMap, setNodeStatusMap] = useState<Map<string, NodeStreamMap>>()
    const [showSeeMore, setShowSeeMore] = useState(true)
    const [currentFilter, setCurrentFilter] = useState('')

    useEffect(() => {
        try {
            const stats = (({
              "result": {
                "type": "MODIFIED",
                "application": {
                  "metadata": {
                    "name": "bluecopa-dcd-gitsensor-bcopa-dcd",
                    "namespace": "devtroncd",
                    "uid": "0bca7666-f262-4ac2-8ba9-3a43bfa326fe",
                    "resourceVersion": "264581424",
                    "generation": 2813,
                    "creationTimestamp": "2022-10-28T16:05:22Z",
                    "managedFields": [{
                        "manager": "Go-http-client",
                        "operation": "Update",
                        "apiVersion": "argoproj.io/v1alpha1",
                        "time": "2022-10-31T08:47:08Z",
                        "fieldsType": "FieldsV1",
                        "fieldsV1": {
                          "f:spec": {
                            ".": {},
                            "f:destination": {
                              ".": {},
                              "f:namespace": {},
                              "f:server": {}
                            },
                            "f:project": {},
                            "f:source": {
                              ".": {},
                              "f:helm": {
                                ".": {},
                                "f:valueFiles": {}
                              },
                              "f:path": {},
                              "f:repoURL": {},
                              "f:targetRevision": {}
                            },
                            "f:syncPolicy": {
                              ".": {},
                              "f:automated": {
                                ".": {},
                                "f:prune": {}
                              },
                              "f:retry": {
                                ".": {},
                                "f:backoff": {
                                  ".": {},
                                  "f:duration": {},
                                  "f:factor": {},
                                  "f:maxDuration": {}
                                },
                                "f:limit": {}
                              }
                            }
                          }
                        }
                      },
                      {
                        "manager": "argocd-application-controller",
                        "operation": "Update",
                        "apiVersion": "argoproj.io/v1alpha1",
                        "time": "2022-10-31T08:47:15Z",
                        "fieldsType": "FieldsV1",
                        "fieldsV1": {
                          "f:status": {
                            ".": {},
                            "f:conditions": {},
                            "f:health": {
                              ".": {},
                              "f:status": {}
                            },
                            "f:operationState": {
                              ".": {},
                              "f:finishedAt": {},
                              "f:message": {},
                              "f:operation": {
                                ".": {},
                                "f:initiatedBy": {
                                  ".": {},
                                  "f:username": {}
                                },
                                "f:retry": {
                                  ".": {},
                                  "f:backoff": {
                                    ".": {},
                                    "f:duration": {},
                                    "f:factor": {},
                                    "f:maxDuration": {}
                                  },
                                  "f:limit": {}
                                },
                                "f:sync": {
                                  ".": {},
                                  "f:revision": {},
                                  "f:syncStrategy": {
                                    ".": {},
                                    "f:hook": {}
                                  }
                                }
                              },
                              "f:phase": {},
                              "f:retryCount": {},
                              "f:startedAt": {},
                              "f:syncResult": {
                                ".": {},
                                "f:resources": {},
                                "f:revision": {},
                                "f:source": {
                                  ".": {},
                                  "f:helm": {
                                    ".": {},
                                    "f:valueFiles": {}
                                  },
                                  "f:path": {},
                                  "f:repoURL": {},
                                  "f:targetRevision": {}
                                }
                              }
                            },
                            "f:reconciledAt": {},
                            "f:resources": {},
                            "f:sourceType": {},
                            "f:summary": {
                              ".": {},
                              "f:images": {}
                            },
                            "f:sync": {
                              ".": {},
                              "f:comparedTo": {
                                ".": {},
                                "f:destination": {
                                  ".": {},
                                  "f:namespace": {},
                                  "f:server": {}
                                },
                                "f:source": {
                                  ".": {},
                                  "f:helm": {
                                    ".": {},
                                    "f:valueFiles": {}
                                  },
                                  "f:path": {},
                                  "f:repoURL": {},
                                  "f:targetRevision": {}
                                }
                              },
                              "f:revision": {},
                              "f:status": {}
                            }
                          }
                        }
                      }
                    ]
                  },
                  "spec": {
                    "source": {
                      "repoURL": "https://gitlab.com/devtron-prod-gitops/bluecopa-dcd-gitsensor.git",
                      "path": "bluecopa-dcd-gitsensor-bcopa-dcd",
                      "targetRevision": "master",
                      "helm": {
                        "valueFiles": [
                          "values.yaml"
                        ]
                      }
                    },
                    "destination": {
                      "server": "https://api-k8s-bluecopa-devtron.devtron.ai",
                      "namespace": "devtroncd"
                    },
                    "project": "default",
                    "syncPolicy": {
                      "automated": {
                        "prune": true
                      },
                      "retry": {
                        "limit": 1,
                        "backoff": {
                          "duration": "5s",
                          "factor": 2,
                          "maxDuration": "5s"
                        }
                      }
                    }
                  },
                  "status": {
                    "resources": [{
                        "version": "v1",
                        "kind": "Service",
                        "namespace": "devtroncd",
                        "name": "git-sensor-service",
                        "status": "Synced",
                        "health": {
                          "status": "Healthy"
                        }
                      },
                      {
                        "group": "apps",
                        "version": "v1",
                        "kind": "StatefulSet",
                        "namespace": "devtroncd",
                        "name": "git-sensor",
                        "status": "Synced",
                        "health": {
                          "status": "Healthy",
                          "message": "partitioned roll out complete: 1 new pods have been updated..."
                        }
                      },
                      {
                        "group": "monitoring.coreos.com",
                        "version": "v1",
                        "kind": "ServiceMonitor",
                        "namespace": "devtroncd",
                        "name": "bluecopa-dcd-gitsensor-bcopa-dcd-sm",
                        "status": "OutOfSync",
                        "health": {
                          "status": "Missing"
                        }
                      }
                    ],
                    "sync": {
                      "status": "OutOfSync",
                      "comparedTo": {
                        "source": {
                          "repoURL": "https://gitlab.com/devtron-prod-gitops/bluecopa-dcd-gitsensor.git",
                          "path": "bluecopa-dcd-gitsensor-bcopa-dcd",
                          "targetRevision": "master",
                          "helm": {
                            "valueFiles": [
                              "values.yaml"
                            ]
                          }
                        },
                        "destination": {
                          "server": "https://api-k8s-bluecopa-devtron.devtron.ai",
                          "namespace": "devtroncd"
                        }
                      },
                      "revision": "d4482964ef6179da5bcd8e2ce6db58411e312e94"
                    },
                    "health": {
                      "status": "Healthy"
                    },
                    "conditions": [{
                      "type": "SyncError",
                      "message": "Failed sync attempt to d4482964ef6179da5bcd8e2ce6db58411e312e94: one or more synchronization tasks are not valid (retried 1 times).",
                      "lastTransitionTime": "2022-10-31T08:47:15Z"
                    }],
                    "reconciledAt": "2022-10-31T08:47:15Z",
                    "operationState": {
                      "operation": {
                        "sync": {
                          "revision": "d4482964ef6179da5bcd8e2ce6db58411e312e94",
                          "syncStrategy": {
                            "hook": {}
                          }
                        },
                        "initiatedBy": {
                          "username": "admin"
                        },
                        "retry": {
                          "limit": 1,
                          "backoff": {
                            "duration": "5s",
                            "factor": 2,
                            "maxDuration": "5s"
                          }
                        }
                      },
                      "phase": "Failed",
                      "message": "one or more synchronization tasks are not valid (retried 1 times).",
                      "syncResult": {
                        "resources": [{
                          "group": "monitoring.coreos.com",
                          "version": "v1",
                          "kind": "ServiceMonitor",
                          "namespace": "devtroncd",
                          "name": "bluecopa-dcd-gitsensor-bcopa-dcd-sm",
                          "status": "SyncFailed",
                          "message": "the server could not find the requested resource",
                          "syncPhase": "Sync"
                        }],
                        "revision": "d4482964ef6179da5bcd8e2ce6db58411e312e94",
                        "source": {
                          "repoURL": "https://gitlab.com/devtron-prod-gitops/bluecopa-dcd-gitsensor.git",
                          "path": "bluecopa-dcd-gitsensor-bcopa-dcd",
                          "targetRevision": "master",
                          "helm": {
                            "valueFiles": [
                              "values.yaml"
                            ]
                          }
                        }
                      },
                      "startedAt": "2022-10-31T08:47:08Z",
                      "finishedAt": "2022-10-31T08:47:15Z",
                      "retryCount": 1
                    },
                    "sourceType": "Helm",
                    "summary": {
                      "images": [
                        "quay.io/devtron/git-sensor:a1e0e0a7-304-11232"
                      ]
                    }
                  }
                }
              }
            }).result.application.status.operationState.syncResult.resources).reduce(
                (agg, curr) => {
                    agg.set(`${curr.kind}/${curr.name}`, curr)
                    return agg
                },
                new Map(),
            )
            setNodeStatusMap(stats)
        } catch (error) {}
    }, [appStreamData])

    function getNodeMessage(kind: string, name: string) {
        if (nodeStatusMap && nodeStatusMap.has(`${kind}/${name}`)) {
            const { message } = nodeStatusMap.get(`${kind}/${name}`)
            return message
        }
        return ''
    }

    let message = ''
    const conditions = _appDetails.resourceTree?.conditions
    const Rollout = nodes?.nodes?.Rollout?.entries()?.next().value[1];
    if (
        ['progressing', 'degraded'].includes(_appDetails.resourceTree.status.toLowerCase()) &&
        Array.isArray(conditions) &&
        conditions.length > 0 &&
        conditions[0].message
    ) {
        message = conditions[0].message
    } else if (Rollout?.health?.message) {
        message = Rollout.health.message
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

    const onFilterClick = (selectedFilter: string): void => {
        if (currentFilter !== selectedFilter.toLowerCase()) {
            setCurrentFilter(selectedFilter.toLowerCase())
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
        <Drawer position="right" width="1024px">
            <div className="app-status-detail-modal bcn-0" ref={appStatusDetailRef}>
                <div className="app-status-detail__header dc__box-shadow pt-12 pr-20 pb-12 pl-20 bcn-0 flex dc__content-space">
                    <div>
                        <div className="title cn-9 fs-16 fw-6 mb-4">App status detail</div>
                        <div
                            className={`subtitle app-summary__status-name fw-6 fs-13 f-${_appDetails.resourceTree.status.toLowerCase()} mr-16`}
                        >
                            {_appDetails.resourceTree.status.toUpperCase()}
                        </div>
                    </div>
                    <span className="cursor" onClick={close}>
                        <Close className="icon-dim-24" />
                    </span>
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
                    {showAppStatusMessage && (
                        <div className="bcn-1 cn-9 pt-10 pb-10 pl-20 pr-20">
                            <span className="fw-6 ">Message: </span>
                            {APP_STATUS_CUSTOM_MESSAGES[_appDetails.resourceTree.status.toUpperCase()]}
                        </div>
                    )}
                    <div className="pt-16 pl-20 pb-8">
                        <div className="flexbox pr-20 w-100">
                            <div>
                                <StatusFilterButtonComponent nodes={flattenedNodes} handleFilterClick={onFilterClick} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="app-status-row dc__border-bottom pt-8 pr-20 pb-8 pl-20">
                            {APP_STATUS_HEADERS.map((headerKey, index) => (
                                <div className="fs-13 fw-6 cn-7" key={`header_${index}`}>
                                    {headerKey}
                                </div>
                            ))}
                        </div>
                        <div className="resource-list fs-13">
                            {flattenedNodes
                                .filter(
                                    (nodeDetails) =>
                                        currentFilter === 'all' ||
                                        nodeDetails.health.status?.toLowerCase() === currentFilter,
                                )
                                .map((nodeDetails) => (
                                    <div
                                        className="app-status-row pt-8 pr-20 pb-8 pl-20"
                                        key={`${nodeDetails.kind}/${nodeDetails.name}`}
                                    >
                                        <div>{nodeDetails.kind}</div>
                                        <div>{nodeDetails.name}</div>
                                        <div
                                            className={`app-summary__status-name f-${
                                                nodeDetails.health.status ? nodeDetails.health.status.toLowerCase() : ''
                                            }`}
                                        >
                                            {nodeDetails.status ? nodeDetails.status : nodeDetails.health.status}
                                        </div>
                                        <div>{getNodeMessage(nodeDetails.kind, nodeDetails.name)}</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default AppStatusDetailModal
