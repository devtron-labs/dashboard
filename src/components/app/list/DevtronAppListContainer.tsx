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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import DOMPurify from 'dompurify'
import moment from 'moment'

import {
    AppStatus,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ClipboardButton,
    ComponentSizeType,
    DATE_TIME_FORMATS,
    FiltersTypeEnum,
    GenericFilterEmptyState,
    handleUTCTime,
    highlightSearchText,
    Icon,
    PaginationEnum,
    statusColor,
    Table,
    TableCellComponentProps,
    TableRowActionsOnHoverComponentProps,
    TableSignalEnum,
    Tooltip,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as PlayMedia } from '@Icons/ic-play-outline.svg'
import ContentCard from '@Components/common/ContentCard/ContentCard'
import { CardLinkIconPlacement } from '@Components/common/ContentCard/ContentCard.types'
import { HELM_GUIDED_CONTENT_CARDS_TEXTS } from '@Components/onboardingGuide/OnboardingGuide.constants'

import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
// TODO: add info tippy support in column header cell
import DeployCICD from '../../../assets/img/guide-onboard.png'
import NodeAppThumbnail from '../../../assets/img/node-app-thumbnail.png'
import { DEVTRON_NODE_DEPLOY_VIDEO, Routes, URLS } from '../../../config'
import { AppListSortableKeys } from '../list-new/AppListType'
import { APP_LIST_HEADERS } from '../list-new/Constants'
import { getAppList } from '../service'
import { appListModal, getDevtronAppListPayload } from './appList.modal'
import { App, DevtronAppListProps, Environment, TableAdditionalPropsType } from './types'

import './list.scss'

const EnvironmentCellComponent = ({
    row: { data },
    isExpandedRow,
    isRowInExpandState,
}: TableCellComponentProps<App | Environment, FiltersTypeEnum.URL>) => {
    if (isExpandedRow) {
        return <div className="flex left">{(data as Environment).name}</div>
    }

    const app = data as App
    const envCount = app.environments.length
    const isEnvConfigured = app.defaultEnv.name

    if (!envCount || isRowInExpandState) {
        return null
    }

    return (
        <div className="flex left dc__gap-8">
            <span
                data-testid={`${app.defaultEnv.name}-environment`}
                className={`dc__truncate cn-9 ${isEnvConfigured ? '' : 'cn5'}`}
            >
                {isEnvConfigured ? app.defaultEnv.name : 'Not configured'}
            </span>

            {envCount > 1 ? (
                <button
                    type="button"
                    className="dc__no-border dc__outline-none dc__transparent fw-5 dc__link cn-4 p-0 m-0 dc__underline-onhover fs-12 lh-18 dc__truncate-text mw-18"
                >
                    +{envCount - 1} more
                </button>
            ) : null}
        </div>
    )
}

export const NameCellComponent = ({
    signals,
    row: { id, data },
    filterConfig: { searchKey: searchText },
    redirectToAppDetails,
    isExpandedRow,
}: TableCellComponentProps<App | Environment, FiltersTypeEnum.URL, TableAdditionalPropsType>) => {
    const nameButtonRef = useRef<HTMLButtonElement>(null)
    const { push } = useHistory()

    useEffect(() => {
        const handleEnterPressed = ({ detail: { activeRowData } }) => {
            if (activeRowData.id === id) {
                nameButtonRef.current?.click()
            }
        }

        signals.addEventListener(TableSignalEnum.ENTER_PRESSED, handleEnterPressed)

        return () => {
            signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, handleEnterPressed)
        }
    }, [])

    if (isExpandedRow) {
        const color = statusColor[(data as Environment).appStatus.toLowerCase()] || 'var(--N500)'

        return (
            <div className="flex left dc__overflow-hidden">
                <svg className="app-status" preserveAspectRatio="none" viewBox="0 0 200 40">
                    <line x1="0" y1="20" x2="100%" y2="20" stroke={color} strokeWidth="1" />
                    <line x1="0" y1="15" x2="0" y2="25" stroke={color} strokeWidth="1" />
                </svg>
            </div>
        )
    }

    const app = data as App

    const { name } = app

    const onClick = () => {
        push(redirectToAppDetails(app, app.defaultEnv.id))
    }

    return (
        <div className="flex left dc__gap-4 dc__visible-hover dc__visible-hover--parent">
            <Tooltip content={name}>
                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                <button
                    type="button"
                    className="dc__unset-button-styles dc__align-left dc__truncate"
                    onClick={onClick}
                    ref={nameButtonRef}
                >
                    <span
                        className="dc__link cursor"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                                highlightSearchText({
                                    searchText,
                                    text: String(name),
                                    highlightClasses: 'p-0 fw-6 bcy-2',
                                }),
                            ),
                        }}
                    />
                </button>
            </Tooltip>
            <ClipboardButton content={String(name)} rootClassName="p-2 dc__visible-hover--child" iconSize={16} />
        </div>
    )
}

