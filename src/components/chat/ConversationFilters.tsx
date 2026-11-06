import "./ConversationFilters.css";

//các bộ lọc hiện tại
export type ChatFilter = "all" | "unread" | "pinned" | "work";

// prop
type ConversationFiltersProps = {
    activeFilter: ChatFilter;
    totalCount: number;
    unreadCount: number;
    pinnedCount: number;
    onChange: (filter: ChatFilter) => void;
};

// Danh sách các bộ lọc
const filters: {
    id: ChatFilter;
    label: string;
    icon?: string;
}[] = [
    { id: "all", label: "Tất cả" },
    { id: "unread", label: "Chưa đọc" },
    { id: "pinned", label: "Đã ghim", icon: "keep" },
    { id: "work", label: "Nhóm công việc", icon: "work" },
];

function ConversationFilters({
                                 activeFilter,
                                 totalCount,
                                 unreadCount,
                                 pinnedCount,
                                 onChange,
                             }: ConversationFiltersProps) {

    // Xác định số lượng hiển thị của từng bộ lọc
    const getFilterCount = (filter: ChatFilter) => {
        switch (filter) {
            case "all":
                return totalCount;
            case "unread":
                return unreadCount;
            case "pinned":
                return pinnedCount;
            default:
                return null;
        }
    };

    return (
        <div
            className="conversation-filters"
            role="group"
            aria-label="Bộ lọc cuộc trò chuyện"
        >
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    type="button"
                    className={
                        "conversation-filters__button " +
                        (activeFilter === filter.id
                            ? "conversation-filters__button--active"
                            : "")
                    }
                    aria-pressed={activeFilter === filter.id}
                    onClick={() => onChange(filter.id)}
                >
                    {filter.id === "unread" && (
                        <span className="conversation-filters__unread-dot" />
                    )}

                    {filter.icon && (
                        <span
                            className="material-symbols-outlined conversation-filters__icon"
                            aria-hidden="true"
                        >
                            {filter.icon}
                        </span>
                    )}

                    <span>{filter.label}</span>

                    {getFilterCount(filter.id) !== null && (
                        <span>
                            ({getFilterCount(filter.id)})
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

export default ConversationFilters;