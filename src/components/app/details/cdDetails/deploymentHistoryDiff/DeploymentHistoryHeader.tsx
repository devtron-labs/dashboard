import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { useHistory, useRouteMatch, useParams } from 'react-router'
import { NavLink } from 'react-router-dom'
import moment from 'moment'
import { Moment12HourFormat } from '../../../../../config'
import { ReactComponent as LeftIcon } from '../../../../../assets/icons/ic-arrow-forward.svg'
import { CompareWithBaseConfiguration, DeploymentTemplateList, DeploymentTemplateOptions, HistoryDiffSelectorList } from '../cd.type'
import { Option, styles } from '../cd.utils'
import { getDeploymentDiffSelector, getDeploymentHistoryList } from '../service'

export default function DeploymentHistoryHeader({
    // deploymentTemplatesConfiguration,
    deploymentTemplatesConfigSelector,
    selectedDeploymentTemplate,
    setSelectedDeploymentTemplate,
    setShowTemplate,
    baseTemplateId,
    setBaseTemplateId,
    baseTimeStamp,
}: CompareWithBaseConfiguration) {
    const { url } = useRouteMatch()
    const history = useHistory()
    const { appId, pipelineId, triggerId } = useParams<{ appId: string; pipelineId: string; triggerId: string }>()
    const [baseTemplateTimeStamp, setBaseTemplateTimeStamp] = useState<string>(baseTimeStamp)
    const [comparedTemplateId, setComparedTemplateId] = useState<string>()
    const [baseTemplateconfig, setBaseTemplateConfig] = useState<DeploymentTemplateList[]>()
    const deploymentTemplateOption: DeploymentTemplateOptions[] = deploymentTemplatesConfigSelector.map((p) => {
        return {
            value: String(p.id),
            label: moment(p.deployedOn).format(Moment12HourFormat),
            author: p.deployedBy,
            status: p.deploymentStatus,
        }
    })


    const handleSelector = (selectedTemplateId: string) => {
        let deploymentTemp = deploymentTemplatesConfigSelector.find((e) => e.id.toString() === selectedTemplateId)
        setSelectedDeploymentTemplate(deploymentTemp)
    }

    const onClickTimeStampSelector = (selected: { label: string; value: string }) => {
        handleSelector(selected.value)
        setSelectedDeploymentTemplate(selected)
    }

    useEffect(() => {
        if (deploymentTemplatesConfigSelector.length > 0) {
            const baseTemplate = deploymentTemplatesConfigSelector.find((e) => e.id.toString() === triggerId)
            setBaseTemplateTimeStamp(baseTemplate?.deployedOn)
            setBaseTemplateId(baseTemplate?.id.toString())
            if (!selectedDeploymentTemplate && deploymentTemplateOption?.length > 0 && baseTemplateId) {
                deploymentTemplateOption.map((dt, key) => {
                    if (dt.value === baseTemplate?.id.toString()) {
                        setComparedTemplateId(key.toString())
                        setSelectedDeploymentTemplate(deploymentTemplateOption[key + 1])
                    }
                })
            }
        }
    }, [deploymentTemplatesConfigSelector, baseTemplateTimeStamp])

    const renderGoBacktoConfiguration = () => {
        return (
            <NavLink
                to={``}
                className="flex"
                onClick={(e) => {
                    e.preventDefault()
                    setShowTemplate(false)
                    history.push(`${url.split('/configuration')[0]}/configuration`)
                    setSelectedDeploymentTemplate(deploymentTemplateOption[comparedTemplateId])
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
