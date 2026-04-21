import React from 'react';

interface RectangleWithArrowProps {
  width: number;
  height: number; // This is 'depth' in the building plan
}

export const RectangleWithArrow: React.FC<RectangleWithArrowProps> = ({ width = 100, height = 150 }) => {
  // Logic: The calculation code uses Math.max(width, depth) as the dimension across the wind.
  // This means the wind always hits the side such that the larger dimension is perpendicular to it.
  
  const isWidthLarger = width >= height;
  
  // We want the dimension PERPENDICULAR to the wind to be the larger one.
  // In our SVG, wind is horizontal (Left to Right), so it hits the VERTICAL side.
  // Therefore, the vertical side of the rectangle should represent Math.max(width, depth).
  
  const acrossDim = Math.max(width, height);
  const alongDim = Math.min(width, height);
  
  const maxDim = Math.max(acrossDim, alongDim, 1);
  const scale = 120 / maxDim; // Slightly smaller scale to give more room for labels
  
  const dispAcross = acrossDim * scale;
  const dispAlong = alongDim * scale;

  // SVG Viewport sizing - Increased for safety
  const viewBoxWidth = 400;
  const viewBoxHeight = 300;
  const centerX = viewBoxWidth / 2 + 40; 
  const centerY = viewBoxHeight / 2;

  return (
    <div className="w-full flex flex-col items-center justify-center bg-card rounded-xl p-4 border border-border shadow-sm">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full max-w-[450px] h-auto"
      >
        <defs>
          <pattern id="woodPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" className="fill-orange-50/50 dark:fill-orange-900/20" />
            <path d="M0 10h20M10 0v20" className="stroke-orange-100 dark:stroke-orange-900/30" strokeWidth="1" />
            <circle cx="10" cy="10" r="1.5" className="fill-orange-200 dark:fill-orange-800" opacity="0.3" />
          </pattern>
          
          <marker
            id="techArrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
          </marker>

          <marker id="tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="2" />
          </marker>
        </defs>

        {/* --- Wind Indicator --- */}
        <g className="text-green-600 dark:text-green-400">
          <line
            x1="20"
            y1={centerY}
            x2={centerX - dispAlong / 2 - 25}
            y2={centerY}
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 3"
            markerEnd="url(#techArrow)"
          />
          <text
            x="20"
            y={centerY - 20}
            className="text-[14px] font-black fill-current tracking-tighter"
          >
            Wind direction
          </text>
          <text
            x="20"
            y={centerY + 30}
            className="text-[11px] fill-current font-mono font-bold opacity-80"
          >
            Angle of Attack: 0°
          </text>
        </g>

        {/* --- Building Rectangle --- */}
        <rect
          x={centerX - dispAlong / 2}
          y={centerY - dispAcross / 2}
          width={dispAlong}
          height={dispAcross}
          fill="url(#woodPattern)"
          stroke="var(--primary)"
          strokeWidth={2.5}
          rx={3}
        />

        {/* --- Dimensions --- */}

        <g className="text-muted-foreground">
          {/* Across-Wind Dimension (Vertical in SVG) */}
          <line
            x1={centerX + dispAlong / 2 + 35}
            y1={centerY - dispAcross / 2}
            x2={centerX + dispAlong / 2 + 35}
            y2={centerY + dispAcross / 2}
            stroke="currentColor"
            strokeWidth="1.5"
            markerStart="url(#tick)"
            markerEnd="url(#tick)"
          />
          <text
            x={centerX + dispAlong / 2 + 55}
            y={centerY}
            transform={`rotate(90, ${centerX + dispAlong / 2 + 55}, ${centerY})`}
            textAnchor="middle"
            className="fill-foreground text-[13px] font-mono font-bold"
          >
            {`B (Width) = ${width}m`}
          </text>

          {/* Along-Wind Dimension (Horizontal in SVG) */}
          <line
            x1={centerX - dispAlong / 2}
            y1={centerY + dispAcross / 2 + 35}
            x2={centerX + dispAlong / 2}
            y2={centerY + dispAcross / 2 + 35}
            stroke="currentColor"
            strokeWidth="1.5"
            markerStart="url(#tick)"
            markerEnd="url(#tick)"
          />
          <text
            x={centerX}
            y={centerY + dispAcross / 2 + 55}
            textAnchor="middle"
            className="fill-foreground text-[13px] font-mono font-bold"
          >
            {`D (Depth) = ${height}m`}
          </text>
        </g>

        {/* Extension Lines */}
        <g stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-border">
          {/* For D */}
          <line x1={centerX - dispAlong / 2} y1={centerY + dispAcross / 2} x2={centerX - dispAlong / 2} y2={centerY + dispAcross / 2 + 40} />
          <line x1={centerX + dispAlong / 2} y1={centerY + dispAcross / 2} x2={centerX + dispAlong / 2} y2={centerY + dispAcross / 2 + 40} />
          {/* For B */}
          <line x1={centerX + dispAlong / 2} y1={centerY - dispAcross / 2} x2={centerX + dispAlong / 2 + 40} y2={centerY - dispAcross / 2} />
          <line x1={centerX + dispAlong / 2} y1={centerY + dispAcross / 2} x2={centerX + dispAlong / 2 + 40} y2={centerY + dispAcross / 2} />
        </g>
      </svg>
    </div>
  );
};
