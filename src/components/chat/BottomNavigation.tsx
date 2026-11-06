import { NavLink } from "react-router-dom";
import {
    MessageSquare,
    Users,
    Bell,
    Settings,
} from "lucide-react";

import "./BottomNavigation.css";

type BottomNavigationProps = {
    onUnavailable: (page: string) => void;
};

function BottomNavigation({
                              onUnavailable,
                          }: BottomNavigationProps) {
    return (
        <nav className="bottom-navigation" aria-label="Điều hướng chính">
            <div className="bottom-navigation__inner">

                {/* Đoạn chat */}
                <NavLink
                    to="/chats"
                    end
                    className={({ isActive }) =>
                        "bottom-navigation__item " +
                        (isActive
                            ? "bottom-navigation__item--active"
                            : "")
                    }
                >
                    <MessageSquare size={24} aria-hidden="true" />
                    <span>Đoạn chat</span>
                </NavLink>

                {/* Người dùng */}
                <button
                    type="button"
                    className="bottom-navigation__item"
                    onClick={() => onUnavailable("Người dùng")}
                >
                    <Users size={24} aria-hidden="true" />
                    <span>Người dùng</span>
                </button>

                {/* Thông báo */}
                <button
                    type="button"
                    className="bottom-navigation__item"
                    onClick={() => onUnavailable("Thông báo")}
                >
                    <Bell size={24} aria-hidden="true" />
                    <span>Thông báo</span>
                </button>

                {/* Cài đặt */}
                <button
                    type="button"
                    className="bottom-navigation__item"
                    onClick={() => onUnavailable("Cài đặt")}
                >
                    <Settings size={24} aria-hidden="true" />
                    <span>Cài đặt</span>
                </button>

            </div>
        </nav>
    );
}

export default BottomNavigation;