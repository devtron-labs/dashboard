import React from 'react';
import IndexStore from '../index.store';
import { StatusFilterButtonComponent } from './StatusFilterButton.component';

export default function FilterResource() {
    {
        /* ---for  later purpose---- */
    }
    // const handleFileterChange = (sName: string) => {
    //     IndexStore.updateFilterSearch(sName)
    // }

    return (
        <div className="flexbox pr-20 w-100">
            {/* ---for  later purpose---- */}
            {/* <div className="search" style={{ width: '100%' }}>
                <Search className="search__icon icon-dim-18" />
                <input onChange={(e) => {
                    handleFileterChange(e.target.value)
                }} className="w-100 en-2 bw-1 pt-6 pb-6 br-4 pl-32 pr-8 " placeholder="Search objects" type="text" />
            </div> */}
            <div>
                <StatusFilterButtonComponent />
            </div>
        </div>
    );
}
