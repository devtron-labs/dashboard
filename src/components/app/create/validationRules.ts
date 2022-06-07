import { PATTERNS } from '../../../config';

export class ValidationRules {
    appName = (value: string): { isValid: boolean; message: string } => {
        let re = PATTERNS.APP_NAME;
        let regExp = new RegExp(re);
        let test = regExp.test(value);
        if (value.length === 0) return { isValid: false, message: 'Please provide app name' };
        if (value.length < 3) return { isValid: false, message: 'Atleast 3 characters required' };
        if (value.length > 30) return { isValid: false, message: 'Max 30 characters allowed' };
        else if (!test)
            return {
                isValid: false,
                message: "Min 3 characters; Start with lowercase; Use (a-z), (0-9), (-), (.); Do not use 'spaces'",
            };
        else return { isValid: true, message: '' };
    };

    team = (projectId: number): { isValid: boolean; message: string } => {
        let found = !!projectId;
        if (found) return { isValid: true, message: '' };
        else return { isValid: false, message: 'Please select a project' };
    };

    cloneApp = (cloneAppId: number): { isValid: boolean; message: string } => {
        let found = !!cloneAppId;
        if (found) return { isValid: true, message: '' };
        else return { isValid: false, message: 'Please select an application to clone' };
    };
}
