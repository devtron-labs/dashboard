import React, { Component } from 'react';
import './scanVulnerabilities.css';

export interface VulnerabilityType {
    name: string;
    severity: "CRITICAL" | "MODERATE" | "LOW";
    package: string;
    version: string;
    fixedVersion: string;
    policy: string;
    url?: string;
}

interface ScanVulnerabilitiesTableProps {
    vulnerabilities: VulnerabilityType[];
}

export class ScanVulnerabilitiesTable extends Component<ScanVulnerabilitiesTableProps> {

    renderRow(vulnerability) {
        return <tr className="security-tab__table-row cursor" onClick={(e) => {
            window.open(`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vulnerability.name}`, '_blank');
        }}>
            <td className="security-tab__cell-cve cve-cell">
                <a href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vulnerability.name}`} rel="noopener noreferrer" target="_blank">
                    {vulnerability.name}
                </a>
            </td>
            <td className="security-tab__cell-severity">
                <span className={`fill-${vulnerability.severity?.toLowerCase()}`}>
                    {vulnerability.severity}
                </span>
            </td>
            <td className="security-tab__cell-package">{vulnerability.package}</td>
            <td className="security-tab__cell-current-ver">{vulnerability.version}</td>
            <td className="security-tab__cell-fixed-ver">{vulnerability.fixedVersion}</td>
            <td className={`security-tab__cell-policy security-tab__cell-policy--${vulnerability.policy?.toLowerCase()}`}>
                {vulnerability.policy?.toLowerCase()}
            </td>
        </tr>
    }

    render() {
        return <table className="security-tab__table">
            <tbody>
                <tr className="security-tab__table-header">
                    <th className="security-cell-header security-tab__cell-cve">CVE</th>
                    <th className="security-cell-header security-tab__cell-severity">Severity</th>
                    <th className="security-cell-header security-tab__cell-package">Package</th>
                    <th className="security-cell-header security-tab__cell-current-ver">Current Version</th>
                    <th className="security-cell-header security-tab__cell-fixed-ver">Fixed In Version</th>
                    <th className="security-cell-header security-tab__cell-policy">Policy</th>
                </tr>
                {this.props.vulnerabilities.map((vulnerability) => {
                    return this.renderRow(vulnerability)
                })}
            </tbody>
        </table>
    }
}