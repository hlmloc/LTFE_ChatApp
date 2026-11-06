export type ChatFilter = 'all' | 'unread' | 'pinned' | 'work';

export type MediaFilter = 'file' | 'image' | null;

export type MessageKind =
    | 'text'
    | 'file'
    | 'image'
    | 'voice'
    | 'location';

export type AvatarTone =
    | 'blue'
    | 'pink'
    | 'mint'
    | 'violet';

export type Conversation = {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
    tone: AvatarTone;
    type: 'direct' | 'group' | 'system';
    preview: string;
    time: string;
    messageKind: MessageKind;
    unreadCount: number;
    pinned: boolean;
    online: boolean;
    verified?: boolean;
    mentioned?: boolean;
    isWorkGroup?: boolean;
    lastMessageSeen?: boolean;
};