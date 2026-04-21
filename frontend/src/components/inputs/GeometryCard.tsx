import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";
// import { RectangleWithArrow } from "@/components/RectangleWithArrow";

export default function GeometryCard() {
  const { width, height, depth, totalFloors, setWidth, setHeight, setDepth, setTotalFloors } = useInputBuildingContext();

  return (
    <Card className="bg-card border-border border-t-4 border-t-indigo-500 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-indigo-700">Building geometry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width (m)</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(parseFloat(e.target.value).toFixed(2)))}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="depth">Depth (m)</Label>
            <Input
              id="depth"
              type="number"
              value={depth}
              onChange={(e) => setDepth(Number(parseFloat(e.target.value).toFixed(2)))}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (m)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(parseFloat(e.target.value).toFixed(2)))}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalFloors">Number of floors</Label>
            <Input
              id="totalFloors"
              type="number"
              value={totalFloors}
              onChange={(e) => setTotalFloors(parseFloat(e.target.value))}
              className="bg-background border-border"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
