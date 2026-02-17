import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoUploaderProps {
  photoIds: string[];
  onChange: (photoIds: string[]) => void;
}

export default function PhotoUploader({ photoIds, onChange }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotoIds: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create a data URL for the image (base64 encoded)
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Store the data URL as the photo ID
        // In a production app, you would upload to blob storage here
        newPhotoIds.push(dataUrl);
      }

      onChange([...photoIds, ...newPhotoIds]);
      toast.success(`${files.length} photo(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(photoIds.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Upload</CardTitle>
        <CardDescription>Add photos documenting today's work</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {photoIds.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photoIds.map((photoId, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={photoId}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {uploading ? 'Uploading...' : 'Click to upload photos'}
          </p>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="photo-upload"
          />
          <Button type="button" variant="outline" asChild disabled={uploading}>
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Select Photos'}
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
