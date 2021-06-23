import react from 'react';
import { get, post, put, trash } from '../../services/api';

export function getReadme() {
    return get(`app-store/application/readme/240`)
}