import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import {
	getActiveGoal,
	getAllGoals,
	getOrCreateCurrentYearGoal,
	updateGoal,
	createGoal,
	deleteGoal
} from '$lib/server/services/goalsService';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const userId = locals.user.id;

	// Ensure a goal exists for the current year
	await getOrCreateCurrentYearGoal();

	const [currentGoal, allGoals] = await Promise.all([getActiveGoal(undefined, userId), getAllGoals()]);

	return {
		currentGoal,
		allGoals
	};
};

export const actions: Actions = {
	updateGoal: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string, 10);
		const targetBooks = parseInt(formData.get('targetBooks') as string, 10);
		const name = formData.get('name') as string;

		if (isNaN(id) || isNaN(targetBooks) || targetBooks < 1) {
			return fail(400, { error: 'Invalid input' });
		}

		await updateGoal(id, { targetBooks, name: name || null });
		return { success: true };
	},

	createGoal: async ({ request }) => {
		const formData = await request.formData();
		const year = parseInt(formData.get('year') as string, 10);
		const targetBooks = parseInt(formData.get('targetBooks') as string, 10);
		const name = formData.get('name') as string;

		if (isNaN(year) || isNaN(targetBooks) || targetBooks < 1) {
			return fail(400, { error: 'Invalid input' });
		}

		await createGoal({
			year,
			targetBooks,
			name: name || null,
			isActive: true
		});

		return { success: true };
	},

	deleteGoal: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string, 10);

		if (isNaN(id)) {
			return fail(400, { error: 'Invalid input' });
		}

		await deleteGoal(id);
		return { success: true };
	}
};
