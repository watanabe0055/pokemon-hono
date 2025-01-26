// 日付を基に乱数シードを生成
const generateSeed = (dateString: string): number => {
  return Array.from(dateString).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
};

// シードに基づいて乱数を生成する関数
const seededRandom = (seed: number): (() => number) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

// 指定範囲からランダムに4つの数字を選ぶ関数
export const getRandomNumbersForToday = (dateString: string): number[] => {
  const seed = generateSeed(dateString);
  const random = seededRandom(seed);
  const numbers = Array.from({ length: 1025 }, (_, i) => i + 1); // 1～1025の配列
  const selectedNumbers: number[] = [];

  while (selectedNumbers.length < 4) {
    const index = Math.floor(random() * numbers.length);
    selectedNumbers.push(numbers[index]);
    numbers.splice(index, 1); // 選ばれた数字を配列から削除
  }

  return selectedNumbers;
};
