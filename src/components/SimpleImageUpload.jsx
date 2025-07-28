// components/SimpleImageUpload.jsx
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X } from "lucide-react"

export function SimpleImageUpload({ onImageSelect, disabled }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = {
          file,
          name: file.name,
          dataUrl: e.target.result
        }
        setSelectedImage(imageData)
        onImageSelect?.(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    onImageSelect?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
        disabled={disabled}
      />

      {!selectedImage ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <ImagePlus className="h-4 w-4" />
          Add Image
        </Button>
      ) : (
        <div className="relative inline-block">
          <img
            src={selectedImage.dataUrl}
            alt={selectedImage.name}
            className="h-20 w-20 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}