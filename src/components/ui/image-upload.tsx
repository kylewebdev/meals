'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface ImageUploadProps {
  currentImageUrl?: string | null;
  getUploadUrl: (file: { fileType: string; fileSize: number }) => Promise<
    | { success: true; data: { uploadUrl: string; publicUrl: string } }
    | { success: false; error: string }
  >;
  onUploadComplete: (publicUrl: string) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export function ImageUpload({
  currentImageUrl,
  getUploadUrl,
  onUploadComplete,
  onRemove,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const displayUrl = preview || currentImageUrl;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    e.target.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast('Only JPEG, PNG, and WebP images are supported');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast('Image must be under 5 MB');
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const res = await getUploadUrl({ fileType: file.type, fileSize: file.size });
      if (!res.success) {
        toast(res.error);
        setPreview(null);
        return;
      }

      // Upload directly to R2 via presigned PUT
      const putRes = await fetch(res.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!putRes.ok) {
        toast('Upload failed — please try again');
        setPreview(null);
        return;
      }

      await onUploadComplete(res.data.publicUrl);
      toast('Image uploaded');
    } catch {
      toast('Upload failed — please try again');
      setPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleRemove() {
    if (!onRemove) return;
    setRemoving(true);
    try {
      await onRemove();
      setPreview(null);
      toast('Image removed');
    } catch {
      toast('Failed to remove image');
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {displayUrl ? (
        <div className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
            <Image
              src={displayUrl}
              alt="Recipe image"
              fill
              className="object-cover"
              unoptimized={preview !== null}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-sm font-medium text-white">Uploading...</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || removing}
            >
              Replace
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                loading={removing}
                disabled={uploading}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 p-8 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload image'}
        </button>
      )}
    </div>
  );
}
