import React from 'react'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import ReactSelect, { components } from 'react-select';
import { multiSelectStyles, Checkbox, Option } from '../../common';
import { DropdownIndicator, ValueContainer } from '../charts.util';

export default function DeployedChartFilters({ handleFilterQueryChanges, appStoreName, searchApplied, handleCloseFilter, handleAppStoreName, selectedChartRepo, onlyDeprecated, chartRepos, environment, handleSelectedFilters, selectedEnvironment }) {

    function keys(key) {
        if (key == "repository") { handleFilterQueryChanges(selectedChartRepo, "repository") }
        if (key == "environment") { handleFilterQueryChanges(selectedEnvironment, "environment") }
    }

    const MenuList = (props) => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="chart-list-apply-filter flex bcn-0 pt-10 pb-10">
                    <button type="button" className="cta flex cta--chart-store" disabled={false} onClick={() => keys(props.selectProps.name)}>
                        Apply Filter
                  </button>
                </div>
            </components.MenuList>
        );
    };

    return (
        <div>
            <div className="chart-group__header">
                <div className="flexbox flex-justify  w-100">
                    <form onSubmit={(e) => handleFilterQueryChanges(e, "search")} style={{ width: "none" }} className="search position-rel" >
                        <Search className="search__icon icon-dim-18" />
                        <input type="text" placeholder="Search charts" value={appStoreName} className="search__input bcn-0" onChange={(e) => handleAppStoreName(e.target.value)} />
                        {searchApplied ? <button className="search__clear-button" type="button" onClick={(e) => handleFilterQueryChanges(e, "clear")}>
                            <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                        </button> : null}
                    </form>
                    <div className="flex">
                        <ReactSelect className="date-align-left fs-13 pr-16"
                            placeholder="Environment : All"
                            name="environment"
                            value={selectedEnvironment}
                            options={environment}
                            onChange={(e) => handleSelectedFilters(e, "environment")}
                            isClearable={false}
                            isMulti={true}
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            onMenuClose={() => handleCloseFilter("environment")}
                            components={{
                                DropdownIndicator,
                                Option,
                                ValueContainer,
                                IndicatorSeparator: null,
                                ClearIndicator: null,
                                MenuList,
                            }}
                            styles={{ ...multiSelectStyles }} />
                        <ReactSelect className="date-align-left fs-13"
                            placeholder="Repository : All"
                            name="repository"
                            value={selectedChartRepo}
                            options={chartRepos}
                            onChange={(e) => handleSelectedFilters(e, "repository")}
                            isClearable={false}
                            isMulti={true}
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            onMenuClose={() => handleCloseFilter("repository")}
                            components={{
                                DropdownIndicator,
                                Option,
                                ValueContainer,
                                IndicatorSeparator: null,
                                ClearIndicator: null,
                                MenuList,
                            }}
                            styles={{ ...multiSelectStyles }} />
                        <Checkbox rootClassName="ml-16 mb-0 fs-13 cursor bcn-0 pt-8 pb-8 pr-12 date-align-left--deprecate"
                            isChecked={onlyDeprecated == true}
                            value={"CHECKED"}
                            onChange={(e) => {
                                let value =  !onlyDeprecated;
                                handleFilterQueryChanges(value, "deprecated") }} >
                            <div className="ml-5"> Show only deprecated</div>
                        </Checkbox>
                    </div>
                </div>
            </div>
        </div>
    )
}
