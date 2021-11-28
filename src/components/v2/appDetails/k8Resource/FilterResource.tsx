import React from 'react'
import { StatusFilterButtonComponent } from './StatusFilterButton.component'
import { ReactComponent as Search } from '../../../../assets/icons/ic-search.svg';
import IndexStore from '../index.store';

export default function FilterResource() {

    const handleFileterChange = (sName: string) => {
        IndexStore.updateFilterSearch(sName)
    }
    
    return (
        <div className="flex wrap flex-justify pr-20 w-100">
            <div className="search" style={{ width: '100%' }}>
                <Search className="search__icon icon-dim-18" />
                <input onChange={(e) => {
                    handleFileterChange(e.target.value)
                }} className="w-100 en-2 bw-1 pt-6 pb-6 br-4 pl-32 pr-8 " placeholder="Search objects" type="text" />
            </div>
            <div>
                <StatusFilterButtonComponent />
            </div>
        </div>
    )
}
