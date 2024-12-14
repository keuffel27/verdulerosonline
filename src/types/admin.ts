export interface Store {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  status: 'active' | 'inactive';
  owner: {
    name: string;
    email: string;
  };
}

export interface CreateStoreFormData {
  name: string;
  ownerName: string;
  ownerEmail: string;
}