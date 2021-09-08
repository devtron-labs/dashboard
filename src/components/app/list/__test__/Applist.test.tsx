import '@testing-library/jest-dom/extend-expect'
import React from 'react';
import renderer from 'react-test-renderer';
import ExternalListContainer from '../ExternalListContainer';
import AppListContainer from '../AppListContainer';
import { Filter } from '../../../common';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

it('applist renders without crashing', () => {
    const appList = renderer.create(
        <BrowserRouter>
            <AppListContainer />
        </BrowserRouter>
    ).toJSON();
    expect(appList).toMatchSnapshot();
});

it("render app list", () => {
    render(<BrowserRouter>
        <AppListContainer />
    </BrowserRouter>);
    expect(screen.getByTestId("applist-loading")).toBeInTheDocument();
});

it('render filter successfull', () => {
    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <Filter list={[{ key: 1, label: 'devtron', isSaved: false, isChecked: false }]}
            labelKey="label"
            buttonText="Environment: "
            searchable multi
            placeholder="Search Environment"
            type={"status"}
            applyFilter={mockApplyFilter}
        />
    );
    let btn = queryByTestId('apply-filter-status')
    fireEvent.click(btn)
    expect(mockApplyFilter).toHaveBeenCalled()
})


it('render app list successfull: apply filter env', () => {
    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <BrowserRouter>
            <AppListContainer />
        </BrowserRouter>
    );
    let btn = queryByTestId('apply-filter-env')
    fireEvent.click(btn)
    expect(mockApplyFilter).toHaveBeenCalled()
})


it('render app list successfull: apply filter status', () => {
    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <BrowserRouter>
            <AppListContainer />
        </BrowserRouter>
    );
    let btn = queryByTestId('apply-filter-status')
    fireEvent.click(btn)
    expect(mockApplyFilter).toHaveBeenCalled()
})