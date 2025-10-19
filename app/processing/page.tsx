"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSimpleImageImport } from "@/app/processing/hooks/use-simple-image-import";
import { handleImageFiles } from "@/app/processing/lib/image-handler";
import { useImageStore } from "@/store/home-page/image-store";
import { DragOverlay } from "@/components/ui/drag-overlay";
import { Navbar } from "@/components/ui/navbar";
import Image from "next/image";
import { formatFileSize } from "./lib/utils/format-file-size";
import { SCROLLBAR_STYLE } from "@/types/constants";
import { FaFileExport, FaFileImport } from "react-icons/fa6";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { estimateFileSize, FileSizeEstimate } from "./lib/utils/export-utils";
import { FileSizeEstimateDisplay } from "./components/file-size-estimate-display";
import { ExportFormat } from "./lib/types/exporter-types";
import { FORMAT_OPTIONS } from "./lib/types/image-exporter-constants";
import { exportImages } from "./lib/processing/exporting-helpers";
import { toast } from "sonner";

export default function ImageProcessingPage() {
  const { images, setSelectedImageId } = useImageStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Multi-select state
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  // Export settings
  const [exportFormat, setExportFormat] = useState<ExportFormat>("webp");
  const [quality, setQuality] = useState<number[]>([100]);
  const [isExporting, setIsExporting] = useState(false);

  // const selectedImage = images.find((img) => img.id === selectedImageId);

  function triggerImagePicker() {
    inputRef.current?.click();
  }

  // Multi-select handlers
  function handleImageClick(
    e: React.MouseEvent,
    imageId: string,
    index: number
  ) {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + click: toggle selection
      setSelectedImageIds((prev) => {
        if (prev.includes(imageId)) {
          return prev.filter((id) => id !== imageId);
        } else {
          return [...prev, imageId];
        }
      });
      setLastSelectedIndex(index);
    } else if (e.shiftKey && lastSelectedIndex !== -1) {
      // Shift + click: select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = images.slice(start, end + 1).map((img) => img.id);

      setSelectedImageIds((prev) => {
        const newSelection = [...new Set([...prev, ...rangeIds])];
        return newSelection;
      });
    } else {
      // Regular click: single selection
      setSelectedImageIds([imageId]);
      setLastSelectedIndex(index);
      setSelectedImageId(imageId);
    }
  }

  // function handleRemoveSelected() {
  //   if (selectedImageIds.length === 0) return;

  //   const confirmMessage =
  //     selectedImageIds.length === 1
  //       ? "Are you sure you want to delete this image?"
  //       : `Are you sure you want to delete ${selectedImageIds.length} images?`;

  //   if (window.confirm(confirmMessage)) {
  //     selectedImageIds.forEach((id) => removeImage(id));
  //     setSelectedImageIds([]);
  //     setLastSelectedIndex(-1);

  //     // Select the first remaining image
  //     const remainingImages = images.filter(
  //       (img) => !selectedImageIds.includes(img.id)
  //     );
  //     if (remainingImages.length > 0) {
  //       const firstImage = remainingImages[0];
  //       setSelectedImageId(firstImage.id);
  //       setSelectedImageIds([firstImage.id]);
  //       setLastSelectedIndex(0);
  //     }
  //   }
  // }

  // Export functions
  async function handleExport() {
    if (selectedImageIds.length === 0) return;

    setIsExporting(true);

    try {
      await exportImages(images, selectedImageIds, {
        format: exportFormat,
        quality: quality[0],
      });
      toast.success(`Successfully exported ${selectedImageIds.length} images!`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  // async function generateBlurhash() {
  //   if (selectedImageIds.length === 0) return;

  //   try {
  //     const selectedImages = images.filter((img) =>
  //       selectedImageIds.includes(img.id)
  //     );
  //     const blurhashes: string[] = [];

  //     for (const image of selectedImages) {
  //       const img = new window.Image();
  //       img.crossOrigin = "anonymous";

  //       await new Promise<void>((resolve, reject) => {
  //         img.onload = async () => {
  //           try {
  //             const blurhash = await generateBlurhashFromImage(img);
  //             blurhashes.push(blurhash);
  //             resolve();
  //           } catch (error) {
  //             reject(error);
  //           }
  //         };
  //         img.onerror = () => reject(new Error("Failed to load image"));
  //         img.src = image.preview;
  //       });
  //     }

  //     const result = blurhashes.join("\n");
  //     await navigator.clipboard.writeText(result);
  //     alert(
  //       `Generated blurhashes copied to clipboard!\n\n${blurhashes.join("\n")}`
  //     );
  //   } catch (error) {
  //     console.error("Blurhash generation failed:", error);
  //     alert("Blurhash generation failed. Please try again.");
  //   }
  // }

  function getEstimatedFileSize(): FileSizeEstimate[] {
    return estimateFileSize(images, selectedImageIds, {
      format: exportFormat,
      quality: quality[0],
    });
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

      <div className="mx-auto flex-1  flex mt-28 mb-16 px-4 ">
        <div className="flex flex-col gap-6 items-center">
          {/* Header */}
          <div className="mb-2 text-center">
            <h1 className="text-4xl font-bold ">Image Converter</h1>
            <p className="">Upload your images and convert them to whatever.</p>
          </div>

          {/*Image List */}
          {images.length !== 0 ? (
            <div className="flex  flex-col lg:flex-row gap-8 bg-off-white rounded-lg shadow-sm border px-4 lg:px-6 py-6 max-w-4xl">
              <div className="flex flex-col justify-between ">
                <div>
                  <div className="flex items-start w-64 justify-between mb-16">
                    <h2 className="text-xl font-semibold ">
                      {selectedImageIds.length} selected
                    </h2>

                    <div className="flex flex-col gap-2 items-end">
                      <Button
                        onClick={triggerImagePicker}
                        variant={"outline_primary"}
                        className="text-sm font-header font-semibold"
                      >
                        <FaFileImport className="w-4 h-4" />
                        Import
                      </Button>
                      {/* <button
                        onClick={handleRemoveSelected}
                        className="flex items-center font-header font-semibold cursor-pointer gap-1 
                      hover:text-rose-500 text-sm transition-colors duration-300 mr-1"
                      >
                        <FaTrash />
                        Delete ({selectedImageIds.length})
                      </button> */}
                    </div>
                  </div>
                </div>

                <div>
                  {selectedImageIds.length !== 0 && (
                    <div className="flex flex-col ">
                      {/* Format Selection */}
                      <div className="flex flex-row items-center gap-4 mb-2">
                        <label className="text-sm font-medium font-header block">
                          Format:
                        </label>
                        <Select
                          value={exportFormat}
                          onValueChange={(value) =>
                            setExportFormat(value as ExportFormat)
                          }
                        >
                          <SelectTrigger
                            className="w-full border-accent/60 border-2 hover:bg-accent/20
                      duration-200 rounded-md py-1"
                          >
                            <SelectValue placeholder="Select format" />
                            {/* <FaCaretDown /> */}
                          </SelectTrigger>
                          <SelectContent>
                            {FORMAT_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quality Slider - Hidden for PNG (lossless format) */}
                      {exportFormat !== "png" && (
                        <div className="mb-8">
                          <label className="text-sm font-header font-medium mb-2 block">
                            Quality: {quality[0]}%
                          </label>
                          <Slider
                            value={quality}
                            onValueChange={setQuality}
                            max={100}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* File Size Estimation */}
                      <div className="mb-2">
                        <FileSizeEstimateDisplay
                          estimates={getEstimatedFileSize()}
                        />
                      </div>

                      {/* Export Button */}

                      {/* Blurhash Generator */}
                      {/* <button
                      onClick={generateBlurhash}
                      disabled={selectedImageIds.length === 0}
                      className="w-full font-header flex items-center text-sm cursor-pointer hover:underline
                       justify-center gap-2"
                    >
                      <Hash className="w-4 h-4" />
                      Copy Blurhash
                    </button> */}
                    </div>
                  )}

                  <Button
                    onClick={handleExport}
                    disabled={selectedImageIds.length === 0 || isExporting}
                    className="w-full text-xl font-header flex items-center justify-center 
                      gap-2 bg-accent/90 hover:bg-accent text-primary py-3 mb-2"
                  >
                    <FaFileExport />
                    {isExporting
                      ? "Exporting..."
                      : `Export ${selectedImageIds.length} Image${
                          selectedImageIds.length !== 1 ? "s" : ""
                        }`}
                  </Button>
                </div>
              </div>
              <div
                className={`flex flex-col w-full  lg:w-[450px] gap-2 max-h-[500px] overflow-y-auto px-2 ${SCROLLBAR_STYLE}`}
              >
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`p-2 rounded-lg border-4 cursor-pointer transition-all ${
                      selectedImageIds.includes(image.id)
                        ? "border-accent bg-accent/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={(e) => handleImageClick(e, image.id, index)}
                  >
                    <div className="flex items-center select-none gap-3">
                      <Image
                        src={image.preview}
                        alt={image.originalFile.name}
                        width={image.width}
                        height={image.height}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-slate-800 truncate">
                          {image.originalFile.name}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs text-primary">
                          <span>{formatFileSize(image.originalFile.size)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            {image.width}×{image.height}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            {image.originalFile.type
                              .split("/")[1]
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-off-white rounded-md mx-auto">
              {/* <>
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
            </> */}
              <div className="flex flex-col items-center justify-center ">
                <div
                  className="w-fit h-fit my-8 flex flex-col items-center select-none
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
            </div>
          )}
        </div>
      </div>
      {fileInput}
      <DragOverlay dragCount={dragCount} />
    </div>
  );
}
