import React from 'react';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';
import ReactSelect, { components } from 'react-select';
import { DropdownIndicator, ValueContainer } from './charts.util';
import {Checkbox, Option, multiSelectStyles, } from '../common';
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg';

interface ChartHeaderFilterProps {
}


const ChartHeaderFilter = ({selectedChartRepo, handleCloseFilter, handleChartRepoChange, includeDeprecated, handleDeprecateChange, chartRepoList, setSelectedChartRepo, handleAppStoreChange, appStoreName, setAppStoreName}) => {
    const MenuList = (props) => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="chart-list-apply-filter flex bcn-0 pt-10 pb-10">
                    <button type="button" className="cta flex cta--chart-store"
                        disabled={false}
                        onClick={(selected: any) => { handleChartRepoChange(selectedChartRepo) }}
                        >
                            Apply Filter
                            </button>
                </div>
            </components.MenuList>
        );
    };

    return (<><div className="flexbox flex-justify mt-16 ml-20 mr-20">
        <form
            onSubmit={handleAppStoreChange}
            className="search position-rel" >
            <Search className="search__icon icon-dim-18" />
            <input type="text" placeholder="Search charts"
                 value={appStoreName} 
                className="search__input bcn-0"
                onChange={(event) => { setAppStoreName(event.target.value) }} />
            {/* {searchApplied ? <button className="search__clear-button" type="button" onClick={clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button> : null} */}
        </form>
        <div className="flex">
            <ReactSelect
                className="date-align-left fs-13"
                placeholder="Repository : All"
                name="repository "
                value={selectedChartRepo}
                options={chartRepoList}
                closeOnSelect={false}
                onChange={setSelectedChartRepo}
                isClearable={false}
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onMenuClose={handleCloseFilter}
                components={{
                    DropdownIndicator,
                    Option,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList,
                }}
                styles={{ ...multiSelectStyles }} />
            <Checkbox rootClassName="ml-16 mb-0 fs-14 cursor bcn-0 pt-8 pb-8 pr-12 date-align-left--deprecate"
                isChecked={includeDeprecated === 1}
                value={"CHECKED"}
                onChange={(event) =>{ let value = (includeDeprecated + 1) % 2; handleDeprecateChange(value) }
                } 
                >
                <div className="ml-5"> Show deprecated</div>
            </Checkbox>
        </div>
    </div>
    </>)
}
export default ChartHeaderFilter