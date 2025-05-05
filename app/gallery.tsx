"use client";
import { DroppableColumn } from "@/components/drag/droppable-wrapper";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { useGalleryHandlers } from "@/hooks/use-drag-handlers";
import { MudboardImage } from "@/types/image-type";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Gallery({
  imgs,
  cols = 8,
}: {
  imgs: MudboardImage[];
  cols?: number;
}) {
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>(
    {}
  );

  const [activeImage, setActiveImage] = useState<MudboardImage | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<"above" | "below">("below");
  const initialPointerYRef = useRef<number | null>(null);

  const [selectedImages, setSelectedImages] = useState<
    Record<string, MudboardImage>
  >({});

  const [columns, setColumns] = useState<MudboardImage[][]>([]);

  // only regenerate "real" columns when backend images change
  const generatedColumns = useMemo(() => {
    const newColumns: MudboardImage[][] = Array.from(
      { length: cols },
      () => []
    );
    imgs.forEach((img, index) => {
      const colIndex = index % cols;
      newColumns[colIndex].push(img);
    });
    return newColumns;
  }, [imgs, cols]);

  // update the fake columns with the real ones if reals ones change
  useEffect(() => {
    setColumns(generatedColumns);
  }, [generatedColumns]);

  useEffect(() => {
    function handleGlobalClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const clickedId = target.closest("[data-id]")?.getAttribute("data-id");

      if (clickedId) {
        // Clicked inside an image or an image container
        console.log("Clicked on image id:", clickedId);
        return;
      }
      // Otherwise clicked somewhere else, clear selections
      console.log("Clicked elsewhere. Clearing", clickedId);
      setSelectedImages({});
    }
    document.body.addEventListener("click", handleGlobalClick);

    return () => {
      document.body.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  // all the drag handlers
  const { handleDragStart, handleDragMove, handleDragEnd, handleImageClick } =
    useGalleryHandlers({
      columns,
      setColumns,
      setActiveImage,
      setOverId,
      setPlacement,
      setSelectedImages,
      initialPointerYRef,
    });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 70,
        tolerance: 5,
      },
    })
  );

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      sensors={sensors}
    >
      <div
        className={`grid gap-4 sm:gap-6 px-2 sm:px-12 ${
          activeImage ? "cursor-grabbing" : "cursor-default"
        }`}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((column, i) => (
          <DroppableColumn key={`col-${i}`} id={`col-${i}`}>
            <SortableContext items={column.map((img) => img.image_id)}>
              {column.map((img) => (
                <div
                  key={img.image_id}
                  data-id={img.image_id}
                  className="flex flex-col"
                >
                  <SortableImageItem id={img.image_id}>
                    <div
                      className={` ${
                        activeImage?.image_id === img.image_id
                          ? "opacity-30"
                          : ""
                      }`}
                    >
                      <div
                        className={`h-2 sm:h-4 transition-all duration-200 ease-in-out ${
                          overId === img.image_id &&
                          placement === "above" &&
                          activeImage?.image_id !== img.image_id
                            ? "border-t-4 border-primary"
                            : ""
                        }`}
                      />
                      {!erroredImages[img.image_id] ? (
                        <Image
                          src={img.fileName}
                          alt={img.description}
                          width={img.width}
                          height={img.height}
                          onClick={(event) => handleImageClick(img, event)}
                          // onDoubleClick={(event) =>
                          //   handleImageDoubleClick(img, event)
                          // }
                          onError={() => {
                            console.error(
                              `Image failed to load: ${img.fileName}`
                            );
                            setErroredImages((prev) => ({
                              ...prev,
                              [img.image_id]: true,
                            }));
                          }}
                          className={`
                          rounded-sm object-cover cursor-pointer shadow-md
                          transition-all duration-200 w-full
                          hover:scale-101 hover:shadow-xl  hover:brightness-105 hover:saturate-110 hover:opacity-100
                          ${
                            Object.keys(selectedImages).length > 0
                              ? selectedImages[img.image_id]
                                ? "outline-6 outline-secondary"
                                : ""
                              : ""
                          }
                        `}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: `${img.width} / ${img.height}`,
                          }}
                          className="bg-zinc-200 border border-zinc-300 rounded-sm shadow-md
                          flex items-center justify-center relative text-center"
                        >
                          <span className="text-zinc-500 text-xs px-2">
                            {img.description || "Image failed to load"}
                          </span>
                        </div>
                      )}
                      <div
                        className={`h-2 sm:h-4 transition-all duration-200 ease-in-out ${
                          overId === img.image_id &&
                          placement === "below" &&
                          activeImage?.image_id !== img.image_id
                            ? "border-b-4 border-primary"
                            : ""
                        }`}
                      />
                    </div>
                  </SortableImageItem>
                </div>
              ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {activeImage ? (
          <Image
            src={activeImage.fileName}
            alt={activeImage.description}
            width={activeImage.width}
            height={activeImage.height}
            className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform 
            duration-200 ease-out scale-105 shadow-xl rotate-1"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
