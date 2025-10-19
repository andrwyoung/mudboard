import React from "react";
import { FileSizeEstimate } from "../lib/utils/export-utils";
import { formatFileSize } from "../lib/utils/format-file-size";
import { FaArrowRight } from "react-icons/fa6";

export function FileSizeEstimateDisplay({
  estimates,
}: {
  estimates: FileSizeEstimate[];
}) {
  const totalOriginal = estimates.reduce(
    (sum, est) => sum + est.originalSize,
    0
  );
  const totalEstimated = estimates.reduce(
    (sum, est) => sum + est.estimatedSize,
    0
  );
  const totalReduction =
    ((totalOriginal - totalEstimated) / totalOriginal) * 100;
  const isTotalReduction = totalReduction > 0;
  const isTotalSame = Math.abs(totalReduction) < 0.1; // Consider < 0.1% as "same"

  return (
    <div className="p-3 bg-slate-50 rounded-md">
      <h4 className="text-sm font-header font-bold mb-2">
        File Size Estimates:
      </h4>
      <div className="flex flex-col gap-2">
        {estimates.map((estimate, index) => {
          //   const reduction =
          //     ((estimate.originalSize - estimate.estimatedSize) /
          //       estimate.originalSize) *
          //     100;
          //   const isReduction = reduction > 0;
          //   const isSame = Math.abs(reduction) < 0.1; // Consider < 0.1% as "same"
          //   const reductionText = isSame
          //     ? "same"
          //     : isReduction
          //     ? `-${reduction.toFixed(1)}%`
          //     : `+${Math.abs(reduction).toFixed(1)}%`;

          return (
            <div
              key={index}
              className="text-xs text-slate-600 flex flex-row w-full justify-between"
            >
              {/* <span
                className="truncate flex-1 mr-2 opacity-80"
                title={estimate.filename}
              >
                {estimate.filename}
              </span>
              <div className="flex flex-row w-full justify-between">
                <div className="ml-4 flex items-center gap-1 ">
                  <span className="font-semibold">
                    {formatFileSize(estimate.originalSize)}
                  </span>
                  <FaArrowRight className="text-xs" />
                  <span className="font-semibold">
                    {formatFileSize(estimate.estimatedSize)}
                  </span>
                </div>

                <span
                  className={`ml-1 ${
                    isReduction ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ({reductionText})
                </span>
              </div> */}

              <span
                className="truncate flex-1 mr-2 opacity-80"
                title={estimate.filename}
              >
                {estimate.filename}
              </span>
              <div className="flex flex-row">
                <div className="ml-4 flex items-center gap-1 ">
                  <span className="">
                    {formatFileSize(estimate.originalSize)}
                  </span>
                  <FaArrowRight className="text-xs" />
                  <span className="">
                    {formatFileSize(estimate.estimatedSize)}
                  </span>
                </div>
                {/* 
                <span
                  className={`ml-1 ${
                    isReduction ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ({reductionText})
                </span> */}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200 w-full">
        <div className="flex flex-col w-full gap-1 items-end">
          <div className="flex flex-row w-full justify-between">
            <h5 className="font-header text-xs">
              Total ({estimates.length} file{estimates.length !== 1 ? "s" : ""}
              ):
            </h5>
            <span
              className={`ml-2 font-semibold ${
                isTotalSame
                  ? "text-slate-500"
                  : isTotalReduction
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatFileSize(
                estimates.reduce((sum, est) => sum + est.estimatedSize, 0)
              )}{" "}
              (
              {isTotalSame
                ? "same"
                : isTotalReduction
                ? `-${totalReduction.toFixed(1)}%`
                : `+${Math.abs(totalReduction).toFixed(1)}%`}
              )
            </span>
          </div>

          {/* <span className="flex flex-row items-center font-semibold">
            {formatFileSize(
              estimates.reduce((sum, est) => sum + est.originalSize, 0)
            )}

            <FaArrowRight className="text-xs mx-1" />
            {formatFileSize(
              estimates.reduce((sum, est) => sum + est.estimatedSize, 0)
            )}
          </span> */}
        </div>
      </div>
    </div>
  );
}
