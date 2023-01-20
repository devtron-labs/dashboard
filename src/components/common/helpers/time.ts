import moment from 'moment-timezone';
import { ZERO_TIME_STRING } from '../../../config';

export function ISTTimeModal(ts: string, isRelativeTime = false) {
    let timestamp = "";
    try {
        if (ts && ts.length) {
            let date = moment(ts)
            if(isRelativeTime){
                // check for minimum date (zero date) (Invoking an empty time.Time struct literal will return Go's zero date)
                if(ts != ZERO_TIME_STRING){
                    timestamp = date.fromNow();
                }
            }
            else {
                timestamp = date.format("ddd DD MMM YYYY HH:mm:ss");
            }
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
