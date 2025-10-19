"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import Logo from "@/components/ui/logo";
import { useSimpleImageImport } from "@/app/processing/hooks/use-simple-image-import";

interface ProcessedImage {
  id: string;
  originalFile: File;
  preview: string;
}

export default function ImageProcessingPage() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedImage = images.find((img) => img.id === selectedImageId);

  function triggerImagePicker() {
    inputRef.current?.click();
  }

  const handleImage = useCallback(
    async (files: File[]) => {
      const newImages: ProcessedImage[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);

        newImages.push({
          id,
          originalFile: file,
          preview,
        });
      }

      setImages((prev) => [...prev, ...newImages]);
      if (newImages.length > 0 && !selectedImageId) {
        setSelectedImageId(newImages[0].id);
      }
      toast.success(`Added ${newImages.length} image(s)`);
    },
    [selectedImageId]
  );

  // Use the simplified image import hook
  const { dragCount } = useSimpleImageImport({
    handleImage,
  });

  const removeImage = useCallback(
    (imageId: string) => {
      setImages((prev) => {
        const newImages = prev.filter((img) => img.id !== imageId);
        if (selectedImageId === imageId) {
          setSelectedImageId(newImages.length > 0 ? newImages[0].id : null);
        }
        return newImages;
      });
    },
    [selectedImageId]
  );

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={(e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          handleImage(Array.from(files));
        }
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 relative">
      <div className="absolute top-4 left-6">
        <Logo color="brown" enforceHome={true} />
      </div>

      <div className="max-w-7xl mx-auto mt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Image Viewer
          </h1>
          <p className="text-slate-600">Upload and view your images</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Image List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Images</h2>
                <Button
                  onClick={triggerImagePicker}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </div>

              {fileInput}

              <div className="space-y-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedImageId === image.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedImageId(image.id)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={image.preview}
                        alt={image.originalFile.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {image.originalFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(image.originalFile.size / 1024 / 1024).toFixed(1)}{" "}
                          MB
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="px-2 py-1 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {images.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No images uploaded yet</p>
                  <p className="text-sm">Click upload to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Image Viewer */}
          <div className="lg:col-span-2">
            {selectedImage ? (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Image Preview
                </h2>
                <div className="flex flex-col items-center">
                  <img
                    src={selectedImage.preview}
                    alt={selectedImage.originalFile.name}
                    className="max-w-full max-h-96 object-contain rounded border"
                  />
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-medium text-slate-800">
                      {selectedImage.originalFile.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {(selectedImage.originalFile.size / 1024 / 1024).toFixed(
                        1
                      )}{" "}
                      MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-600 mb-2">
                  No Image Selected
                </h2>
                <p className="text-slate-500">
                  Select an image from the left panel to view it
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drag overlay */}
        {dragCount !== null && (
          <div className="fixed inset-0 bg-accent/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-dashed border-accent">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-2xl font-semibold text-primary mb-1">
                  Drop {dragCount} image{dragCount > 1 ? "s" : ""} here
                </h3>
                <p className="text-primary text-sm">
                  Release to add {dragCount > 1 ? "them" : "it"} to your
                  collection
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
