import { sortStrings } from './index.js';

describe('javascript-data-types/sort-strings', () => {
  it('should return sorted by "asc" array of strings', () => {
    expect(sortStrings(['b', 'c', 'a'])).toEqual(['a', 'b', 'c']);
  });

  it('should return a new sorted array', () => {
    const arr = ['a', 'b', 'c'];
    const sorted = sortStrings(arr);

    expect(arr === sorted).toBeFalsy();
  });

  it('should return sorted by "desc" array of strings', () => {
    expect(sortStrings(['b', 'c', 'a'], 'desc')).toEqual(['c', 'b', 'a']);
  });

  it('should correctly sort language-specific characters', () => {
    expect(sortStrings(['абрикос', 'яблоко', 'ёжик'])).toEqual(['абрикос', 'ёжик', 'яблоко']);
  });

  it('should correctly sort strings started from uppercase', () => {
    expect(sortStrings(['абрикос', 'Абрикос', 'яблоко', 'Яблоко', 'ёжик', 'Ёжик']))
      .toEqual(['Абрикос', 'абрикос', 'Ёжик', 'ёжик', 'Яблоко', 'яблоко']);
  });
});
