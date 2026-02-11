export const RectangleWithArrow = ({ width = 200, height = 300 }) => {
    const arrowLength = 60;
    console.log("Width is ",(Math.max(Math.min(height, width) / Math.max(height, width) * 300,100)), width, height);

    return (
        <div className="flex flex-row-reverse gap-2 items-center mt-12 justify-center overflow-x-auto ">
            {/* Container for Rectangle and Labels */}
            <div
                className="relative border-2 border-slate-800 bg-slate-50 rounded-sm min-w-[200px]"
                style={{height: `${300}px`, width: `${Math.max(Math.min(height, width) / Math.max(height, width) * 300,100)}px`}}
            >

                {/* The Rectangle Content */}
                <div className="w-full h-full flex items-center justify-center text-slate-400 italic text-sm">
                    Building
                </div>

            </div>

            {/* Origin Label at the base of the arrow */}

            {/* The Right Arrow (Originates from left) */}
            <svg
                className=" overflow-visible pointer-events-none"
                style={{
                    top: `${20}px`,
                    width: `${60}px`,
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
                    x1="0%"
                    y1="50%"
                    x2="100%"
                    y2="50%" // Small offset so it doesn't overlap the border perfectly
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