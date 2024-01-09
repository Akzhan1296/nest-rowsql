export type PostLikeType = {
  addedAt: Date;
  userId: string;
  login: string;
};

export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: PostLikeType[];
  };
};

export type OnlyPostDataView = Omit<
  PostViewModel,
  "blogId" | "blogName" | "extendedLikesInfo"
>;

export type CreatePostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: Date;
};

export type UpdatePostDTO = Omit<CreatePostDTO, "blogId" | "createdAt"> & {
  postId: string;
};
