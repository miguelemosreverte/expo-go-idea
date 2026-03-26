export type MessagingChannel = 'whatsapp' | 'telegram';

export interface MessagingStatus {
  channel: MessagingChannel;
  connected: boolean;
  pairingRequired: boolean;
}

export interface MessagingConversation {
  id: string;
  channel: MessagingChannel;
  peerId: string;
  peerName: string;
  workspaceId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
}
