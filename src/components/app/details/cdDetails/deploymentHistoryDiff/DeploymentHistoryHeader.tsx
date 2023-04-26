import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { useHistory, useRouteMatch, useParams } from 'react-router'
import { NavLink } from 'react-router-dom'
import moment from 'moment'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, Moment12HourFormat, URLS } from '../../../../../config'
import { ReactComponent as LeftIcon } from '../../../../../assets/icons/ic-arrow-forward.svg'
import { CompareWithBaseConfiguration, DeploymentHistoryParamsType, DeploymentTemplateOptions } from './types'
import { Option, styles } from './utils'
import { getDeploymentDiffSelector } from '../service'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'

export default function DeploymentHistoryHeader({
    selectedDeploymentTemplate,
    setSelectedDeploymentTemplate,
    setFullScreenView,
    setLoader,
    setPreviousConfigAvailable,
}: CompareWithBaseConfiguration) {
    const { url } = useRouteMatch()
    const history = useHistory()
    const { appId, pipelineId, historyComponent, baseConfigurationId, historyComponentName } =
        useParams<DeploymentHistoryParamsType>()
    const [baseTemplateTimeStamp, setBaseTemplateTimeStamp] = useState<string>('')
    const [deploymentTemplateOption, setDeploymentTemplateOption] = useState<DeploymentTemplateOptions[]>([])

    const onClickTimeStampSelector = (selected: { label: string; value: string }) => {
        setSelectedDeploymentTemplate(selected)
    }

    useEffect(() => {
        if (pipelineId && historyComponent && baseConfigurationId) {
            try {
                setLoader(true)
                getDeploymentDiffSelector(
                    appId,
                    pipelineId,
                    historyComponent,
                    baseConfigurationId,
                    historyComponentName,
                ).then((response) => {
                    const deploymentTemplateOption = []
                    if (response.result) {
                        const resultLen = response.result.length
                        for (let i = 0; i < resultLen; i++) {
                            if (response.result[i].id.toString() === baseConfigurationId) {
                                setBaseTemplateTimeStamp(response.result[i].deployedOn)
                            } else {
                                deploymentTemplateOption.push({
                                    value: String(response.result[i].id),
                                    label: moment(response.result[i].deployedOn).format(Moment12HourFormat),
                                    author: response.result[i].deployedBy,
                                    status: response.result[i].deploymentStatus,
                                })
                            }
                        }
                    }
                    setPreviousConfigAvailable(deploymentTemplateOption.length > 0)
                    setDeploymentTemplateOption(deploymentTemplateOption)
                    setSelectedDeploymentTemplate(
                        deploymentTemplateOption[0] || { label: 'NA', value: 'NA', author: 'NA', status: 'NA' },
                    )
                })
            } catch (err) {
                showError(err)
                setLoader(false)
            }
        }
    }, [historyComponent, baseConfigurationId, historyComponentName])

    const renderGoBackToConfiguration = () => {
        return (
            <NavLink
                data-testid="configuration-back-arrow"
                to={``}
                className="flex"
                onClick={(e) => {
                    e.preventDefault()
                    setFullScreenView(false)
                    history.push(
                        `${url.split(URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS)[0]}${
                            URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS
                        }`,
                    )
                }}
            >
                <LeftIcon className="rotate icon-dim-24 mr-16" style={{ ['--rotateBy' as any]: '180deg' }} />
            </NavLink>
        )
    }

    const renderCompareDeploymentConfig = () => {
        return (
            <div className="pt-12 pb-12 pl-16 compare-history__border-left pr-16">
                <div className="cn-6 lh-1-43 " data-testid="configuration-compare-with-heading">
                    Compare with
                </div>
                <div style={{ minWidth: '200px' }}>
                    {deploymentTemplateOption.length > 0 ? (
                        <ReactSelect
                            placeholder="Select Timestamp"
                            classNamePrefix="configuration-compare-with-dropdown"
                            isSearchable={false}
                            styles={styles}
                            onChange={onClickTimeStampSelector}
                            options={deploymentTemplateOption}
                            components={{
                                IndicatorSeparator: null,
                                Option: Option,
                            }}
                            value={selectedDeploymentTemplate || deploymentTemplateOption[0]}
                        />
                    ) : (
                        <div className="cn-9 fs-13 fw-4">
                            <Tippy
                                className="default-tt left-50"
                                placement="bottom"
                                arrow={false}
                                content={
                                    <span style={{ display: 'block', width: '180px' }}>
                                        {
                                            DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[
                                                historyComponent.replace('-', '_').toUpperCase()
                                            ]?.DISPLAY_NAME
                                        }
                                        {historyComponentName ? ` “${historyComponentName}”` : ''} was added in this
                                        deployment. There is no previous instance to compare with.
                                    </span>
                                }
                            >
                                <span data-testid="deployment-history-configuration-no-options">No options</span>
                            </Tippy>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderBaseDeploymentConfig = () => {
        return (
            <div className="compare-history__border-left pt-12 pb-12 pl-16 pr-16">
                <span className="cn-6" data-testid="configuration-base-configuration-heading">
                    Base configuration
                </span>
                <div className="cn-9 fs-13">
                    {baseTemplateTimeStamp && moment(baseTemplateTimeStamp).format(Moment12HourFormat)}
                </div>
            </div>
        )
    }
    return (
        <div className="dc__border-bottom pl-20 pr-20 flex left bcn-0">
            {renderGoBackToConfiguration()}
            {renderCompareDeploymentConfig()}
            {renderBaseDeploymentConfig()}
        </div>
    )
}
