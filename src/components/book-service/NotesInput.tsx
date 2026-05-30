import * as React from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotesInputProps {
  notes: string;
  setNotes: (n: string) => void;
  photos: string[];
  setPhotos: (p: string[]) => void;
}

export function NotesInput({ notes, setNotes, photos, setPhotos }: NotesInputProps) {
  // Simulate photo upload
  const handleSimulateUpload = () => {
    if (photos.length < 3) {
      setPhotos([...photos, `https://picsum.photos/seed/${Math.random()}/200/200`]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2 ml-1">Additional Notes (Optional)</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="E.g., Water is tasting slightly bitter..."
          className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-[#0F4C81] outline-none transition-all resize-none"
        />
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2 ml-1">Upload Photos (Max 3)</h3>
        <div className="flex gap-3 flex-wrap">
          {photos.map((photo, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
              <img src={photo} alt="Upload" className="w-full h-full object-cover" />
              <button 
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 active:scale-90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {photos.length < 3 && (
            <button
              onClick={handleSimulateUpload}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-[#00B8A9] hover:bg-[#00B8A9]/5 transition-all"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-semibold uppercase">Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