const CellComponent = ({
    field,
    row: { data },
    isExpandedRow,
    isRowInExpandState,
}: TableCellComponentProps<App | Environment, FiltersTypeEnum.URL>) => {
    if (isRowInExpandState) {
        return null
    }

    const app = data as App
    const env = data as Environment

    if (field === APP_LIST_HEADERS.AppStatus) {
        return (
            <div className="flex left" data-testid="devtron-app-status">
                <AppStatus
                    status={isExpandedRow ? env.status : app.defaultEnv.appStatus}
                    isVirtualEnv={isExpandedRow ? env.isVirtualEnvironment : app.defaultEnv.isVirtualEnvironment}
                />
            </div>
        )
    }

    if (field === APP_LIST_HEADERS.Cluster) {
        const clusterName = isExpandedRow ? env.clusterName : app.defaultEnv?.clusterName ?? ''

        return (
            <div className="flex left">
                <p data-testid={`${clusterName}-cluster`} className="dc__truncate-text  m-0">
                    {clusterName}
                </p>
            </div>
        )
    }

    if (field === APP_LIST_HEADERS.Namespace) {
        const namespace = isExpandedRow ? env.namespace : app.defaultEnv?.namespace ?? ''
        return (
            <div className="flex left">
                <p data-testid={`${namespace}-namespace`} className="dc__truncate-text  m-0">
                    {namespace}
                </p>
            </div>
        )
    }

    if (field === AppListSortableKeys.LAST_DEPLOYED) {
        const lastDeployedTime = isExpandedRow ? env.lastDeployedTime : app.defaultEnv.lastDeployedTime

        return (
            <div className="flex left">
                {lastDeployedTime && (
                    <Tippy
                        className="default-tt"
                        arrow
                        placement="top"
                        content={moment(lastDeployedTime).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}
                    >
                        <p className="dc__truncate-text  m-0" data-testid="last-deployed-time">
                            {handleUTCTime(lastDeployedTime, true)}
                        </p>
                    </Tippy>
                )}
            </div>
        )
    }

    return null
}

const HoverComponent = ({ row: { data } }: TableRowActionsOnHoverComponentProps<App>) => {
    const { push } = useHistory()
    const app = data as App

    const handleEditAppClick = () => {
        const url = `${URLS.APPLICATION_MANAGEMENT_APP}/${app.id}/${Routes.EDIT}`
        push(url)
    }

    return (
        <div className="flex right pr-6 py-2">
            <Button
                dataTestId="edit-app-button"
                icon={<Icon name="ic-gear" color={null} />}
                ariaLabel="redirect-to-app-config"
                showAriaLabelInTippy={false}
                onClick={handleEditAppClick}
                style={ButtonStyleType.neutral}
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.xs}
            />
        </div>
    )
}

