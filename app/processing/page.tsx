"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { useSimpleImageImport } from "@/app/processing/hooks/use-simple-image-import";
import { handleImageFiles } from "@/app/processing/lib/image-handler";
import { useImageStore } from "@/store/home-page/image-store";
import { DragOverlay } from "@/components/ui/drag-overlay";
import { Navbar } from "@/components/ui/navbar";
import Image from "next/image";
import { formatFileSize } from "./lib/utils/format-file-size";

export default function ImageProcessingPage() {
  const { images, selectedImageId, setSelectedImageId, removeImage } =
    useImageStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedImage = images.find((img) => img.id === selectedImageId);

  function triggerImagePicker() {
    inputRef.current?.click();
  }

  // Use the simplified image import hook
  const { dragCount } = useSimpleImageImport();

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
          handleImageFiles(Array.from(files));
        }
      }}
    />
  );

  return (
    <div className="min-h-screen bg-canvas-background-light text-primary flex flex-col relative">
      <Navbar color="brown" />

      <div className="mx-auto flex-1 items-center flex mt-24 mb-16 lg:my-0">
        <div className="flex flex-col gap-6 items-center">
          {/* Header */}
          <div className="mb-2 text-center">
            <h1 className="text-4xl font-bold ">Image Converter</h1>
            <p className="">Upload your images and convert them to whatever.</p>
          </div>

          {/* Right Panel - Image Viewer */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="p-6 bg-off-white rounded-md mx-auto">
              {selectedImage ? (
                <>
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    Image Preview
                  </h2>
                  <div className="flex flex-col items-center  max-w-md max-h-md">
                    <Image
                      src={selectedImage.preview}
                      alt={selectedImage.originalFile.name}
                      width={selectedImage.width}
                      height={selectedImage.height}
                      className="rounded border"
                    />
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-medium text-slate-800">
                        {selectedImage.originalFile.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {formatFileSize(selectedImage.originalFile.size)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center ">
                  <div
                    className="w-fit h-fit flex flex-col items-center select-none
                          opacity-80 z-10 hover:opacity-100 transition-all duration-200 cursor-pointer "
                    onClick={() => triggerImagePicker()}
                  >
                    <Image
                      src={"/1.png"}
                      alt="No images yet"
                      width={375}
                      height={150}
                      draggable={false}
                    />
                    <h3 className="text-sm">
                      No Images Yet! Drag one in or click here to add.
                    </h3>
                  </div>
                </div>
              )}
            </div>

            {/*Image List */}
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
                          {formatFileSize(image.originalFile.size)}
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
        </div>
      </div>
      <DragOverlay dragCount={dragCount} />
    </div>
  );
}
