export interface ResourceTreeTab {
    name: string;
    icon: string;
    className?: string
}

 export interface ResourceTreeTabs extends Array<ResourceTreeTab> { }

 export const ResourceTreeActions = {
    Init: "INIT",
    Error: "ERROR",
    AddTab: "ADD_TAB",
    RemoveTab: "REMOVE_TAB"
};