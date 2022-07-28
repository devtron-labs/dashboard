import React from 'react';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';
import ReactSelect, { components } from 'react-select';
import { DropdownIndicator, ValueContainer } from './charts.util';
import { Checkbox, Option, multiSelectStyles, } from '../common';
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg';
import { ReactComponent as Grid } from '../../assets/icons/ic-grid-view.svg'
import { ReactComponent as List } from '../../assets/icons/ic-list-view.svg'
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import { QueryParams } from './charts.util';
import { Accordian } from '../common/Accordian/Accordian';

function ChartHeaderFilter({ selectedChartRepo, handleCloseFilter, includeDeprecated, chartRepoList, setSelectedChartRepo, appStoreName, setAppStoreName, searchApplied }) {
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { url } = match

    const handleSelection = (event) => {
        const chartRepoList = selectedChartRepo.filter((e) => e != event)
        setSelectedChartRepo(chartRepoList)
        selectedChartRepo.length === chartRepoList.length
            ? handleFilterChanges([event, ...selectedChartRepo], 'chart-repo')
            : handleFilterChanges(chartRepoList, 'chart-repo')
    }

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
   
    return (<div className="filter-column-container pt-16 pl-12 pr-12">
        <form
            onSubmit={(e) => handleFilterChanges(e, "search")}
            className="search-column position-rel mb-16" >
            <Search className="search__icon icon-dim-18" />
            <input type="text" placeholder="Search charts"
                value={appStoreName}
                className="search__input bcn-0"
                onChange={(event) => { setAppStoreName(event.target.value) }} />
            {searchApplied ? <button className="search__clear-button" type="button" onClick={(e) => handleFilterChanges(e, "clear")}>
                <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
            </button> : null}
        </form>
        <div className='fs-12 fw-6 ml-8'>VIEW AS</div>
        <div>
            <div><Grid className='icon-dim-18 cb-5 mr-12'/>Grid view</div>
            <div></div>
        </div>
        <div className='fs-12 h-36 pt-8 pb-8 fw-6 ml-8'>FILTERS</div>
        <Checkbox rootClassName="cursor bcn-0 ml-10 mr-10 date-align-left--deprecate"
                isChecked={includeDeprecated === 1}
                value={"CHECKED"}
                onChange={(event) => { let value = (includeDeprecated + 1) % 2; handleFilterChanges(value, "deprecated") }}>
                <div className="ml-5"> Show deprecated charts</div>
            </Checkbox>
            <hr className='mt-4 mb-4'/>
            {/* <ReactSelect
                className="date-align-left fs-13"
                placeholder="CATEGORY"
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
                styles={{ ...multiSelectStyles }} /> */}
                <Accordian header={'REPOSITORY'} options={chartRepoList} value={selectedChartRepo} onChange={handleSelection}/>
        </div>
    )
}

export default ChartHeaderFilter
