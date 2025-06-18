// tooltip. with text. nice

"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaQuestionCircle } from "react-icons/fa";

export default function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <FaQuestionCircle className="size-4 text-primary translate-y-[1px] cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-md font-medium leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
