import React, { useEffect, useState } from 'react';
import ReactSelect, { components } from 'react-select';
import { multiSelectStyles, Select, sortCallback } from '../../../common';
import { useHistory, useRouteMatch, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { Moment12HourFormat } from '../../../../config';
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg';
import { ReactComponent as LeftIcon } from '../../../../assets/icons/ic-arrow-forward.svg';
interface DeploymentTemplateDiffRes {
    appId: number;
    deployed: boolean;
    deployedBy: number;
    deployedOn: string;
    emailId: string;
    id: string;
    pipelineId: number;
    deploymentStatus: string;
    wfrId: number;
}
interface CompareWithBaseConfig {
    deploymentTemplateDiffRes: DeploymentTemplateDiffRes[];
    selectedDeploymentTemplate: { label: string; value: string; author: string; status: string };
    setSeletedDeploymentTemplate: (selected) => void;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    baseTimeStamp: string;
}

function CompareWithBaseConfig({
    deploymentTemplateDiffRes,
    selectedDeploymentTemplate,
    setSeletedDeploymentTemplate,
    setShowTemplate,
    baseTimeStamp,
}: CompareWithBaseConfig) {
    const { url } = useRouteMatch();
    const history = useHistory();
    const { triggerId } = useParams<{ triggerId: string }>();
    const [baseTemplateTimeStamp, setBaseTemplateTimeStamp] = useState(baseTimeStamp);
    const [baseTemplateId, setBaseTemplateId]= useState<number | string>()

    const deploymentTemplateOption: { label: string; value: string; author: string; status: string }[] =
        deploymentTemplateDiffRes.map((p) => {
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
        let deploymentTemp = deploymentTemplateDiffRes.find((e) => e.id.toString() === selectedTemplateId.toString());
        setSeletedDeploymentTemplate(deploymentTemp);
    };

    useEffect(() => {
        if (deploymentTemplateDiffRes.length > 0 && !baseTimeStamp) {
            const baseTemplate = deploymentTemplateDiffRes.find((e) => e.wfrId.toString() === triggerId);
            setBaseTemplateTimeStamp(baseTemplate?.deployedOn);
            setBaseTemplateId(baseTemplate?.id)
        }
    }, [deploymentTemplateDiffRes, baseTemplateTimeStamp]);

    useEffect(() => {
        if (!selectedDeploymentTemplate && deploymentTemplateOption && deploymentTemplateOption.length > 0) {
            
           let comparedOption =  deploymentTemplateOption.find(dt=> dt.value == baseTemplateId)
        //    console.log(baseTemplateId, comparedOption)
            setSeletedDeploymentTemplate(deploymentTemplateOption[0]);
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
                            styles={{
                                ...multiSelectStyles,
                                menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left', width: '150%' }),
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: 'transparent',
                                    minHeight: '12px',
                                    cursor: 'pointer',
                                    border: 0,
                                    outline: 'none',
                                    boxShadow: 'none',
                                }),
                                singleValue: (base, state) => ({
                                    ...base,
                                    fontWeight: 600,
                                    color: '#06c',
                                    direction: 'rtl',
                                    marginLeft: '2px',
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                    color: 'var(--N900)',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                }),
                                valueContainer: (base, state) => ({
                                    ...base,
                                    height: '20px',
                                    padding: 0,
                                }),
                                indicatorsContainer: (base) => ({
                                    ...base,
                                    // height: '40px',
                                    padding: 0,
                                }),
                                dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
                            }}
                            onChange={onClickTimeStampSelector}
                            options={deploymentTemplateOption}
                            components={{
                                IndicatorSeparator: null,
                                Option: (props) => {
                                    return (
                                        <components.Option {...props}>
                                            <div className="flex left">
                                                {props.isSelected ? (
                                                    <div>
                                                        <Check className="icon-dim-16 scb-5 mr-8" />
                                                    </div>
                                                ) : (
                                                    <div className="inline-block icon-dim-16 mr-8"></div>
                                                )}
                                                <div
                                                    className={`app-summary__icon icon-dim-22 ${props.data.status
                                                        .toLocaleLowerCase()
                                                        .replace(/\s+/g, '')} mr-8`}
                                                ></div>
                                                <div>
                                                    <div> {props.label}</div>
                                                    <div>{props.data.author}</div>
                                                </div>
                                            </div>
                                        </components.Option>
                                    );
                                },
                            }}
                            value={selectedDeploymentTemplate || deploymentTemplateOption[0]}
                        />
                    </div>
                </div>
            </div>
            <div className="pt-12 pb-12 pl-16 pr-16">
                <span className="cn-6">Base configuration</span>
                <div className="cn-9">{moment(baseTemplateTimeStamp).format(Moment12HourFormat)}</div>
            </div>
        </div>
    );
}

export default CompareWithBaseConfig;
