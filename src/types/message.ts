export interface Message {
    id: number;
    name: string;
    to: string;
    mes: string;
    createAt: string;
    type: 0 | 1;
}

export interface PeopleChatResponse {
    status: string;
    event: string;
    data?: Message[];
    mes?: string;
}