import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";
import { useEffect, useState } from "react";
// import MeanSpeedGraph from "@/components/MeanSpeedGraph";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface IMeanSpeedData {
  height: number;
  speed: number;
}

export default function WindClimateCard() {
  const { height, meanSpeed, setMeanSpeed, terrain, setTerrain, userMeanSpeed, setUserMeanSpeed } = useInputBuildingContext();
  const [_, setGraphData] = useState<IMeanSpeedData[]>([]);

  const coefficient = (height !== undefined && meanSpeed !== undefined)
    ? (terrain === "open" ? (height / 10) ** 0.28 : 0.5 * ((height / 12.7) ** 0.5))
    : 0;

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Number.isFinite(height) && Number.isFinite(meanSpeed) && height != undefined && meanSpeed != undefined) {
        const MaxHeight = height * 1.5;
        const data = [];
        let h = 0;
        while (h < MaxHeight) {
          const c = (terrain === "open") ? (h / 10) ** 0.28 : 0.5 * ((h / 12.7) ** 0.5);
          data.push({
            height: h,
            speed: meanSpeed * c ** 0.5
          });
          h += 1;
        }
        setGraphData(data);
        setUserMeanSpeed(Number((meanSpeed * coefficient ** 0.5).toFixed(2)));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [terrain, height, meanSpeed, coefficient, setUserMeanSpeed]);

  return (
    <Card className="bg-card border-border border-t-4 border-t-teal-500 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-teal-700">Local wind climate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="terrain">Terrain category</Label>
          <Select value={terrain} onValueChange={setTerrain}>
            <SelectTrigger id="terrain" className="bg-background border-border">
              <SelectValue placeholder="Select terrain" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground">
              <SelectGroup>
                <SelectLabel>Terrain</SelectLabel>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="rough">Rough</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meanSpeed">10 minutes average wind speed at 10 m (m/s)</Label>
          <Input
            id="meanSpeed"
            type="number"
            value={meanSpeed}
            onChange={(e) => setMeanSpeed(Number(parseFloat(e.target.value).toFixed(2)))}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="userMeanSpeed">10 minutes average wind speed at roof (m/s)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Calculated based on terrain and height. You can override this value manually.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="userMeanSpeed"
            type="number"
            value={userMeanSpeed}
            onChange={(e) => setUserMeanSpeed(Number(parseFloat(e.target.value).toFixed(2)))}
            className="bg-background border-border"
          />
        </div>
      </CardContent>
    </Card>
  );
}
