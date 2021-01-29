import { Component } from 'react'
import { toast } from 'react-toastify';
export class CommandErrorBoundary extends Component<{ toggleCommandBar; }, any>{
    constructor(props) {
        super(props);
        this.state = { eventId: null, hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        toast.error("Some Error Occurred");
        console.error("Error")
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


