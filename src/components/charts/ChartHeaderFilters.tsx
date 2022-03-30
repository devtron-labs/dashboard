import React from 'react';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';
import ReactSelect, { components } from 'react-select';
import { DropdownIndicator, ValueContainer } from './charts.util';
import { Checkbox, Option, multiSelectStyles, } from '../common';
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg';
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import { QueryParams } from './charts.util';

function ChartHeaderFilter({ selectedChartRepo, handleCloseFilter, includeDeprecated, chartRepoList, setSelectedChartRepo, appStoreName, setAppStoreName, searchApplied }) {
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { url } = match

    const MenuList = (props) => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="chart-list-apply-filter flex bcn-0 pt-10 pb-10">
                    <button type="button" className="cta flex cta--chart-store" disabled={false} onClick={(selected: any) => { handleFilterChanges(selectedChartRepo, "chart-repo") }}>Apply Filter</button>
                </div>
            </components.MenuList>
        );
    };

    function handleFilterChanges(selected, key): void {
        const searchParams = new URLSearchParams(location.search);
        const app = searchParams.get(QueryParams.AppStoreName);
        const deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        const chartRepoId = searchParams.get(QueryParams.ChartRepoId);

        if (key == "chart-repo") {
            let chartRepoId = selected?.map((e) => { return e.value }).join(",");
            let qs = `${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            history.push(`${url}?${qs}`)
        };

        if (key == "deprecated") {
            let qs = `${QueryParams.IncludeDeprecated}=${selected}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            history.push(`${url}?${qs}`);
        }

        if (key == "search") {
            selected.preventDefault();
            let qs = `${QueryParams.AppStoreName}=${appStoreName}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            history.push(`${url}?${qs}`);
        }

        if (key == "clear") {
            let qs: string = "";
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            history.push(`${url}?${qs}`);
        }
    }

    return (<div className="flexbox flex-justify mt-16 ml-20 mr-20">
        <form
            onSubmit={(e) => handleFilterChanges(e, "search")}
            className="search position-rel" >
            <Search className="search__icon icon-dim-18" />
            <input type="text" placeholder="Search charts"
                value={appStoreName}
                className="search__input bcn-0"
                onChange={(event) => { setAppStoreName(event.target.value) }} />
            {searchApplied ? <button className="search__clear-button" type="button" onClick={(e) => handleFilterChanges(e, "clear")}>
                <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
            </button> : null}
        </form>
        <div className="flex">
            <ReactSelect
                className="date-align-left fs-13"
                placeholder="Repository : All"
                name="repository"
                value={selectedChartRepo}
                options={chartRepoList}
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
                onChange={(event) => { let value = (includeDeprecated + 1) % 2; handleFilterChanges(value, "deprecated") }}>
                <div className="ml-5"> Show deprecated</div>
            </Checkbox>
        </div>
    </div>
    )
}

export default ChartHeaderFilter
