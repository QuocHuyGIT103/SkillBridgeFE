import React, { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  minValue: number;
  maxValue: number;
  onChange: (minValue: number, maxValue: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step,
  minValue,
  maxValue,
  onChange
}) => {
  const [minVal, setMinVal] = useState(minValue);
  const [maxVal, setMaxVal] = useState(maxValue);
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  // Chuyển đổi sang phần trăm
  const getPercent = (value: number) => {
    return Math.round(((value - min) / (max - min)) * 100);
  };

  // Thiết lập chiều rộng của range
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, maxVal]);

  // Thiết lập vị trí của range khi maxVal thay đổi
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [maxVal]);

  // Cập nhật giá trị khi props thay đổi
  useEffect(() => {
    setMinVal(minValue);
    setMaxVal(maxValue);
  }, [minValue, maxValue]);

  return (
    <div className="relative h-10">
      {/* Thanh nền */}
      <div className="absolute z-10 left-0 right-0 bottom-4 h-1 rounded-md bg-gray-200"></div>
      
      {/* Thanh giữa hai nút */}
      <div 
        ref={range} 
        className="absolute z-20 bottom-4 h-1 bg-blue-500 rounded-md"
      ></div>
      
      {/* Nút kéo tối thiểu */}
      <div
        className="absolute z-30 w-4 h-4 bg-white border-2 border-blue-500 rounded-full bottom-2.5"
        style={{ left: `${getPercent(minVal)}%` }}
      ></div>
      
      {/* Nút kéo tối đa */}
      <div
        className="absolute z-30 w-4 h-4 bg-white border-2 border-blue-500 rounded-full bottom-2.5"
        style={{ left: `${getPercent(maxVal)}%` }}
      ></div>
      
      {/* Input range cho tối thiểu */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, maxVal - step);
          setMinVal(value);
          onChange(value, maxVal);
        }}
        className="absolute bottom-0 h-8 w-full opacity-0 cursor-pointer z-40"
      />
      
      {/* Input range cho tối đa */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, minVal + step);
          setMaxVal(value);
          onChange(minVal, value);
        }}
        className="absolute bottom-0 h-8 w-full opacity-0 cursor-pointer z-40"
      />
    </div>
  );
};

export default RangeSlider;