import React from 'react';
import { components } from 'react-select';
import { ReactComponent as ArrowDown } from '../../../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Smiley } from '../../../../assets/icons/ic-smiley-party.svg';
import { ReactComponent as Check } from '../../../../assets/icons/ic-check.svg';
import { ReactComponent as Help } from '../../../../assets/icons/ic-help-outline.svg';
import { createTimestamp } from './deploymentMetrics.service';
import Tippy from '@tippyjs/react';

export const styles = {
  control: (base, state) => ({
    ...base,
    boxShadow: 'none',
    border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--B500)',
  }),
  menu: (base, state) => {
    return ({
      ...base,
      top: `38px`,
      backgroundColor: state.Selected ? "white" : "white"
    })
  },
  singleValue: (base, state) => {
    return ({
      ...base,
      fontWeight: 600,
      color: 'var(--B500)'
    })
  },
  option: (base, state) => {
    return ({
      ...base,
      color: 'var(--N900)',
      backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
    })
  }
}

export function Option(props) {
  const { selectOption, data } = props;
  const style = { height: '16px', width: '16px', flex: '0 0 16px' }
  const onClick = (e) => selectOption(data);
  return <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
    {props.isSelected ? (
      <Check onClick={onClick} className="mr-8 icon-dim-16" style={style} />
    ) : (
        <span onClick={onClick} className="mr-8" style={style} />
      )}
    <components.Option {...props} />
  </div>
};

export function DropdownIndicator(props) {
  return <components.DropdownIndicator {...props}>
    <ArrowDown className="icon-dim-20 icon-n5" />
  </components.DropdownIndicator>
}

export function frequencyXAxisLabel(props) {
  const { x, y, stroke } = props.viewBox;
  return <>
    <rect x={x} y={y + 10} width={12} height={12} fill="var(--G300)" />
    <text x={x + 20} y={y + 20} fill={stroke} textAnchor="start">Successful Deployments</text>
    <rect x={x + 180} y={y + 10} width={12} height={12} fill="var(--R300)" />
    <text x={x + 200} y={y + 20} fill={stroke} textAnchor="start">Failed Deployments</text>
  </>
}

export function leadTimeXAxisLabel(props) {
  const { x, y, stroke } = props.viewBox;
  return <>
    <rect x={x} y={y + 10} width={12} height={12} fill="var(--B300)" />
    <text x={x + 20} y={y + 20} fill={stroke} textAnchor="start">Max Lead Time</text>
  </>
}

export function recoveryTimeLabel(props) {
  const { x, y, stroke } = props.viewBox;
  return <>
    <rect x={x} y={y + 10} width={12} height={12} fill="var(--Y300)" />
    <text x={x + 20} y={y + 20} fill={stroke} textAnchor="start">Recovery Time for Failed Deployments</text>
  </>
}

export function BenchmarkLine(props) {
  let category = props.category;
  switch (category) {
    case "LOW": return <svg height="10" width="30">
      <line stroke="var(--R500)" strokeWidth="2" x1="0" y1="5" x2="30" y2="5" />
    </svg>
    case "MEDIUM": return <svg height="10" width="30">
      <line stroke="var(--Y500)" strokeWidth="2" x1="0" y1="5" x2="30" y2="5" />
    </svg>
    case "HIGH": return <svg height="10" width="30">
      <line stroke="var(--G500)" strokeWidth="2" x1="0" y1="5" x2="30" y2="5" />
    </svg>
    case "ELITE": return <svg height="10" width="30">
      <line stroke="#8930e8" strokeWidth="2" x1="0" y1="5" x2="30" y2="5" />
    </svg>
    default: return <span></span>
  }
}

export function renderCategoryTag(category: string) {
  switch (category) {
    case "LOW": return <span className="category__label category__label--low">Low</span>
    case "MEDIUM": return <span className="category__label category__label--medium">Medium</span>
    case "HIGH": return <span className="category__label category__label--high">high</span>
    case "ELITE": return <span className="category__label category__label--elite">Elite</span>
  }
}

export function ReferenceLineLegend() {
  return <svg height="10" width="30">
    <line stroke="var(--N900)" strokeWidth="2" stroke-dasharray="8,3" x1="0" y1="5" x2="30" y2="5" />
  </svg>
}

export function EliteCategoryMessage(props) {
  return <div className="cursor" onClick={props.onClick}>
    <p className="graph-legend__secondary-label" > You are in elite category </p>
    <p className="graph-legend__secondary-value">Good job!</p>
  </div>
}


export function FailureLegendEmptyState(props) {
  return <div>
    <p className="graph-legend__primary-label">Change Failure Rate
      <Tippy className="default-tt" arrow={false} content="How often does the pipeline fail?">
        <Help className="icon-dim-20 ml-8 vertical-align-middle mr-5" />
      </Tippy>
    </p>
    <div className="mt-16">
      <Smiley className="mr-8 inline-block vertical-align-middle" style={{ width: "39px" }} />
      <p className="m-0 fw-6 inline-block vertical-align-middle">Good Job! <br></br>
      No pipeline failures in this period
    </p>
    </div>
  </div>
}

export function FrequencyTooltip(props) {
  if (!props.active) return <div></div>
  let success = props.payload[0].payload.success;
  let failures = props.payload[0].payload.failures;
  return <div className="graph-tooltip" >
    <p className="">{props.label}</p>
    <p className="m-0 flexbox flex-justify">
      <span><span className="graph-tooltip__icon" style={{ backgroundColor: "var(--G300)" }}></span>Succeeded</span>
      <span>{success}</span>
    </p>
    <p className="m-0 flexbox flex-justify">
      <span><span className="graph-tooltip__icon" style={{ backgroundColor: "var(--R300)" }}></span>Failed </span>
      <span>{failures}</span>
    </p>
  </div>
}

export function LeadTimeTooltip(props) {
  if (!props.active) return <div></div>
  let yAxisLabel = props?.payload[0]?.payload?.yAxisLabel;
  return <div className="graph-tooltip" >
    <p className="">{props.label}</p>
    <p className="m-0 flexbox flex-justify">
      <span><span className="graph-tooltip__icon" style={{ backgroundColor: "var(--B300)" }}></span> Max Lead Time</span>
      <span>{yAxisLabel}</span>
    </p>
  </div>
}

export function RecoveryTimeTooltip(props) {
  if (!props.active) return <div></div>
  let yAxisLabel;
  try {
    yAxisLabel = props?.payload[0]?.payload?.yAxisLabel || "";
  } catch (e) {
    yAxisLabel = "";
  }
  return <div className="graph-tooltip" >
    <p className="">{props.label}</p>
    <p className="m-0 flexbox flex-justify">
      <span><span className="graph-tooltip__icon" style={{ backgroundColor: "var(--Y300)" }}></span>Recovery Time</span>
      <span>{yAxisLabel}</span>
    </p>
  </div>
}

export function getTimeperiod(timeInDays: number) {
  let timeInMinutes = 24 * 60 * (1 / (timeInDays));
  return createTimestamp(timeInMinutes);
}