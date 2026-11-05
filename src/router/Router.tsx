import { createBrowserRouter } from 'react-router-dom';
import ChatDetail from '../pages/ChatDetail';
import { Error } from './Error';

export const router = createBrowserRouter([
    {
        path: '/',
        errorElement: <Error />,
    },

    {
        path: '/chat',
        element: <ChatDetail />,
        errorElement: <Error />,
    },
]);