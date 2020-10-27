import moment from 'moment-timezone';

export function ISTTimeModal(ts: string, isRelativeTime = false) {
    let timestamp = "";
    try {
        if (ts && ts.length) {
            let date = moment(ts).utc(false).tz('Asia/Kolkata');
            if(isRelativeTime) timestamp = date.fromNow();
            else timestamp = date.format("ddd DD MMM YYYY HH:mm:ss");
        }
    } catch (error) {
        console.error("Error Parsing Date:", ts);
    }
    return timestamp;
}

export function handleUTCTime(ts: string, isRelativeTime = false) {
    let timestamp = "";
    try {
        if (ts && ts.length) {
            let date = moment(ts);
            if (isRelativeTime) timestamp = date.fromNow();
            else timestamp = date.format("ddd DD MMM YYYY HH:mm:ss");
        }
    } catch (error) {
        console.error("Error Parsing Date:", ts);
    }
    return timestamp;
}
