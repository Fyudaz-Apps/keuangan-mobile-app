import { messages } from '@/i18n';

describe('i18n messages', () => {
  it('has the same keys in id and en', () => {
    expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages.id).sort());
  });
});
