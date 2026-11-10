
import { createBrowserRouter } from "react-router-dom";

import AuthPage from "../pages/AuthPage";
import ChatsPage from "../pages/ChatsPage";
import ProtectedRoute from "./ProtectedRoute";
import { Error } from "./Error";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthPage />,
        errorElement: <Error />
    },
    {
        element: <ProtectedRoute />,
        errorElement: <Error />,
        children: [
            {
                path: "/chats",
                element: <ChatsPage />
            }
        ]
    }
]);
