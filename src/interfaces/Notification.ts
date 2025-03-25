export interface Notification{
    id: number,
    message: string,
    type: string
}

export function createNotification(id: number, message: string, type: string): Notification {
    return { id, message, type };
}