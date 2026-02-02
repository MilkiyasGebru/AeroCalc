export const RectangleWithArrow = ({ width = 300, height = 200 }) => {
    const arrowLength = 60;

    return (
        <div className="flex flex-col items-center mt-12 ">
            {/* Container for Rectangle and Labels */}
            <div
                className="relative border-2 border-slate-800 bg-slate-50 rounded-sm"
                style={{width: `${300}px`, height: `${(Math.min(height, width) / Math.max(height, width)) * 300}px`}}
            >
                {/* Width Label (Top) */}
                <div className="absolute -top-7 left-0 w-full flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Width: {Math.max(width, height)}meters
                  </span>
                    <div className="w-full h-[1px] bg-slate-300 mt-1"></div>
                </div>

                {/* Height Label (Left) */}
                <div className="absolute -left-10 top-0 h-full flex items-center">
                  <span
                      className="text-xs font-bold text-slate-600 uppercase tracking-wider -rotate-90 whitespace-nowrap"
                  >
                    Depth: {Math.min(height, width)} meters
                  </span>
                </div>

                {/* The Rectangle Content */}
                <div className="w-full h-full flex items-center justify-center text-slate-400 italic text-sm">
                    Building
                </div>

            </div>

            {/* Origin Label at the base of the arrow */}

            {/* The Upward Arrow (Originates from below) */}
            <svg
                className=" overflow-visible pointer-events-none"
                style={{
                    top: `${height}px`,
                    width: `${width}px`,
                    height: `${arrowLength}px`
                }}
            >
                <defs>
                    <marker
                        id="arrowhead-up"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" className="fill-blue-600"/>
                    </marker>
                </defs>

                <line
                    x1="50%"
                    y1={arrowLength}
                    x2="50%"
                    y2="4" // Small offset so it doesn't overlap the border perfectly
                    className="stroke-blue-600"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead-up)"
                />
            </svg>
            <div
                className="text-xs font-black text-blue-600 uppercase mt-[10px]"
            >
                Wind Direction
            </div>
        </div>
    );
};