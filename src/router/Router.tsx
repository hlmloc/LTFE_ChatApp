import { createBrowserRouter } from "react-router-dom";

import AuthPage from "../pages/AuthPage";
import ChatDetail from "../pages/ChatDetail";
import ChatsPage from "../pages/ChatsPage";
import { Error } from "./Error";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthPage />,
        errorElement: <Error />,
    },
    {
        path: "/chats",
        element: <ChatsPage />,
        errorElement: <Error />,
    },
    {
        path: "/chat",
        element: <ChatDetail />,
        errorElement: <Error />,
    },
]);