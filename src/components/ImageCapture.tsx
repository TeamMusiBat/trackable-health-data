
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Camera, Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ImageCaptureProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  initialImages?: string[];
}

export const ImageCapture: React.FC<ImageCaptureProps> = ({ 
  onImagesChange, 
  maxImages = 5,
  initialImages = []
}) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const handleCapture = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowCamera(true);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setStream(stream);
          }
        })
        .catch(err => {
          console.error("Error accessing camera: ", err);
          alert("Could not access camera. Please check permissions.");
        });
    } else {
      alert("Camera not supported in this browser");
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        const newImages = [...images, imageDataUrl];
        setImages(newImages);
        onImagesChange(newImages);
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);
    
    if (filesToProcess <= 0) {
      alert(`Maximum of ${maxImages} images allowed`);
      return;
    }
    
    Array.from(files).slice(0, filesToProcess).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImages = [...images, e.target.result.toString()];
          setImages(newImages);
          onImagesChange(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCapture}
          className="flex items-center gap-1"
          disabled={images.length >= maxImages}
        >
          <Camera className="h-4 w-4 mr-1" />
          Capture Photo
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={triggerFileInput}
          className="flex items-center gap-1"
          disabled={images.length >= maxImages}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload Image
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          multiple={maxImages - images.length > 1}
          className="hidden" 
          onChange={handleFileUpload} 
        />
      </div>
      
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            Images ({images.length}/{maxImages})
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Uploaded ${index + 1}`} 
                  className="h-20 w-20 object-cover rounded-md border" 
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Dialog open={showCamera} onOpenChange={closeCamera}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Image</DialogTitle>
            <DialogDescription>
              Position the camera to capture the image
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <video ref={videoRef} className="w-full h-full object-cover" />
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={closeCamera}>
              Cancel
            </Button>
            <Button onClick={takeSnapshot}>
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
