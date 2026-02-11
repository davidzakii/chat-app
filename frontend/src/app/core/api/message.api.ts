export const MESSAGE_API = {
  users: '/message/users',
  getMessagebyUser: (id: string) => `/message/${id}`,
  sendMessage: (id: string) => `/message/send/${id}`,
};
