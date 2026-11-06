import { SearchX } from "lucide-react";

import ConversationItem from "./ConversationItem";
import type { Conversation } from "./ConversationItem";

import "./ConversationList.css";

type ConversationListProps = {
    conversations: Conversation[];
    onSelect: (conversationId: string) => void;
};

function ConversationList({
                              conversations,
                              onSelect,
                          }: ConversationListProps) {
    return (
        <section
            className="conversation-list"
            aria-label="Danh sách cuộc trò chuyện"
        >
            {conversations.length > 0 ? (

                conversations.map((conversation) => (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        onSelect={onSelect}
                    />
                ))

            ) : (
                <div className="conversation-list__empty">
                    <SearchX
                        size={40}
                        className="conversation-list__empty-icon"
                        aria-hidden="true"
                    />

                    <h3 className="conversation-list__empty-title">
                        Không tìm thấy cuộc trò chuyện
                    </h3>
                    <p className="conversation-list__empty-description">
                        Hãy thử tìm kiếm bằng từ khóa khác
                        hoặc thay đổi bộ lọc.
                    </p>
                </div>

            )}
        </section>
    );
}

export default ConversationList;