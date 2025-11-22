export interface Comment {
	id: string;
	post_id: string;
	user_id: string;
	content: string;
	content_markdown: string;
	parent_comment_id: string | null;
	hashnode_comment_id: string | null; // ID after syncing to Hashnode
	synced_to_hashnode: boolean;
	created_at: string;
	updated_at: string;
	user: {
		id: string;
		email: string;
		name: string;
		avatar_url: string | null;
	};
}

export interface CommentWithReplies extends Comment {
	replies: CommentWithReplies[];
}

