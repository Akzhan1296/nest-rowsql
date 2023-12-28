import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { BlogsQueryType, CreateBlogInputModelType } from "./sa.blogs.models";
import { PaginationViewModel } from "../../../../../common/types";
import { BlogViewModel } from "../../../../infrstructura/blogs/blogs.models";
import { BlogsQueryRepository } from "../../../../infrstructura/blogs/blogs.query.repository";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogBySACommand } from "../application/use-cases/sa.create-blog.use-case";
import { ResultCreateBlogDTO } from "../application/sa.blogs.dto";
import { AuthBasicGuard } from "../../../../../guards/authBasic.guard";

@UseGuards(AuthBasicGuard)
@Controller("sa/blogs")
export class SABlogsController {
  constructor(
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsQueryRepository
  ) {}

  // get blogs
  @Get()
  async getBlogs(
    @Query() pageSize: BlogsQueryType
  ): Promise<PaginationViewModel<BlogViewModel>> {
    return await this.blogsQueryRepository.getBlogs(pageSize);
  }

  // create new blog
  @Post()
  @HttpCode(201)
  async createBlog(
    @Body() blogInputModel: CreateBlogInputModelType,
    @Req() request: Request
  ): Promise<BlogViewModel> {
    const { createdBlogId } = await this.commandBus.execute<
      unknown,
      ResultCreateBlogDTO
    >(
      new CreateBlogBySACommand({
        name: blogInputModel.name,
        description: blogInputModel.description,
        websiteUrl: blogInputModel.websiteUrl,
      })
    );

    const blogViewModel = this.blogsQueryRepository.getBlogById(createdBlogId);
    return blogViewModel;
  }

  // update blog
  @Put(":id")
  @HttpCode(204)
  async updateBlog(
    @Param() params: { id: string },
    @Req() request: Request,
    @Body() blogInputModel: CreateBlogInputModelType
  ): Promise<boolean> {
    // const checkingResult =
    //   await this.blogsService.checkBlockBeforeUpdateOrDelete({
    //     blogId: params.id,
    //     userId: request.body.userId,
    //   });
    // if (!checkingResult.isBlogFound) throw new NotFoundException();
    // if (checkingResult.isForbidden) throw new ForbiddenException();
    // return await this.blogsService.updateBlog(params.id, blogInputModel);

    return true;
  }

  // delete
  @Delete(":id")
  @HttpCode(204)
  async deleteBlog(
    @Param() params: { id: string },
    @Req() request: Request
  ): Promise<boolean> {
    // const checkingResult =
    //   await this.blogsService.checkBlockBeforeUpdateOrDelete({
    //     blogId: params.id,
    //     userId: request.body.userId,
    //   });
    // if (!checkingResult.isBlogFound) throw new NotFoundException();
    // if (checkingResult.isForbidden) throw new ForbiddenException();

    // return await this.blogsService.deleteBlog(params.id);
    return true;
  }

  // POSTS
  // get blog posts
  // @HttpCode(200)
  // @UseGuards(UserIdGuard)
  // @Get(":blogId/posts")
  // async getBlogPosts(
  //   @Req() request: Request,
  //   @Query() pageSize: BlogsQueryType,
  //   @Param() params: { blogId: string }
  // ): Promise<PaginationViewModel<PostViewModel>> {
  //   const blog = await this.blogsQueryRepository.getBlogById(params.blogId);
  //   if (!blog) {
  //     throw new NotFoundException("posts by blogid not found");
  //   }
  //   if (blog.isBanned) {
  //     throw new NotFoundException("blog not found");
  //   }
  //   return await this.postsQueryService.getPostsWithLikeByblogId(
  //     pageSize,
  //     request.body.userId,
  //     params.blogId
  //   );
  // }
  // create post by blog id
  // @Post(":blogId/posts")
  // @HttpCode(201)
  // async createPostByBlogId(
  //   @Param() params: { blogId: string },
  //   @Body() postInputModel: CreatePostByBlogIdInputType,
  //   @Req() request: Request
  // ): Promise<PostViewModel> {
  //   const checkingResult =
  //     await this.blogsService.checkBlockBeforeUpdateOrDelete({
  //       blogId: params.blogId,
  //       userId: request.body.userId,
  //     });
  //   if (!checkingResult.isBlogFound) throw new NotFoundException();
  //   if (checkingResult.isForbidden) throw new ForbiddenException();

  //   const postByBlogId = await this.postService.createPost({
  //     ...postInputModel,
  //     blogId: params.blogId,
  //     userId: request.body.userId,
  //   });
  //   return await this.postQuerysRepository.getPostById(
  //     postByBlogId._id.toString()
  //   );
  // }

  //update post by blog id
  // @HttpCode(204)
  // @Put(":blogId/posts/:postId")
  // async updatePostByBlogId(
  //   @Param() params: { blogId: string; postId: string },
  //   @Body() postsInputModel: UpdatePostInputModel,
  //   @Req() request: Request
  // ) {
  //   const checkingResult =
  //     await this.blogsService.checkBlockBeforeUpdateOrDelete({
  //       blogId: params.blogId,
  //       postId: params.postId,
  //       userId: request.body.userId,
  //     });

  //   if (!checkingResult.isBlogFound) throw new NotFoundException();
  //   if (!checkingResult.isPostFound) throw new NotFoundException();
  //   if (checkingResult.isForbidden) throw new ForbiddenException();
  //   return this.postService.updatePost(params.postId, {
  //     ...postsInputModel,
  //     blogId: params.blogId,
  //     userId: request.body.userId,
  //   });
  // }

  //delete post by blog id
  // @HttpCode(204)
  // @Delete(":blogId/posts/:postId")
  // async deletePostByBlogId(
  //   @Param() params: { blogId: string; postId: string },
  //   @Req() request: Request
  // ) {
  //   const checkingResult =
  //     await this.blogsService.checkBlockBeforeUpdateOrDelete({
  //       blogId: params.blogId,
  //       postId: params.postId,
  //       userId: request.body.userId,
  //     });

  //   if (!checkingResult.isBlogFound) throw new NotFoundException();
  //   if (!checkingResult.isPostFound) throw new NotFoundException();
  //   if (checkingResult.isForbidden) throw new ForbiddenException();
  //   return await this.postService.deletePost(params.postId);
  // }
}