const DevtronAppList = ({
    filterConfig,
    environmentList,
    namespaceList,
    syncListData,
    updateDataSyncing,
    setCurrentAppName,
    clearAllFilters,
    isArgoInstalled,
    setAppCount,
}: DevtronAppListProps) => {
    const [noRows, setNoRows] = useState<boolean>(false)

    const { searchKey, appStatus, project, environment, namespace, cluster } = filterConfig

    const isSearchOrFilterApplied =
        searchKey || appStatus.length || project.length || environment.length || namespace.length || cluster.length

    const redirectToAppDetails = (app, envId: number): string => {
        setCurrentAppName(app.name)

        if (envId) {
            return `${URLS.APPLICATION_MANAGEMENT_APP}/${app.id}/details/${envId}`
        }
        return `${URLS.APPLICATION_MANAGEMENT_APP}/${app.id}/trigger`
    }

    const renderGuidedCards = () => (
        <div className="devtron-app-guided-cards-container">
            <h2 className="fs-24 fw-6 lh-32 m-0 pt-40 dc__align-center">Create your first application</h2>
            <div className="devtron-app-guided-cards-wrapper">
                <ContentCard
                    datatestid="deploy-basic-k8snode"
                    redirectTo={DEVTRON_NODE_DEPLOY_VIDEO}
                    isExternalRedirect
                    imgSrc={NodeAppThumbnail}
                    title={HELM_GUIDED_CONTENT_CARDS_TEXTS.WatchVideo.title}
                    linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.WatchVideo.linkText}
                    LinkIcon={PlayMedia}
                    linkIconClass="scb-5 mr-8"
                    linkIconPlacement={CardLinkIconPlacement.BeforeLink}
                />
                <ContentCard
                    datatestid="create-application"
                    redirectTo={CommonURLS.APPLICATION_MANAGEMENT_CREATE_DEVTRON_APP}
                    rootClassName="ev-5"
                    imgSrc={DeployCICD}
                    title={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.title}
                    linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.createLintText}
                    LinkIcon={ArrowRight}
                    linkIconClass="scb-5"
                    linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                />
            </div>
        </div>
    )

    const columns = useMemo(
        () => [
            {
                field: AppListSortableKeys.APP_NAME,
                label: APP_LIST_HEADERS.AppName,
                size: {
                    fixed: 220,
                },
                CellComponent: NameCellComponent,
                isSortable: true,
            },
            ...(isArgoInstalled
                ? [
                      {
                          field: APP_LIST_HEADERS.AppStatus,
                          label: APP_LIST_HEADERS.AppStatus,
                          size: {
                              fixed: 160,
                          },
                          CellComponent,
                      },
                  ]
                : []),
            {
                field: APP_LIST_HEADERS.Environment,
                label: APP_LIST_HEADERS.Environment,
                size: {
                    fixed: 180,
                },
                CellComponent: EnvironmentCellComponent,
                infoTooltipText: 'Environment is a unique combination of cluster and namespace',
            },
            {
                field: APP_LIST_HEADERS.Cluster,
                label: APP_LIST_HEADERS.Cluster,
                size: {
                    fixed: 160,
                },
                CellComponent,
            },
            {
                field: APP_LIST_HEADERS.Namespace,
                label: APP_LIST_HEADERS.Namespace,
                size: {
                    fixed: 160,
                },
                CellComponent,
            },
            {
                field: AppListSortableKeys.LAST_DEPLOYED,
                label: APP_LIST_HEADERS.LastDeployedAt,
                size: {
                    fixed: 220,
                },
                CellComponent,
                isSortable: true,
            },
        ],
        [isArgoInstalled],
    )

    const getRows = useCallback(
        async (_, signal) => {
            updateDataSyncing(true)
            const data = await getAppList(getDevtronAppListPayload(filterConfig, environmentList, namespaceList), {
                signal,
            })
            updateDataSyncing(false)

            const parsedData = data?.result?.appContainers ? appListModal(data.result.appContainers) : []
            const totalCount = data?.result?.appCount ?? 0
            setNoRows(totalCount === 0)
            setAppCount(totalCount)

            return {
                rows: parsedData.map((app) => ({
                    data: app,
                    id: String(app.id),
                    expandableRows:
                        app.defaultEnv.name && app.environments.length
                            ? app.environments.map((env) => ({
                                  id: `expanded-row-${app.id}-${env.id}`,
                                  data: env,
                              }))
                            : null,
                })),
                totalRows: totalCount,
            }
        },
        [syncListData, filterConfig],
    )

    if (isSearchOrFilterApplied && noRows) {
        return <GenericFilterEmptyState handleClearFilters={clearAllFilters} />
    }

    if (noRows) {
        return renderGuidedCards()
    }

    return (
        <Table<App, FiltersTypeEnum.URL, TableAdditionalPropsType>
            key={JSON.stringify({ syncListData, filterConfig })}
            id="table__devtron-app-list"
            getRows={getRows}
            paginationVariant={PaginationEnum.PAGINATED}
            filtersVariant={FiltersTypeEnum.URL}
            columns={columns}
            rowActionOnHoverConfig={{
                width: 42,
                Component: HoverComponent,
            }}
            additionalProps={{
                filterConfig,
                redirectToAppDetails,
            }}
            additionalFilterProps={{
                initialSortKey: AppListSortableKeys.APP_NAME,
            }}
            emptyStateConfig={{
                // empty state is handled externally
                noRowsConfig: null,
            }}
            clearFilters={clearAllFilters}
            filter={null}
            rowStartIconConfig={{
                name: 'ic-devtron',
                color: 'B500',
                size: 18,
            }}
        />
    )
}

export default DevtronAppList
