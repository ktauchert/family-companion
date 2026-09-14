import { describe, expect, it } from 'vitest';
import { messageFromStoreError } from './store-error';

describe('messageFromStoreError', () => {
  it('explains a permission-denied write', () => {
    expect(
      messageFromStoreError(
        { code: 'permission-denied' },
        'Beitritt nicht möglich.',
      ),
    ).toBe(
      'Beitritt nicht möglich. Firebase hat die Anfrage abgelehnt (E-Mail auf der Liste? Rules veröffentlicht?).',
    );
  });

  it('keeps an unknown store error with its code', () => {
    expect(
      messageFromStoreError({ code: 'unavailable' }, 'Beitritt nicht möglich.'),
    ).toBe('Beitritt nicht möglich. (unavailable)');
  });
});
