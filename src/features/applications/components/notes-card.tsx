'use client';

import { useState } from 'react';
import { NotebookPenIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/loading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

/**
 * NOTES card — edit the application's free-text notes (PATCH the
 * application record). Read-only until "Edit" is pressed so the card
 * never fights the user's typing against server refetches.
 */
export function NotesCard({
  applicationId,
  initialNotes,
  isSaving,
  onSave,
}: {
  applicationId: number | undefined;
  initialNotes: string | null;
  isSaving: boolean;
  onSave: (notes: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialNotes ?? '');
  const [prevNotes, setPrevNotes] = useState(initialNotes);

  // Adjust during render when the server value changes (no effect).
  if (initialNotes !== prevNotes) {
    setPrevNotes(initialNotes);
    setDraft(initialNotes ?? '');
  }

  if (!applicationId) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NotebookPenIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            Notes
          </CardTitle>
          <CardDescription>
            Record an application first to add interview notes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookPenIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          Notes
        </CardTitle>
        <CardDescription>
          Interview questions, referral contacts, follow-up details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!editing ? (
          <>
            <p className="whitespace-pre-wrap text-sm">
              {initialNotes?.trim() ? (
                initialNotes
              ) : (
                <span className="text-muted-foreground">No notes yet.</span>
              )}
            </p>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {initialNotes ? 'Edit notes' : 'Add notes'}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`notes-${applicationId}`} className="sr-only">
                Notes
              </Label>
              <textarea
                id={`notes-${applicationId}`}
                value={draft}
                rows={5}
                maxLength={10_000}
                autoFocus
                placeholder="What happened in the last call? Who is the hiring manager?"
                onChange={(event) => setDraft(event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={isSaving}
                onClick={() => {
                  setEditing(false);
                  onSave(draft.trim());
                }}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={() => {
                  setDraft(initialNotes ?? '');
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              {isSaving && <ButtonSpinner />}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
