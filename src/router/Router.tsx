
import { createBrowserRouter } from 'react-router-dom';
import ChatDetail from '../pages/ChatDetail';
import AuthPage from '../pages/AuthPage';
import { Error } from './Error';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AuthPage />,
        errorElement: <Error />,
    },

    {
        path: '/chat',
        element: <ChatDetail />,
        errorElement: <Error />,
    },
]);
