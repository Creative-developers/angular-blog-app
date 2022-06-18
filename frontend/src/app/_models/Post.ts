export interface Post {
  _id?: string;
  title: string;
  body: string;
  categories: string[];
  user: string;
  status: string;
  featuredImage: string;
}
