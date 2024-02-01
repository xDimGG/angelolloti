import { error } from '@sveltejs/kit';
import { posts } from '$lib/posts';

const postMap = new Map(posts.map(c => [c.id, c]));

export const load = async ({ params: { id } }) => {
	if (postMap.has(id))
		return postMap.get(id);

	error(404, 'Not found');
};
