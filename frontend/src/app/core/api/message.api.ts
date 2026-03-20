export const MESSAGE_API = {
  users: '/message/users',
  getMessagebyUser: (id: string) => `/message/${id}`,
  sendMessage: (id: string) => `/message/send/${id}`,
  editMessage: (id: string) => `/message/edit/${id}`,
  deleteMessage: (id: string) => `/message/delete/${id}`,
};
