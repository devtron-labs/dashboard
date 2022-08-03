import React, { useEffect, useState } from 'react'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { Checkbox } from '../formFields/Checkbox'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'

export function Accordian({ header, options, value, onChange, onClickViewChartButton }) {
    const [collapsed, setCollapse] = useState<boolean>(true)

    const toggleDropdown = () => {
        setCollapse(!collapsed)
    }

    return (
        <div>
            <div className="flex fs-12 h-36 pt-8 pb-8 cn-6 fw-6 ml-8 content-space cursor" onClick={toggleDropdown}>
                {header}
                <Dropdown
                    className="icon-dim-24 rotate"
                    style={{ ['--rotateBy' as any]: collapsed ? '180deg' : '0deg' }}
                />
            </div>
            {collapsed && (
                <div>
                    <div className="pt-10 pb-10 pl-12 pr-12 br-4 bw-1 bcv-1 w-100 ev-2 flexbox">
                        <div className="icon-dim-16 ">
                            <Help className="icon-dim-16 fcv-5" />
                        </div>
                        <span className="ml-10 fw-4 lh-18 fs-12 ">
                            To install charts from your own chart repo,
                            <a target="_blank" onClick={onClickViewChartButton} className="cursor onlink">
                                Connect chart repository
                            </a>
                        </span>
                    </div>
                    {options.map((e) => (
                        <div className="position-rel flex left cursor">
                            <Checkbox
                                rootClassName="cursor bcn-0 ml-7 h-32 fs-13 mb-0 mr-10"
                                isChecked={value.filter((event) => event === e).length}
                                value={'CHECKED'}
                                onChange={() => onChange(e)}
                            >
                                <div className="ml-5">{e.label}</div>
                            </Checkbox>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
