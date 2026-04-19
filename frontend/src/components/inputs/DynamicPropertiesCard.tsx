import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";

export default function DynamicPropertiesCard() {
  const { 
    buildingDensity, setBuildingDensity, 
    damping, setDamping, 
    Tacross, setTacross, 
    Talong, setTalong, 
    Ttorsion, setTtorsion 
  } = useInputBuildingContext();

  return (
    <Card className="bg-card border-border border-t-4 border-t-amber-500 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-amber-700">Dynamic Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="density">Density (kg/m³)</Label>
            <Input
              id="density"
              type="number"
              value={buildingDensity}
              onChange={(e) => setBuildingDensity(Number(parseFloat(e.target.value).toFixed(3)))}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="damping">Damping</Label>
            <Input
              id="damping"
              type="number"
              value={damping}
              onChange={(e) => setDamping(Number(parseFloat(e.target.value).toFixed(3)))}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="Talong">T_along (s)</Label>
            <Input
              id="Talong"
              type="number"
              value={Talong}
              onChange={(e) => setTalong(Number(parseFloat(e.target.value).toFixed(3)))}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="Tacross">T_across (s)</Label>
            <Input
              id="Tacross"
              type="number"
              value={Tacross}
              onChange={(e) => setTacross(Number(parseFloat(e.target.value).toFixed(3)))}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="Ttorsion">T_torsion (s)</Label>
            <Input
              id="Ttorsion"
              type="number"
              value={Ttorsion}
              onChange={(e) => setTtorsion(Number(parseFloat(e.target.value).toFixed(3)))}
              className="bg-background border-border"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
