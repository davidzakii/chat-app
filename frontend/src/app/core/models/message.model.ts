import { UserDTO } from "./user.model";


export interface MessageDTO {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  files?: MessageAttachmentDTO[];
}

export interface MessageAttachmentDTO {
  _id: string;
  name: string;
  publicId: string;
  url: string;
}

export interface ChatState {
  users: UserDTO[];
  usersLoading: boolean;
  messages: MessageDTO[];
  messagesLoading: boolean;
  selectedUserId: string | null;
  onlineUsers: string[];
}
