import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { useHistory, useRouteMatch, useParams } from 'react-router'
import { NavLink } from 'react-router-dom'
import moment from 'moment'
import { Moment12HourFormat } from '../../../../../config'
import { ReactComponent as LeftIcon } from '../../../../../assets/icons/ic-arrow-forward.svg'
import {
    CompareWithBaseConfiguration,
    DeploymentTemplateList,
    DeploymentTemplateOptions,
    HistoryDiffSelectorList,
} from '../cd.type'
import { Option, styles } from '../cd.utils'
import { getDeploymentDiffSelector } from '../service'
import { showError } from '../../../../common'

export default function DeploymentHistoryHeader({
    selectedDeploymentTemplate,
    setSelectedDeploymentTemplate,
    setShowTemplate,
    setLoader,
}: CompareWithBaseConfiguration) {
    const { url } = useRouteMatch()
    const history = useHistory()
    const { appId, pipelineId, historyComponent, baseConfigurationId, historyComponentName } = useParams<{
        appId: string
        pipelineId: string
        historyComponent: string
        historyComponentName: string
        baseConfigurationId: string
    }>()
    const [baseTemplateTimeStamp, setBaseTemplateTimeStamp] = useState<string>('')
    //const [comparedTemplateId, setComparedTemplateId] = useState<string>()
    const [deploymentTemplateOption, setDeploymentTemplateOption] = useState<DeploymentTemplateOptions[]>([])
    // const [deploymentTemplatesConfigSelector, setDeploymentTemplatesConfigSelector] = useState<
    //     HistoryDiffSelectorList[]
    // >([])
    // const deploymentTemplateOption: DeploymentTemplateOptions[] = deploymentTemplatesConfigSelector.map((p) => {
    //     return {
    //         value: String(p.id),
    //         label: moment(p.deployedOn).format(Moment12HourFormat),
    //         author: p.deployedBy,
    //         status: p.deploymentStatus,
    //     }
    // })

    // const handleSelector = (selectedTemplateId: string) => {
    //     let deploymentTemp = deploymentTemplatesConfigSelector.find((e) => e.id.toString() === selectedTemplateId)
    //     setSelectedDeploymentTemplate(
    //         deploymentTemplatesConfigSelector.find((e) => e.id.toString() === selectedTemplateId),
    //     )
    // }

    const onClickTimeStampSelector = (selected: { label: string; value: string }) => {
        //setSelectedDeploymentTemplate(deploymentTemplatesConfigSelector.find((e) => e.id.toString() === selected.value))
        setSelectedDeploymentTemplate(selected)
    }

    useEffect(() => {
        setLoader(true)
        if (pipelineId) {
            try {
                // getDeploymentTemplateDiff(appId, pipelineId).then((response) => {
                //     setDeploymentTemplatesConfiguration(response.result?.sort((a, b) => sortCallback('id', b, a)))
                //     setLoader(false)
                // })
                getDeploymentDiffSelector(
                    appId,
                    pipelineId,
                    historyComponent,
                    baseConfigurationId,
                    historyComponentName,
                ).then((response) => {
                    if (response.result) {
                        //setDeploymentTemplatesConfigSelector(response.result)
                        let deploymentTemplateOption = []
                        const resultLen = response.result.length
                        for (let i = 0; i < resultLen; i++) {
                            if (response.result[i].id.toString() === baseConfigurationId) {
                                setBaseTemplateTimeStamp(response.result[i].deployedOn)
                                //setBaseTemplateId(response.result[i].id.toString())
                            } else {
                                deploymentTemplateOption.push({
                                    value: String(response.result[i].id),
                                    label: moment(response.result[i].deployedOn).format(Moment12HourFormat),
                                    author: response.result[i].deployedBy,
                                    status: response.result[i].deploymentStatus,
                                })
                            }
                        }
                        setDeploymentTemplateOption(deploymentTemplateOption)
                        setSelectedDeploymentTemplate(deploymentTemplateOption[0])
                        // deploymentTemplateOption = response.result.map((p) => {
                        //     return {
                        //         value: String(p.id),
                        //         label: moment(p.deployedOn).format(Moment12HourFormat),
                        //         author: p.deployedBy,
                        //         status: p.deploymentStatus,
                        //     }
                        // })
                    }
                    setLoader(false)
                })
            } catch (err) {
                showError(err)
                setLoader(false)
            }
        }
    }, [historyComponent, baseConfigurationId, historyComponentName])

    // useEffect(() => {
    //     if (deploymentTemplatesConfigSelector.length > 0) {
    //         // const baseTemplate = deploymentTemplatesConfigSelector.find((e) => e.id.toString() === baseConfigurationId)
    //         // setBaseTemplateTimeStamp(baseTemplate?.deployedOn)
    //         // setBaseTemplateId(baseTemplate?.id.toString())
    //         if (!selectedDeploymentTemplate && deploymentTemplateOption?.length > 0 && baseTemplateId) {
    //             deploymentTemplateOption.map((dt, key) => {
    //                 if (dt.value === baseTemplate?.id.toString()) {
    //                     setComparedTemplateId(key.toString())
    //                     setSelectedDeploymentTemplate(deploymentTemplateOption[key + 1])
    //                 }
    //             })
    //         }
    //     }
    // }, [deploymentTemplatesConfigSelector])

    const renderGoBacktoConfiguration = () => {
        return (
            <NavLink
                to={``}
                className="flex"
                onClick={(e) => {
                    e.preventDefault()
                    setShowTemplate(false)
                    history.push(`${url.split('/configuration')[0]}/configuration`)
                    //setSelectedDeploymentTemplate(deploymentTemplateOption[comparedTemplateId])
                }}
            >
                <LeftIcon className="rotate icon-dim-24 mr-16" style={{ ['--rotateBy' as any]: '180deg' }} />
            </NavLink>
        )
    }

    const renderCompareDeploymentConfig = () => {
        return (
            <div className="pt-12 pb-12 pl-16 compare-history__border-left pr-16">
                <div className="cn-6 lh-1-43 ">Compare with</div>
                <div style={{ minWidth: '200px' }}>
                    <ReactSelect
                        placeholder="Select Timestamp"
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
                </div>
            </div>
        )
    }

    const renderBaseDeploymentConfig = () => {
        return (
            <div className="compare-history__border-left pt-12 pb-12 pl-16 pr-16">
                <span className="cn-6">Base configuration</span>
                <div className="cn-9 fs-13">
                    {baseTemplateTimeStamp && moment(baseTemplateTimeStamp).format(Moment12HourFormat)}
                </div>
            </div>
        )
    }
    return (
        <div className="border-bottom pl-20 pr-20 flex left bcn-0">
            {renderGoBacktoConfiguration()}
            {renderCompareDeploymentConfig()}
            {renderBaseDeploymentConfig()}
        </div>
    )
}
