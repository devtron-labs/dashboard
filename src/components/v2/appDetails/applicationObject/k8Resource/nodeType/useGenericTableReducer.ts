
import { useReducer, useEffect } from "react";
import { Table, tCell } from "../../../../utils/tableUtils/table.type";
import AppDetailsStore from "../../../appDetail.store";
import { NodeType } from "../../../appDetail.type";

export const GenericTableActions = {
    Init: "INIT",
    Error: "ERROR",
};


const initialState = {
    loading: true,
    error: null,
    tableData: { tHead: [], tBody: [] },
    selectedNodeType: ""
};

const reducer = (state: any, action: any) => {
    switch (action.type) {

        case GenericTableActions.Init:
            const data = getTableData(action.nodeType)
            return { ...state, loading: false, selectedNodeType: action.selectedNodeType, tableData: { ...data } };

        case GenericTableActions.Error:
            return { ...state, loading: false, error: action.error };
    }
};

const getTableData = (nodeType: NodeType) => {

    let genericTablejSON = {} as Table

    const appDetailsNodes = AppDetailsStore.getAppDetailsNodes()

    let _tHeader = []

    if (nodeType === NodeType.Pod) {
        _tHeader = ["Pod (All)", "Ready", "Restarts", "Age", "Live sync status"]
    } else if (nodeType === NodeType.Service) {
        _tHeader = ["Name", "URL"]
    } else {
        _tHeader = ["Name"]
    }

    genericTablejSON.tHead = _tHeader.map((_cellValue) => {
        let _tCell = {} as tCell
        _tCell.value = _cellValue
        return _tCell
    })

    let _tRows = []

    appDetailsNodes.forEach((_node, index) => {

        if (_node.kind === nodeType) {

            let _tRow = []

            let _tCell0 = {} as tCell
            _tCell0.value = _node.name
            _tRow.push(_tCell0)

            if (_node.kind === NodeType.Pod) {
                //let _tCell = {} as tCell
            } else if (_node.kind === NodeType.Service) {
                let _tCell1 = {} as tCell
                _tCell1.value = _node.name + "." + _node.namespace + ": { portnumber }"
                _tRow.push(_tCell1)
            } else {
                //No further column   
            }

            _tRows.push(_tRow)
        }
    })

    genericTablejSON.tBody = _tRows

    console.log("genericTablejSON", genericTablejSON)

    return genericTablejSON

}

export const useGenericTable = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return [state, dispatch];
};

