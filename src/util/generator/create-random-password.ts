export class RandomGenerator {
  static createRandomString(length: number): string {
    return Math.random()
      .toString(36)
      .toUpperCase()
      .slice(2, length + 2);
  }
}
