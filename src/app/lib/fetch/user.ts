export const fetchUserProfile = async (accessToken: string) => {
	const baseUrl =
		process.env.NEXT_PUBLIC_POKEMON_API_HONO || "http://localhost:8787";
	const path = `${baseUrl}/v1/private/profile`;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(path, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error("認証エラー：ログインが必要です");
			}
			throw new Error("プロフィールの取得に失敗しました");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching profile:", error);
		throw new Error("予期せぬエラーが発生しました");
	}
};
