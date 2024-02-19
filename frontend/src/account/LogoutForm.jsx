import { useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import { URLManagement } from '../snippets';

function LogoutForm() {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const API_BASE_URL = URLManagement('http');

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const handleLogout = useCallback(async () => {
        const csrfToken=getCookie('csrftoken');
        try {
            await axios.post(`${API_BASE_URL}/logout/`, {}, {
                headers: {
                    'X-CSRFToken': csrfToken
                },
                withCredentials: true
            });
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
        } catch (error) {
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
        }
    }, [setUser, navigate]);

    useEffect(() => {
        handleLogout();
    }, [handleLogout]);

    return null;
}

export default LogoutForm;
