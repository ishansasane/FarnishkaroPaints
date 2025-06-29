import React, { useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

interface MeasurementSectionProps {
  selections: any[];
  units: string[];
  handleRemoveArea: (index: number) => void;
  handleReferenceChange: (
    mainIndex: number,
    index: number,
    value: string
  ) => void;
  handleunitchange: (mainIndex: number, index: number, value: string) => void;
  handlewidthchange: (mainIndex: number, index: number, value: string) => void;
  handleheightchange: (mainIndex: number, index: number, value: string) => void;
  handlequantitychange: (
    mainIndex: number,
    index: number,
    value: string
  ) => void;
  setSelections: (selections: any[]) => void;
  handleGroupDelete: (mainIndex: number, index: number) => void;
}

const MeasurementSection: React.FC<MeasurementSectionProps> = ({
  selections,
  units,
  handleRemoveArea,
  handleReferenceChange,
  handleunitchange,
  handlewidthchange,
  handleheightchange,
  handlequantitychange,
  setSelections,
  handleGroupDelete,
}) => {
  // Handler for Default Unit change
  const handleDefaultUnitChange = (value: string) => {
    const updatedSelections = selections.map((selection) => ({
      ...selection,
      areacollection: selection.areacollection.map((collection) => ({
        ...collection,
        measurement: {
          ...collection.measurement,
          unit: value,
        },
      })),
    }));
    setSelections(updatedSelections);
  };

  // Determine the default unit value for the select
  const defaultUnit = selections.every((selection) =>
    selection.areacollection.every(
      (collection) =>
        collection.measurement.unit ===
        selections[0]?.areacollection[0]?.measurement.unit
    )
  )
    ? selections[0]?.areacollection[0]?.measurement.unit || ""
    : "";

  return (
    <div className="rounded-lg border shadow-2xl w-full flex flex-col p-2 sm:p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 pl-2 md:pl-4">
        Measurements
      </h2>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex flex-col border rounded-lg w-full sm:w-1/4">
          <p className="pl-2 sm:pl-4 pt-1 sm:pt-2 text-sm sm:text-base">Area</p>
          {selections.map((selection, index) => (
            <div
              key={index}
              className="flex items-center pl-2 sm:pl-4 py-1 sm:py-2"
            >
              <p className="text-sm sm:text-base">{selection.area}</p>
              <button
                className={`${
                  selection.area == "" ? "hidden" : ""
                } !ml-1 sm:!ml-2 !mb-3 text-red-500 hover:text-red-700`}
                onClick={() => handleRemoveArea(index)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <div className="w-full sm:w-3/4 flex flex-col border rounded-lg">
          <div className="flex flex-col sm:flex-row p-2 gap-2 sm:gap-3 items-start sm:items-center">
            <p className="text-sm sm:text-base mt-1 sm:mt-0">Default Unit</p>
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <select
                className="border border-gray-300 p-1 sm:p-2 rounded-lg w-full text-xs sm:text-sm md:text-base focus:ring-2 focus:ring-blue-400"
                value={defaultUnit}
                onChange={(e) => handleDefaultUnitChange(e.target.value)}
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col p-2 sm:p-3 gap-2 sm:gap-4 w-full">
            {selections.map((selection, mainindex) => (
              <div key={mainindex} className="flex flex-col gap-2 w-full">
                <p className="text-base sm:text-lg font-medium">
                  {selection.area}
                </p>
                <div className="flex flex-col gap-2 w-full">
                  {selection.areacollection.map((collection, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row p-1 sm:p-3 border rounded-lg md:gap-3 sm:gap-2 w-full justify-between"
                    >
                      <div className="flex flex-col sm:flex-row w-full sm:gap-2 md:gap-2">
                        <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-1/5">
                          <p className="text-xs sm:text-sm md:text-base">
                            Product Group
                          </p>
                          <input
                            type="text"
                            className="w-full rounded-lg border px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm md:text-base"
                            value={collection.productGroup[0]}
                          />
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-1/5">
                          <p className="text-xs sm:text-sm md:text-base">
                            Reference
                          </p>
                          <input
                            type="text"
                            onChange={(e) =>
                              handleReferenceChange(
                                mainindex,
                                index,
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm md:text-base"
                            value={collection.reference}
                          />
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-1/5">
                          <p className="text-xs sm:text-sm md:text-base">
                            Measurement
                          </p>
                          <select
                            onChange={(e) =>
                              handleunitchange(mainindex, index, e.target.value)
                            }
                            className="border border-gray-300 p-1 sm:p-2 rounded-lg w-full text-xs sm:text-sm md:text-base focus:ring-2 focus:ring-blue-400"
                            value={
                              collection.measurement.unit == undefined
                                ? ""
                                : collection.measurement.unit
                            }
                          >
                            {units.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-1/6">
                          <p className="text-xs sm:text-sm md:text-base">
                            Width
                          </p>
                          <input
                            onChange={(e) =>
                              handlewidthchange(
                                mainindex,
                                index,
                                e.target.value
                              )
                            }
                            type="number"
                            className="w-full rounded-lg border px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm md:text-base"
                            value={collection.measurement.width}
                          />
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-1/6">
                          <p className="text-xs sm:text-sm md:text-base">
                            Height
                          </p>
                          <input
                            onChange={(e) =>
                              handleheightchange(
                                mainindex,
                                index,
                                e.target.value
                              )
                            }
                            type="number"
                            className="w-full rounded-lg border px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm md:text-base"
                            value={collection.measurement.height}
                          />
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2 w-full sm:w-1/6">
                          <p className="text-xs sm:text-sm md:text-base">
                            Quantity
                          </p>
                          <input
                            type="number"
                            onChange={(e) =>
                              handlequantitychange(
                                mainindex,
                                index,
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm md:text-base"
                            value={collection.measurement.quantity}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 sm:gap-2 sm:w-1/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementSection;
