import React, { useEffect, useState } from 'react';
import google from 'patternfly/dist/img/google-logo.svg';
import dt from '../../assets/icons/logo/logo-dt.svg';
import './login.css';
import { toast } from 'react-toastify';

export default function Login() {
    const [continueUrl, setContinueUrl] = useState("");

    useEffect(() => {
        const currentPath = window.location.href
        let cont = ""
        if (currentPath.includes('?continue=')) {
            cont = currentPath.split('?continue=')[1]
            toast.error('Please login again');
        }
        setContinueUrl(encodeURI(`${window.location.origin}${process.env.PUBLIC_URL}${cont}`));
    }, [])

    return (
        <div className="login">
            <div className="login__bg"><div className="login__image" /></div>
            <div className="login__section">
                <div className="login__control">
                    <img src={dt} alt="login" className="login__dt-logo" width="170px" height="120px" />
                    <p className="login__text">Your tool for Rapid, Reliable & Repeatable deployments</p>
                    <a href={`/orchestrator/auth/login?return_url=${continueUrl}`} className="login__google">
                        <img src={google} alt="logn-with-google" className="google-icon" />Login with Google
                    </a>
                </div>
            </div>
        </div>
    )
}
