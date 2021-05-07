import React from 'react';
import Select, { components } from 'react-select';
import { ReactComponent as ArrowDown } from '../../../assets/icons/ic-chevron-down.svg';
import { Option, multiSelectStyles } from '../../common';

export const ValueContainer = props => {
    let length = props.getValue().length;
    let count = ''
    if (length === props.options.length) {
        count = 'All'
    }
    else {
        count = length
    }

    const Item = props.selectProps.name === 'cluster' ? 'Cluster' : 'Namespace'

    return (
        <components.ValueContainer  {...props}>
            {length > 0 ?
                <>
                    {!props.selectProps.menuIsOpen &&
                        <> {Item}{length !== 1 ? "s" : ""}: <span className="badge">{count}</span> </>}
                    {React.cloneElement(props.children[1])}
                </>
                : <>{props.children}</>}
        </components.ValueContainer>
    );
};

export const DropdownIndicator = props => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className={`rotate fcn-4`} style={{ ['--rotateBy' as any]: props.selectProps.menuIsOpen ? '180deg' : '0deg', height: '20px', width: '20px' }} />
        </components.DropdownIndicator>
    )
}

export function ExternalFilters({ handleSelectedCluster, handleSelectedNamespace, cluster, namespace, selectedNamespace, setNamespace, selectedCluster, setCluster }) {
    const MenuList = (props) => {
        let name = props.selectProps.name
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="chartListApplyFilter flex bcn-0 pt-10 pb-10">
                    <button type="button" style={{ width: "92%" }} className="cta flex cta--chart-store"
                        disabled={false}
                        onClick={(event) => { name === "cluster" ? handleSelectedCluster(event) : handleSelectedNamespace(event) }}
                    >Apply Filter</button>
                </div>
            </components.MenuList>
        );
    };
    return <>
        <Select className="cn-9 fs-13"
            placeholder="Cluster: All"
            name="cluster"
            options={cluster}
            components={{
                Option,
                MenuList,
                ValueContainer,
                DropdownIndicator,
                IndicatorSeparator: null,
            }}
            onChange={(selected: any) => setCluster(selected)}
            isMulti
            value={selectedCluster}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            isClearable={false}
            styles={multiSelectStyles}
        />
        <Select className="cn-9 fs-14"
            placeholder="Namespace: All"
            options={namespace}
            onChange={(selected: any) => setNamespace(selected)}
            value={selectedNamespace}
            name="namespace"
            components={{
                Option,
                MenuList,
                ValueContainer,
                IndicatorSeparator: null,
                DropdownIndicator,
            }}
            isClearable={false}
            isMulti
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            styles={{ ...multiSelectStyles }}
        />
    </>
}
