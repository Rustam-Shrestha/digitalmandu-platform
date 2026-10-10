import client from '../client';
export const addressesAPI = {
  list: () => client.get('/addresses'),
  get: (id) => client.get(`/addresses/${id}`),
  create: (data) => client.post('/addresses', data),
  update: (id, data) => client.patch(`/addresses/${id}`, data),
  remove: (id) => client.delete(`/addresses/${id}`),
  setDefault: (id) => client.patch(`/addresses/${id}/default`),
};
