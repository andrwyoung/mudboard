"use client";
import { DroppableColumn } from "@/components/drag/droppable-wrapper";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { ImageType } from "@/types/image-type";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
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
  cols = 3,
}: {
  imgs: ImageType[];
  cols?: number;
}) {
  const [activeImage, setActiveImage] = useState<ImageType | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<"above" | "below">("below");
  const initialPointerYRef = useRef<number | null>(null);

  const [selectedImages, setSelectedImages] = useState<
    Record<string, ImageType>
  >({});

  const [debugMessage, setDebugMessage] = useState("");

  const [columns, setColumns] = useState<ImageType[][]>([]);

  // only regenerate "real" columns when backend images change
  const generatedColumns = useMemo(() => {
    const newColumns: ImageType[][] = Array.from({ length: cols }, () => []);
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

  // SECTION: handling dragging
  //
  //

  function handleDragEnd(event: DragEndEvent) {
    document.body.classList.remove("cursor-grabbing");
    setDebugMessage("drag ended");

    setActiveImage(null);
    initialPointerYRef.current = null; // Reset here!
    setOverId(null);

    const { active, over } = event;

    setActiveImage(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // find column to drop into
    const fromColumnIndex = columns.findIndex((col) =>
      col.some((img) => img.id === activeId)
    );

    let toColumnIndex = -1;
    if (String(overId).startsWith("col-")) {
      toColumnIndex = Number(String(overId).replace("col-", ""));
    } else {
      toColumnIndex = columns.findIndex((col) =>
        col.some((img) => img.id === overId)
      );
    }
    if (fromColumnIndex === -1 || toColumnIndex == -1) return;

    // set up clones so we can mutate it
    const newColumns = [...columns];
    const fromCol = [...newColumns[fromColumnIndex]];
    const toCol = [...newColumns[toColumnIndex]];

    // find the dragged image
    const movingItemIndex = fromCol.findIndex((img) => img.id === activeId);
    const [movingItem] = fromCol.splice(movingItemIndex, 1);
    // find target index
    const overIndex = toCol.findIndex((img) => img.id === overId);

    if (fromColumnIndex === toColumnIndex) {
      // Moving within the same column
      let insertIndex = overIndex;
      if (insertIndex === -1) {
        insertIndex = fromCol.length;
      }
      fromCol.splice(insertIndex, 0, movingItem);
      newColumns[fromColumnIndex] = fromCol;
    } else {
      // Moving across columns
      if (String(overId).startsWith("col-")) {
        toCol.push(movingItem);
      } else if (overIndex === -1) {
        toCol.push(movingItem);
      } else {
        if (placement === "below") {
          toCol.splice(overIndex + 1, 0, movingItem);
        } else {
          toCol.splice(overIndex, 0, movingItem);
        }
      }
      newColumns[fromColumnIndex] = fromCol;
      newColumns[toColumnIndex] = toCol;
    }

    // update columns
    setColumns(newColumns);

    console.log(
      "drag done from col: ",
      fromCol,
      "toCol: ",
      toCol,
      "fromColumnIndex: ",
      fromColumnIndex,
      "toColumnIndex: ",
      toColumnIndex
    );
  }

  function handleDragStart(event: DragStartEvent) {
    document.body.classList.add("cursor-grabbing");
    setSelectedImages({});

    setDebugMessage("drag starting");
    const { active, activatorEvent } = event;
    const activeImage = columns.flat().find((img) => img.id === active.id);
    if (activeImage) {
      setActiveImage(activeImage);
    }

    if (activatorEvent instanceof MouseEvent) {
      initialPointerYRef.current = activatorEvent.clientY;
    } else if (activatorEvent instanceof TouchEvent) {
      initialPointerYRef.current = activatorEvent.touches[0]?.clientY ?? null;
    }
  }

  function handleDragMove(event: DragMoveEvent) {
    const { delta, over } = event;
    setDebugMessage("drag move");

    if (!over) {
      setOverId(null);
      return;
    }

    if (initialPointerYRef.current !== null) {
      const currentPointerY = initialPointerYRef.current + delta.y;

      const overElement = document.querySelector(`[data-id="${over.id}"]`);
      if (overElement) {
        const rect = overElement.getBoundingClientRect();
        const middleY = rect.top + rect.height / 2;

        if (currentPointerY < middleY) {
          setPlacement("above");
        } else {
          setPlacement("below");
        }
      }
      setOverId(String(over.id));
    }
  }

  // SECTION handling click
  function handleImageClick(
    img: ImageType,
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) {
    if (event.detail === 2) {
      // DOUBLE CLICK detected!
      console.log("Double clicked:", img);
      // TODO: Handle double click behavior here
      return;
    }
    console.log("Single click:", img);

    setSelectedImages((prevSelected) => {
      const newSelected = { ...prevSelected };

      if (event.metaKey || event.ctrlKey) {
        // Cmd (Mac) or Ctrl (Windows): Toggle selection
        if (newSelected[img.id]) {
          delete newSelected[img.id]; // Deselect
        } else {
          newSelected[img.id] = img; // Select
        }
        return newSelected;
      } else {
        // Regular click: Replace selection with just this image
        if (newSelected[img.id] && Object.entries(newSelected).length === 1) {
          return {};
        }
        return { [img.id]: img };
      }
    });
  }

  // function handleImageDoubleClick(
  //   img: ImageType,
  //   event: React.MouseEvent<HTMLImageElement, MouseEvent>
  // ) {
  //   console.log("Double clicked:", img);
  //   // TODO: Open fullscreen view? Open modal? Focus view? etc.
  // }

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
        className={`flex flex-row gap-4 sm:gap-6 px-2 sm:px-6 ${
          activeImage ? "cursor-grabbing" : "cursor-default"
        }`}
      >
        {columns.map((column, i) => (
          <DroppableColumn key={`col-${i}`} id={`col-${i}`}>
            <SortableContext items={column.map((img) => img.id)}>
              {column.map((img) => (
                <div key={img.id} data-id={img.id} className="flex flex-col">
                  <SortableImageItem id={img.id}>
                    <div
                      className={` ${
                        activeImage?.id === img.id ? "opacity-30" : ""
                      }`}
                    >
                      <div
                        className={`h-2 sm:h-4 transition-all duration-200 ease-in-out ${
                          overId === img.id &&
                          placement === "above" &&
                          activeImage?.id !== img.id
                            ? "border-t-4 border-primary"
                            : ""
                        }`}
                      />
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        onClick={(event) => handleImageClick(img, event)}
                        // onDoubleClick={(event) =>
                        //   handleImageDoubleClick(img, event)
                        // }
                        className={`
                          rounded-sm object-cover cursor-pointer shadow-md
                          transition-all duration-200
                          hover:scale-101 hover:shadow-xl  hover:brightness-105 hover:saturate-110 hover:opacity-100
                          ${
                            Object.keys(selectedImages).length > 0
                              ? selectedImages[img.id]
                                ? "outline-4 outline-primary"
                                : "opacity-80"
                              : ""
                          }
                        `}
                      />
                      <div
                        className={`h-2 sm:h-4 transition-all duration-200 ease-in-out ${
                          overId === img.id &&
                          placement === "below" &&
                          activeImage?.id !== img.id
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
            src={activeImage.src}
            alt={activeImage.alt}
            width={activeImage.width}
            height={activeImage.height}
            className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform 
            duration-200 ease-out scale-105 shadow-xl rotate-1"
          />
        ) : null}
      </DragOverlay>
      <div className="absolute top-4 left-4">
        {debugMessage} <br />
        {placement} <br />
        overId: {overId}
      </div>
    </DndContext>
  );
}
