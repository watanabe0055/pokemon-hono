/**
 * idとstatusだけを返す関数
 * TODO:（後々指定できたほうが便利そう）
 * @param query
 * @returns
 */
export const replacePokemonUrlParams = (
	query: Record<string, string>,
): { id?: string; status?: string } => {
	// 必要なキーだけを抽出
	const { id, status } = query;

	return { id, status };
};
