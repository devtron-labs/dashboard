import moment from 'moment';
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

export const getTimeElapsed = (startedOn, finishedOn) => {
    const diff: moment.Duration = moment.duration(finishedOn.diff(startedOn))
    const hours = diff.hours() > 0 ? `${String(diff.hours()).padStart(2, '0')}h:` : ''
    const minutes = diff.minutes() > 0 ? `${String(diff.minutes()).padStart(2, '0')}m:` : ''
    const seconds = String(diff.seconds()).padStart(2, '0')
    return `${hours}${minutes}${seconds}s`
}

export const formatDurationDiff = (startedOn: string, finishedOn: string) => {
    const diff: moment.Duration = moment.duration(moment(finishedOn).diff(moment(startedOn)))
    const hours = diff.hours() > 0 ? `${diff.hours()}h ` : ''
    const minutes = diff.minutes() > 0 ? `${diff.minutes()}m ` : ''
    const seconds = `${diff.seconds()}s`
    return `${hours}${minutes}${seconds}`
}

export const processDeployedTime = (lastDeployed, isAgroInstalled) => {
    if (lastDeployed) {
        return handleUTCTime(lastDeployed, true)
    } else {
        return isAgroInstalled ? '' : 'Not deployed'
    }
}
