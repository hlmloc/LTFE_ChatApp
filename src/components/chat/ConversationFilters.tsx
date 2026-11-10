
import type { ChatFilter } from "../../types/chat";
import "./ConversationFilters.css";

type ConversationFiltersProps = {
    activeFilter: ChatFilter;
    totalCount: number;
    directCount: number;
    groupCount: number;
    onChange: (filter: ChatFilter) => void;
};

const filters: { id: ChatFilter; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "direct", label: "Cá nhân" },
    { id: "group", label: "Nhóm chat" }
];

export default function ConversationFilters({ activeFilter, totalCount, directCount, groupCount, onChange }: ConversationFiltersProps) {
    const counts = { all: totalCount, direct: directCount, group: groupCount };

    return (
        <div className="conversation-filters" role="group" aria-label="Bộ lọc cuộc trò chuyện">
            {filters.map(filter => (
                <button
                    key={filter.id}
                    type="button"
                    className={`conversation-filters__button${activeFilter === filter.id ? " conversation-filters__button--active" : ""}`}
                    aria-pressed={activeFilter === filter.id}
                    onClick={() => onChange(filter.id)}
                >
                    {filter.label} ({counts[filter.id]})
                </button>
            ))}
        </div>
    );
}
