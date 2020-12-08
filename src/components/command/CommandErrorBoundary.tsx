import { Component } from 'react'
import { toast } from 'react-toastify';
import ReactGA from 'react-ga';
export class CommandErrorBoundary extends Component<{ toggleCommandBar; }, any>{
    constructor(props) {
        super(props);
        this.state = { eventId: null, hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error");
        toast.error("Some Error Occurred");
        ReactGA.event({
            category: 'Command Bar',
            action: 'Error',
            label: '',
        });
        this.props.toggleCommandBar(false);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.children !== this.props.children) {
            this.setState({ hasError: false })
        }
    }

    render() {
        return this.props.children
    }

}


