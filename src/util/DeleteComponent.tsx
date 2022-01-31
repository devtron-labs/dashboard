import { toast } from "react-toastify";
import { showError } from "../components/common";

async function DeleteComponent({ setDeleting, deleteComponent, toggleConfirmation, statusCode = 0 }) {

        setDeleting(true);
        try {
            await deleteComponent();
            toast.success('Successfully deleted');
        } catch (err) {
            if (statusCode != 403) {
                toggleConfirmation(false);
            } else {
            showError(err);
            }
        } finally {
            setDeleting(false);
        }
}

export default DeleteComponent;
