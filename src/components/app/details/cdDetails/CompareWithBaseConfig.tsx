import React, { useEffect, useState } from 'react';
import ReactSelect, { components } from 'react-select';
import { useHistory, useRouteMatch, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { Moment12HourFormat } from '../../../../config';
import { ReactComponent as LeftIcon } from '../../../../assets/icons/ic-arrow-forward.svg';
import {CompareWithBaseConfiguration} from './cd.type'
import {Option, styles} from './cd.utils';

function CompareWithBaseConfig({
    deploymentTemplatesConfiguration,
    selectedDeploymentTemplate,
    setSeletedDeploymentTemplate,
    setShowTemplate,
    baseTemplateId,
    setBaseTemplateId
}: CompareWithBaseConfiguration) {

    const { url } = useRouteMatch();
    const history = useHistory();
    const { triggerId } = useParams<{ triggerId: string }>();
    const [baseTemplateTimeStamp, setBaseTemplateTimeStamp] = useState<string>('');
    const [comaparedTemplateId, setComparedTemplateId] = useState<number>();

    const deploymentTemplateOption: { label: string; value: string; author: string; status: string }[] =
        deploymentTemplatesConfiguration.map((p) => {
            return {
                value: String(p.id),
                label: moment(p.deployedOn).format(Moment12HourFormat),
                author: p.emailId,
                status: p.deploymentStatus,
            };
        });
    const onClickTimeStampSelector = (selected: { label: string; value: string }) => {
        handleSelector(selected.value);
        setSeletedDeploymentTemplate(selected);
    };

    const handleSelector = (selectedTemplateId) => {
        let deploymentTemp = deploymentTemplatesConfiguration.find((e) => e.id.toString() === selectedTemplateId.toString());
        setSeletedDeploymentTemplate(deploymentTemp);
    };

    useEffect(() => {
        if (deploymentTemplatesConfiguration.length > 0) {
            const baseTemplate = deploymentTemplatesConfiguration.find((e) => e.wfrId.toString() === triggerId);
            setBaseTemplateTimeStamp(baseTemplate?.deployedOn);
            setBaseTemplateId(baseTemplate?.id);
        }
    }, [deploymentTemplatesConfiguration, baseTemplateTimeStamp]);

    useEffect(() => {
        if (
            !selectedDeploymentTemplate &&
            deploymentTemplateOption &&
            deploymentTemplateOption.length > 0 &&
            baseTemplateId
        ) {
            deploymentTemplateOption.map((dt, key) => {
                if (dt.value == baseTemplateId) {
                    setComparedTemplateId(key);
                }
                setSeletedDeploymentTemplate(deploymentTemplateOption[comaparedTemplateId + 1]);
            });
        }
    }, [deploymentTemplateOption]);

    return (
        <div className="border-bottom pl-20 pr-20 flex left bcn-0">
            <div className="border-right flex">
                <NavLink
                    to={`${url.split('/configuration')[0]}/configuration`}
                    onClick={(e) => {
                        e.preventDefault();
                        setShowTemplate(false);
                        history.push(`${url.split('/configuration')[0]}/configuration`);
                    }}
                >
                    <LeftIcon className="rotate icon-dim-24 mr-16" style={{ ['--rotateBy' as any]: '180deg' }} />
                </NavLink>
                <div className="pt-12 pb-12 pl-16 border-left pr-16">
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
                                Option: Option
                            }}
                            value={selectedDeploymentTemplate || deploymentTemplateOption[0]}
                        />
                    </div>
                </div>
            </div>
            <div className="pt-12 pb-12 pl-16 pr-16">
                <span className="cn-6">Base configuration</span>
                <div className="cn-9">{baseTemplateTimeStamp && moment(baseTemplateTimeStamp).format(Moment12HourFormat)}</div>
            </div>
        </div>
    );
}

export default CompareWithBaseConfig;
