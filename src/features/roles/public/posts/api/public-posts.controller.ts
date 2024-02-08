import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BlogsQueryType } from "../../../sa/blogs/api/sa.blogs.models";
import { PaginationViewModel } from "../../../../../common/types";
import { PostViewModel } from "../../../../infrstructura/posts/posts.models";
import { PostsQueryRepository } from "../../../../infrstructura/posts/posts.query.repository";
import { AuthGuard } from "../../../../../guards/auth.guard";
import {
  CommentsQueryType,
  CreateCommentInputModel,
  PostLikeStatus,
} from "./input.models";
import { CommandBus } from "@nestjs/cqrs";
import { CreateCommentCommand } from "../../comments/application/use-cases/create-comment-use-case";
import { Request } from "express";
import { CommentsQueryRepository } from "../../../../infrstructura/comments/comments.query.repository";
import { HandlePostLikesCommand } from "../application/use-cases/handle-post-like-use-case";
import { UserIdGuard } from "../../../../../guards/userId.guard";

@Controller("posts")
export class PublicPosts {
  constructor(
    private postQuerysRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus
  ) {}

  @Get("")
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Req() request: Request,
    @Query() pageSize: BlogsQueryType
  ): Promise<PaginationViewModel<PostViewModel>> {
    return await this.postQuerysRepository.getPosts(
      pageSize,
      request.body.userId
    );
  }

  @Get(":postId")
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPostById(
    @Req() request: Request,
    @Param() params: { postId: string }
  ) {
    const post = await this.postQuerysRepository.getPostByPostId(
      params.postId,
      request.body.userId
    );
    if (!post) {
      throw new NotFoundException("post by id not found");
    }
    return post;
  }

  @Get(":postId/comments")
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentsPostById(
    @Req() request: Request,
    @Query() pageSize: CommentsQueryType,
    @Param() params: { postId: string }
  ) {
    const comments = await this.commentsQueryRepository.getCommentsByPostId(
      params.postId,
      request.body.userId,
      pageSize
    );
    if (!comments) {
      throw new NotFoundException("comment by id not found");
    }
    return comments;
  }

  // like-status
  @Put(":postId/like-status")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async postStatus(
    @Req() request: Request,
    @Param() params: { postId: string },
    @Body() postLikeStatus: PostLikeStatus
  ) {
    const result = await this.commandBus.execute(
      new HandlePostLikesCommand({
        postId: params.postId,
        postLikeStatus: postLikeStatus.likeStatus,
        userId: request.body.userId,
        userLogin: request.body.userLogin,
      })
    );

    if (!result.isPostFound) {
      throw new NotFoundException();
    }

    return;
  }

  // comments
  @Post(":postId/comments")
  @UseGuards(AuthGuard)
  @HttpCode(201)
  async createCommentForSelectedPost(
    @Req() request: Request,
    @Param() params: { postId: string },
    @Body() commentInputModel: CreateCommentInputModel // : Promise<CommentViewModel>
  ) {
    const result = await this.commandBus.execute(
      new CreateCommentCommand({
        userId: request.body.userId,
        userLogin: request.body.userLogin,
        postId: params.postId,
        content: commentInputModel.content,
      })
    );

    if (!result.isPostFound) {
      throw new NotFoundException("Post by this id not found");
    }

    if (result.isCommentCreated) {
      const commentViewModel = this.commentsQueryRepository.getCommentById(
        result.commentId,
        request.body.userId
      );
      return commentViewModel;
    }
    return;
  }
}
