export class KoreanHelper {
  static hasKoreanChar(text: string): boolean {
    const koreanRegex = /[가-힣]/g;
    const koreanChars = text.match(koreanRegex);

    return koreanChars && koreanChars.length > 0;
  }
  static appendPostPosition(name: string): string {
    if (!this.hasKoreanChar(name)) {
      return name + '와';
    }
    const lastChar = name.charCodeAt(name.length - 1);

    const hasLast = (lastChar - 0xac00) % 28;

    return hasLast ? name + '과' : name + '와';
  }
}
