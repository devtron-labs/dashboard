// As of now contains util to delete, append, check refetchData query param.
// These will be changed to more generic way later.

export const checkIfToRefetchData = (location): boolean => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.has('refetchData')) {
        return true;
    }
    return false;
};

export const deleteRefetchDataFromUrl = (history, location): void => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('refetchData');
    history.replace({
        search: queryParams.toString(),
    });
};

export const appendRefetchDataToUrl = (history, location): void => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.append('refetchData', 'true');
    history.replace({
        search: queryParams.toString(),
    })
}