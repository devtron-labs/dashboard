import React from 'react';
import './Toggle.scss'
import {useEffectAfterMount} from '../helpers/Helpers';

const Toggle = ({selected=false, onSelect=null, color="#36b37e", rootClassName="", disabled=false, dataTestId="handle-toggle-button", ...props})=>{
    const [active, setActive] = React.useState(selected);

    useEffectAfterMount(()=>{
        if(typeof onSelect === 'function'){
            if(active !== selected){
                onSelect(active)
            }
        }
    },[active])

    useEffectAfterMount(() => {
        setActive(selected)
    }, [selected])

    function handleClick(e){
        if(!disabled){
            setActive(active=>!active)
        }
    }

    return (
        <label
            {...props}
            className={`${rootClassName} toggle__switch ${disabled ? 'disabled' : ''}`}
            style={{ ['--color' as any]: color }}
        >
            <input type="checkbox" checked={!!active} onChange={handleClick} className="toggle__input" />
            <span className="toggle__slider round" data-testid={dataTestId}></span>
        </label>
    )
}

export default Toggle