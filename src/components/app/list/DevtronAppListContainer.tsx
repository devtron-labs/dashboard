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

import { useState, useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    FiltersTypeEnum,
    GenericFilterEmptyState,
    Icon,
    PaginationEnum,
    Table,
    TableRowActionsOnHoverComponentProps,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as PlayMedia } from '@Icons/ic-play-outline.svg'
import ContentCard from '@Components/common/ContentCard/ContentCard'
import { CardLinkIconPlacement } from '@Components/common/ContentCard/ContentCard.types'
import { HELM_GUIDED_CONTENT_CARDS_TEXTS } from '@Components/onboardingGuide/OnboardingGuide.constants'

import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
import DeployCICD from '../../../assets/img/guide-onboard.png'
import NodeAppThumbnail from '../../../assets/img/node-app-thumbnail.png'
import { DEVTRON_NODE_DEPLOY_VIDEO, Routes, URLS } from '../../../config'
import { AppListSortableKeys } from '../list-new/AppListType'
import { getAppList } from '../service'
import { appListModal, getDevtronAppListPayload } from './appList.modal'
import { App, DevtronAppListProps, Environment, TableAdditionalPropsType } from './types'
import { getTableColumns } from './utils'

import './list.scss'

const HoverComponent = ({ row: { data } }: TableRowActionsOnHoverComponentProps<App | Environment>) => {
    const { push } = useHistory()
    const app = data as App

    const handleEditAppClick = () => {
        const url = `${URLS.APPLICATION_MANAGEMENT_APP}/${app.id}/${Routes.EDIT}`
        push(url)
    }

    return (
        <div className="flex right pr-12 py-2">
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
    clearAllFilters,
    isArgoInstalled,
    setAppCount,
}: DevtronAppListProps) => {
    const [noRows, setNoRows] = useState<boolean>(false)

    const { searchKey, appStatus, project, environment, namespace, cluster } = filterConfig

    const { push } = useHistory()

    const isSearchOrFilterApplied =
        searchKey || appStatus.length || project.length || environment.length || namespace.length || cluster.length

    const redirectToAppDetails = (app, envId: number): string => {
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
                        app.defaultEnv.name && app.environments.length > 1
                            ? app.environments.map((env) => ({
                                  id: `expanded-row-${app.id}-${env.id}`,
                                  data: {
                                      app,
                                      ...env,
                                  },
                              }))
                            : null,
                })),
                totalRows: totalCount,
            }
        },
        [syncListData, filterConfig],
    )

    const onClearFilters = () => {
        setNoRows(false)
        clearAllFilters()
    }

    const onRowClick = ({ data }, isExpandedRow) => {
        if (!isExpandedRow) {
            const app = data as App

            push(redirectToAppDetails(app, app.defaultEnv.id))

            return
        }

        const { app, id } = data as Environment & { app: App }

        push(redirectToAppDetails(app, id))
    }

    const columns = useMemo(() => getTableColumns(isArgoInstalled), [isArgoInstalled])

    if (isSearchOrFilterApplied && noRows) {
        return <GenericFilterEmptyState handleClearFilters={onClearFilters} />
    }

    if (noRows) {
        return renderGuidedCards()
    }

    return (
        <Table<App | Environment, FiltersTypeEnum.URL, TableAdditionalPropsType>
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
            clearFilters={onClearFilters}
            filter={null}
            rowStartIconConfig={{
                name: 'ic-devtron',
                color: 'B500',
                size: 18,
            }}
            onRowClick={onRowClick}
        />
    )
}

export default DevtronAppList
