import React, { useMemo, useState } from 'react'

import Tippy from '@tippyjs/react'
import { Link, useHistory } from 'react-router-dom'
import { useAsync, getRandomColor, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'

import { ModuleNameMap, URLS } from '../../../config'
import { processDeployedTime } from '../../common'
import { ReactComponent as VirtualEnvIcon } from '../../../assets/icons/ic-environment-temp.svg'
import { ReactComponent as Database } from '../../../assets/icons/ic-env.svg'
import { ReactComponent as ActivityIcon } from '../../../assets/icons/ic-activity.svg'
import { ReactComponent as ArrowLineDown } from '../../../assets/icons/ic-arrow-line-down.svg'
import { ReactComponent as IconForward } from '../../../assets/icons/ic-arrow-forward.svg'
import AppStatus from '../AppStatus'
import { StatusConstants } from '../list-new/Constants'
import { EMPTY_STATE_STATUS } from '../../../config/constantMessaging'
import { AppMetaInfo, AppOverviewProps } from '../types'
import { getAppOtherEnvironment } from '../../../services/service'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { loadingEnvironmentList } from './constants'

const {
    OVERVIEW: { DEPLOYMENT_TITLE, DEPLOYMENT_SUB_TITLE },
} = EMPTY_STATE_STATUS

export const EnvironmentList = ({
    appId,
    filteredEnvIds,
}: {
    appId: AppMetaInfo['appId']
    filteredEnvIds?: AppOverviewProps['filteredEnvIds']
}) => {
    const history = useHistory()
    const [isLastDeployedExpanded, setIsLastDeployedExpanded] = useState<boolean>(false)
    const lastDeployedClassName = isLastDeployedExpanded ? 'last-deployed-expanded' : ''
    const [otherEnvsLoading, otherEnvsResult] = useAsync(
        () => Promise.all([getAppOtherEnvironment(appId), getModuleInfo(ModuleNameMap.ARGO_CD)]),
        [appId],
    )
    const isArgoInstalled: boolean = otherEnvsResult?.[1]?.result?.status === ModuleStatus.INSTALLED

    const envList = useMemo(() => {
        if (otherEnvsResult?.[0]?.result?.length > 0) {
            const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())
            return (
                otherEnvsResult[0].result
                    .filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                    ?.sort((a, b) => (a.environmentName > b.environmentName ? 1 : -1)) || []
            )
        }
        return otherEnvsLoading ? loadingEnvironmentList : []
    }, [filteredEnvIds, otherEnvsResult])

    const toggleIsLastDeployedExpanded = () => {
        setIsLastDeployedExpanded(!isLastDeployedExpanded)
    }

    const envIcon = (isVirtualCluster) =>
        isVirtualCluster ? <VirtualEnvIcon className="fcb-5 icon-dim-20" /> : <Database className="icon-dim-20" />

    const renderEmptyStateButton = () => (
        <button
            className="flex cta dc__gap-4"
            onClick={() => {
                history.push(`${URLS.APP}/${appId}/${URLS.APP_CONFIG}`)
            }}
        >
            Continue App Configuration <IconForward className="icon-dim-12" />
        </button>
    )

    return (
        <div className="flex column left">
            {envList.length > 0 ? (
                <div
                    className={`env-deployments-info-wrapper ${
                        isArgoInstalled ? 'env-deployments-info-wrapper--argo-installed' : ''
                    } w-100`}
                >
                    <div
                        className={`env-deployments-info-header display-grid dc__align-items-center dc__border-bottom dc__uppercase fs-12 fw-6 cn-7 pr-16 pl-16 ${lastDeployedClassName}`}
                    >
                        <span />
                        {isArgoInstalled && <ActivityIcon className="icon-dim-16" />}
                        <span>Environment</span>
                        <span className={`flex left dc__gap-4 ${lastDeployedClassName}`}>
                            Last deployed
                            <button
                                type="button"
                                className="dc__outline-none-imp p-0 dc__transparent flex"
                                onClick={toggleIsLastDeployedExpanded}
                            >
                                <ArrowLineDown
                                    className="icon-dim-14 scn-5 rotate"
                                    style={{ ['--rotateBy' as any]: isLastDeployedExpanded ? '90deg' : '-90deg' }}
                                />
                            </button>
                        </span>
                        <span>Deployed by</span>
                    </div>

                    <div className="env-deployments-info-body show-shimmer-loading">
                        {envList.map(
                            (_env) =>
                                !_env.deploymentAppDeleteRequest && (
                                    <div
                                        key={`${_env.environmentName}-${_env.environmentId}`}
                                        className={`env-deployments-info-row ${lastDeployedClassName}`}
                                    >
                                        {otherEnvsLoading ? (
                                            <>
                                                <div className="child child-shimmer-loading" />
                                                <div className="child child-shimmer-loading" />
                                                <div className="child child-shimmer-loading" />
                                                <div className="child child-shimmer-loading" />
                                            </>
                                        ) : (
                                            <>
                                                {envIcon(_env.isVirtualEnvironment)}
                                                {isArgoInstalled && (
                                                    <AppStatus
                                                        appStatus={
                                                            _env.lastDeployed
                                                                ? _env.appStatus
                                                                : StatusConstants.NOT_DEPLOYED.noSpaceLower
                                                        }
                                                        isVirtualEnv={_env.isVirtualEnvironment}
                                                        hideStatusMessage
                                                    />
                                                )}
                                                <Link
                                                    to={`${URLS.APP}/${appId}/details/${_env.environmentId}/`}
                                                    className="fs-13 dc__ellipsis-right"
                                                >
                                                    {_env.environmentName}
                                                </Link>
                                                {_env.lastDeployedImage ? (
                                                    <div className="cn-7 flexbox">
                                                        <Tippy
                                                            content={_env.lastDeployedImage}
                                                            className="default-tt"
                                                            placement="auto"
                                                        >
                                                            <div
                                                                className={`bcn-1 br-6 pl-6 pr-6 ${
                                                                    isLastDeployedExpanded
                                                                        ? 'dc__ellipsis-left direction-left'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {isLastDeployedExpanded ? (
                                                                    _env.lastDeployedImage
                                                                ) : (
                                                                    <div className="env-deployments-info-row__last-deployed-cell">
                                                                        <div>...</div>
                                                                        <div className="dc__ellipsis-left direction-left text-overflow-clip">
                                                                            {_env.lastDeployedImage.split(':').at(-1)}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Tippy>
                                                    </div>
                                                ) : (
                                                    <span className="fs-13 cn-6 flex left dc__gap-6">
                                                        <span className="dc__app-summary__icon icon-dim-16 not-deployed not-deployed--node" />
                                                        <span>Not Deployed</span>
                                                    </span>
                                                )}
                                                {_env.lastDeployed && (
                                                    <span className="fs-13 fw-4 cn-9 dc__ellipsis-right dc__word-break flex left dc__gap-6">
                                                        <span className="flex left dc__gap-8">
                                                            <span
                                                                className="icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase"
                                                                style={{
                                                                    backgroundColor: getRandomColor(
                                                                        _env.lastDeployedBy,
                                                                    ),
                                                                }}
                                                            >
                                                                {_env.lastDeployedBy[0]}
                                                            </span>
                                                            <span>{_env.lastDeployedBy}</span>
                                                        </span>
                                                        <Link
                                                            to={`${URLS.APP}/${appId}/${URLS.APP_CD_DETAILS}/${_env.environmentId}`}
                                                        >
                                                            {processDeployedTime(_env.lastDeployed, isArgoInstalled)}
                                                        </Link>
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ),
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-100 mh-500 bcn-0 flex en-2">
                    <GenericEmptyState
                        layout="row"
                        title={DEPLOYMENT_TITLE}
                        subTitle={DEPLOYMENT_SUB_TITLE}
                        isButtonAvailable
                        renderButton={renderEmptyStateButton}
                        contentClassName="empty-state-content"
                    />
                </div>
            )}
        </div>
    )
}
