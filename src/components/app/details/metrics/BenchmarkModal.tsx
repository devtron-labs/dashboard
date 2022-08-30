import React, { Component } from 'react';
import { VisibleModal } from '../../../common';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { ReactComponent as Tip } from '../../../../assets/icons/ic-bulb.svg';
import { renderCategoryTag } from './deploymentMetrics.util';
import { getTimeperiod } from './deploymentMetrics.util';
import ReactGA from 'react-ga4';

export interface BenchmarkModalProps {
    valueLabel: string;
    category: string;
    value: number;
    metric: "DEPLOYMENT_FREQUENCY" | "LEAD_TIME" | "RECOVERY_TIME" | "FAILURE_RATE";
    close: (event) => void;
}

export class BenchmarkModal extends Component<BenchmarkModalProps, {}>{

    constructor(props) {
        super(props);
        this.escFunction = this.escFunction.bind(this);
    }

    getGALabel() {
        switch (this.props.metric) {
            case 'DEPLOYMENT_FREQUENCY': return "Average Deployment Frequency ";
            case 'LEAD_TIME': return "Mean Lead Time ";
            case 'RECOVERY_TIME': return "Mean Time To Recovery ";
            case 'FAILURE_RATE': return "Change Failure Rate ";
            default: return "";
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction);
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Benchmark Modal Opened',
            label: this.getGALabel(),
        });
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction);
    }

    escFunction(event) {
        if (event.keyCode === 27) {
            this.props.close(event);
        }
    }

    getData() {
        if (this.props.metric === "DEPLOYMENT_FREQUENCY") {
            return {
                top: "Tracking how often you do deployments is a good DevOps metric. Ultimately, the goal is to do more smaller deployments as often as possible.",
                metric: "Deployment Frequency",
                elite: <><p>&gt; 1 /day</p> <p>Once per day.</p></>,
                high: <><p>1 - 0.14 /day</p> <p>Once in 1 - 7 days.</p></>,
                medium: <><p> 0.13 - 0.07 /day</p> <p>Once in 7 - 14 days.</p></>,
                low: <><p>&lt; 0.06 /day</p> <p>Once in more than 14 days.</p></>,
                tip: "Reducing the size of deployments makes it easier to test and release."
            }
        }
        else if (this.props.metric === "LEAD_TIME") {
            return {
                top: "Lead time is the time it takes to go from code committed to code successfully running in production. The goal is to have shorter lead times.",
                metric: "Mean Lead Time",
                elite: "< 2 days",
                high: "2 - 7 days",
                medium: "7 - 14 days",
                low: "> 14 days",
                tip: "Break large features into small releasable changes and release them continuously."
            }
        }
        else if (this.props.metric === "RECOVERY_TIME") {
            return {
                top: "This metric helps you track how long it takes to recover from failures. A key metric for the business is keeping failures to a minimum and being able to recover from them quickly.",
                metric: "Mean Time To Recovery",
                elite: "< 1 hr",
                high: "1 - 4 hr",
                medium: "4 - 8 hr",
                low: "> 8 hr",
                tip: "Use BlueGreen with the older version of code running for sometime after switchover to the newer version for faster rollback."
            }
        }
        else {
            return {
                top: "The change failure rate is a measure of how often deployment failures occur in production that require immediate remedy (particularly, rollbacks).",
                metric: "Change Failure Rate",
                elite: "< 15%",
                high: "15 - 30%",
                medium: "30 - 45%",
                low: "> 45%",
                tip: "Release frequently and have adequate test coverage of changed code before deploying on production."
            }
        }
    }

    renderCategoryDescription(value: number) {
        return <span className="ml-5">Once in {getTimeperiod(value)}</span>
    }

    render() {
        const benchmark = this.getData();
        return <VisibleModal className="">
            <div className={`modal__body`} style={{ width: "800px" }}>
                <div className="modal__header modal__header--benchmark">
                    <h1 className="modal__title modal__title--benchmark">{benchmark.metric}</h1>
                    <button type="button" className="transparent" onClick={this.props.close}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <p className="graph-legend__primary-value flex left">{this.props.valueLabel}
                    {this.props.metric === "DEPLOYMENT_FREQUENCY" ? <>&nbsp; &bull; {this.renderCategoryDescription(this.props.value)}</> : null}
                    {renderCategoryTag(this.props.category)}</p>
                <p className="benchmark__description mb-20">{benchmark.top}</p>
                <table className="benchmark-table mb-24">
                    <tbody>
                        <tr className="benchmark-table__row">
                            <th className="benchmark-table__cell">Benchmark</th>
                            <th className="benchmark-table__cell benchmark-table__cell--low">Low</th>
                            <th className="benchmark-table__cell benchmark-table__cell--medium">Medium</th>
                            <th className="benchmark-table__cell benchmark-table__cell--high">High</th>
                            <th className="benchmark-table__cell benchmark-table__cell--elite">Elite</th>
                        </tr>
                        <tr className="benchmark-table__row">
                            <td className="benchmark-table__cell"><b>{benchmark.metric}</b></td>
                            <td className="benchmark-table__cell">{benchmark.low}</td>
                            <td className="benchmark-table__cell">{benchmark.medium}</td>
                            <td className="benchmark-table__cell">{benchmark.high}</td>
                            <td className="benchmark-table__cell">{benchmark.elite}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="pro-tip mb-20">
                    <p className="pro-tip__title m-0"><Tip className="icon-dim-20 vertical vertical-align-middle mr-8" /> Pro Tip</p>
                    <p className="pro-tip__subtitle m-0"> {benchmark.tip}</p>
                </div>
                <button className="cta cancel align-right" onClick={this.props.close}>Close</button>
            </div>
        </VisibleModal>
    }
}