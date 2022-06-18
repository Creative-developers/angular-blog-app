export interface Comment {
  _id?: string;
  body: string;
  user: string;
  post: string;
  depth: number;
  parentId?: string;
  postedDate: Date;
  status: boolean;
  childrens?: Comment[];
}
