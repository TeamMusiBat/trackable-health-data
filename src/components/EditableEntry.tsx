
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit2, Save, X } from 'lucide-react';
import { ImageCapture } from './ImageCapture';

interface EditableEntryProps<T> {
  data: T;
  onSave: (updatedData: Partial<T>) => void;
  fieldConfig: {
    name: keyof T;
    label: string;
    type: 'text' | 'number' | 'images';
    readOnly?: boolean;
  }[];
  title: string;
}

export function EditableEntry<T>({ data, onSave, fieldConfig, title }: EditableEntryProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>({}); 

  const handleEdit = () => {
    setFormData({ ...data });
    setIsEditing(true);
  };

  const handleChange = (name: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleEdit}>
        <Edit2 className="h-4 w-4 mr-1" />
        Edit
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit {title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {fieldConfig.map((field) => (
              <div key={field.name as string} className="grid gap-2">
                <Label htmlFor={field.name as string}>{field.label}</Label>
                
                {field.type === 'images' ? (
                  <ImageCapture
                    initialImages={formData[field.name] as string[] || []}
                    onImagesChange={(images) => handleChange(field.name, images)}
                  />
                ) : (
                  <Input 
                    id={field.name as string}
                    name={field.name as string}
                    type={field.type}
                    value={formData[field.name] as string}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    disabled={field.readOnly}
                  />
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
