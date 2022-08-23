import React, { Component } from 'react';
import { ReactComponent as Sort } from '../../../../assets/icons/ic-sort.svg';
import { ReactComponent as SortUp } from '../../../../assets/icons/ic-sort-up.svg';
import { ReactComponent as SortDown } from '../../../../assets/icons/ic-sort-down.svg';
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg';
import { ReactComponent as Help } from '../../../../assets/icons/ic-info-outline.svg';
import { ReactComponent as Fail } from '../../../../assets/icons/ic-error-exclamation.svg';
import { Pagination, Progressing } from '../../../common';
import { ViewType } from '../../../../config';
import ReactGA from 'react-ga4';

export interface DeploymentTableCellType {
    value: number;
    label: string;
}

export interface DeploymentTableRow {
    releaseTime: DeploymentTableCellType;
    leadTime: DeploymentTableCellType;
    cycleTime: DeploymentTableCellType;
    recoveryTime: DeploymentTableCellType;
    deploymentSize: number;
    releaseType: number;
}

export interface DeploymentTableProps {
    deploymentTableView: string;
    rows: DeploymentTableRow[];
}

export class DeploymentTable extends Component<DeploymentTableProps, any>{

    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            sort: {
                rowName: "releaseTime",
                order: "DSC"
            },
            pagination: {
                size: 0,
                offset: 0,
                pageSize: 20,
            }
        }
        this.sort = this.sort.bind(this);
    }

    componentDidMount() {
        this.setState({
            rows: this.props.rows,
            pagination: {
                size: this.props.rows.length,
                offset: 0,
                pageSize: 20
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.rows.length !== this.props.rows.length) {
            this.setState({
                rows: this.props.rows,
                pagination: {
                    size: this.props.rows.length,
                    offset: 0,
                    pageSize: 20
                }
            });
        }
    }

    sort(rowName: string): void {
        let order = this.state.sort.order;
        if (this.state.sort.rowName === rowName) {
            order = order === "ASC" ? "DSC" : "ASC";
        }
        else order = "DSC";
        let newRows = this.state.rows;
        if (rowName === "releaseTime" || rowName === "leadTime" || rowName === "cycleTime" || rowName === "recoveryTime") {
            newRows = newRows.sort((a, b) => {
                if (order === "ASC") {
                    if (a[rowName].value >= b[rowName].value) return 1;
                    else return -1;
                }
                else {
                    if (a[rowName].value <= b[rowName].value) return 1;
                    else return -1;
                }
            })
        }
        else {
            newRows = newRows.sort((a, b) => {
                if (order === "ASC") {
                    if (a.deploymentSize >= b.deploymentSize) return 1;
                    else return -1;
                }
                else {
                    if (a.deploymentSize <= b.deploymentSize) return 1;
                    else return -1;
                }
            })
        }
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Deployment Table Sorting',
            label: this.getGALabel(rowName),
        })
        this.setState({
            rows: newRows,
            sort: {
                rowName: rowName,
                order: order,
            },
            pagination: {
                ...this.state.pagination,
                offse: 0,
            }
        });
    }

    getGALabel(rowName) {
        switch (rowName) {
            case 'releaseTime': return 'Deployed On';
            case 'cycleTime': return 'Cycle Time';
            case 'leadTime': return 'Lead Time';
            case 'recoveryTime': return 'Recovery Time';
            case 'deploymentSize': return 'Deployment Size'
            default: return '';
        }
    }

    changePage = (pageNo: number): void => {
        let offset = this.state.pagination.pageSize * (pageNo - 1);
        this.setState({
            pagination: {
                ...this.state.pagination,
                offset: offset
            }
        })
    }

    changePageSize = (size: number): void => {
        this.setState({
            pagination: {
                size: this.state.pagination.size,
                pageSize: size,
                offset: 0,
            }
        })
    }

    renderPagination() {
        if (this.state.pagination.size > 20) {
            return <Pagination size={this.state.pagination.size}
                pageSize={this.state.pagination.pageSize}
                offset={this.state.pagination.offset}
                changePage={this.changePage}
                changePageSize={this.changePageSize} />
        }
    }

    renderSortIcon(rowName: string) {
        let iconClasses = "icon-dim-20 vertical-align-middle";
        return this.state.sort.rowName === rowName ? this.state.sort.order === "ASC" ? <SortUp className={iconClasses} /> : <SortDown className={iconClasses} /> : <Sort className={iconClasses} />
    }

    renderTableHeader() {
        return <tr className="deployment-table__row">
            <th className="deployment-table__header-cell deployment-table__cell-deployed cursor" onClick={(event) => {
                this.sort("releaseTime")
            }} >Deployed on {this.renderSortIcon("releaseTime")}
            </th>
            <th className="deployment-table__header-cell deployment-table__cell-cycle cursor" onClick={(event) => {
                this.sort("cycleTime")
            }} >Cycle Time {this.renderSortIcon("cycleTime")}
            </th>
            <th className="deployment-table__header-cell deployment-table__cell-lead cursor" onClick={(event) => {
                this.sort("leadTime")
            }} >Lead Time {this.renderSortIcon("leadTime")}
            </th>
            <th className="deployment-table__header-cell deployment-table__cell-size cursor" onClick={(event) => {
                this.sort("deploymentSize")
            }}> Size {this.renderSortIcon("deploymentSize")}
            </th>
            <th className="deployment-table__header-cell deployment-table__cell-recovery cursor" onClick={(event) => {
                this.sort("recoveryTime")
            }}>  Recovery Time {this.renderSortIcon("recoveryTime")}
            </th>
            <th className="deployment-table__header-cell deployment-table__cell-image"></th>
        </tr>
    }

    render() {
        let start = this.state.pagination.offset;
        let end = this.state.pagination.offset + this.state.pagination.pageSize;
        if (start < 0 || start > this.state.pagination.size) start = 0;
        let rows = this.state.rows.slice(start, end);
        if (this.props.deploymentTableView === ViewType.LOADING) {
            return <>
                <table className="deployment-table">
                    <tbody>
                        {this.renderTableHeader()}
                    </tbody>
                </table>
                <div className="deployment-table__empty">
                    <Progressing pageLoader />
                </div>
            </>
        }
        else if (this.props.deploymentTableView === ViewType.FORM && this.state.rows.length === 0) {
            return <>
                <table className="deployment-table">
                    <tbody>
                        {this.renderTableHeader()}
                    </tbody>
                </table>
                <div className="deployment-table__empty">
                    <Help className="icon-dim-32" />
                    <p className="deployment-table__empty-text">No failed Deployments</p>
                </div>
            </>
        }
        else return <>
            <table className="deployment-table">
                <tbody>
                    {this.renderTableHeader()}
                    {rows.map((row, index) => {
                        return <tr key={index + row.releaseTime.value} className="deployment-table__row">
                            <td className="deployment-table__cell-deployed">
                                {row.releaseStatus === 1
                                    ? <Fail className="icon-dim-20 vertical-align-middle mr-10" />
                                    : <Success className="icon-dim-20 vertical-align-middle mr-10" />}
                                {row.releaseTime.label}
                            </td>
                            <td className="deployment-table__cell-cycle">{row.cycleTime.label}</td>
                            <td className="deployment-table__cell-lead">{row.leadTime.label}</td>
                            <td className="deployment-table__cell-size">{`${row.deploymentSize} lines`} </td>
                            <td className="deployment-table__cell-recovery">{row.recoveryTime.label}</td>
                            <td className="deployment-table__cell-image"></td>
                        </tr>
                    })}
                </tbody>
            </table>
            {this.renderPagination()}
        </>
    }
}