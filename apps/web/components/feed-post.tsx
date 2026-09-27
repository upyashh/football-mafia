import { Heart, MessageCircle } from "lucide-react";
import type { FeedPost as FeedPostType } from "@football-mafia/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function timeAgo(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function FeedPost({ post }: { post: FeedPostType }) {
  return (
    <article className="flex flex-col gap-3 border-b border-border-subtle px-4 py-4">
      <div className="flex items-center gap-2.5">
        <Avatar className="bg-club-accent">
          <AvatarFallback className="bg-club-accent font-semibold text-white">
            {post.authorUsername.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-text-primary">
            {post.authorUsername}
          </span>
          <span className="text-xs text-text-secondary">
            {timeAgo(post.createdAt)}
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-text-primary">{post.body}</p>

      <div className="flex items-center gap-5 text-xs font-medium text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Heart className="size-4" />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="size-4" />
          {post.commentCount}
        </span>
      </div>
    </article>
  );
}
