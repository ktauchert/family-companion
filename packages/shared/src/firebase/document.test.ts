import { describe, expect, it } from 'vitest';
import { firestoreDocumentPayload } from './document';

describe('firestoreDocumentPayload', () => {
  it('removes undefined top-level fields', () => {
    expect(
      firestoreDocumentPayload({
        title: 'Einkaufen',
        dueDate: undefined,
        assignedTo: ['user_1'],
      }),
    ).toEqual({
      title: 'Einkaufen',
      assignedTo: ['user_1'],
    });
  });

  it('removes undefined nested fields in arrays', () => {
    expect(
      firestoreDocumentPayload({
        completions: [{ userId: 'user_1', done: false, doneAt: undefined }],
      }),
    ).toEqual({
      completions: [{ userId: 'user_1', done: false }],
    });
  });
});
