import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {useEffect, useMemo, useState} from "react";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import { Loader2, BookMarked } from "lucide-react"
import { getWindTunnelSource } from "@/lib/windTunnelSources";

interface InternalDatabaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (selection: string) => void;
}
interface IResponse {
    id: number;
    width: number;
    depth: number;
    height: number;
    terrain: string;
    url: string;
    frequency: number;
    meanspeed: number;
}

export function InternalDatabaseDialog({ open, onOpenChange, onConfirm }: InternalDatabaseDialogProps) {
    const [value, setValue] = useState<string>("");
    const { width, height, depth} = useInputBuildingContext();
    const [options, setOptions] = useState<IResponse[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const {setExperimentalFrequency, setSelectedBuilding, setExperimentalMeanSpeed, setSelectedBuildingSource, setSelectedBuildingSourceLink} = useInputBuildingContext()

    const selectedOption = useMemo(() => options.find(option => option.url === value) ?? null, [options, value]);
    const selectedSource = selectedOption ? getWindTunnelSource(selectedOption.id) : null;

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        fetch("https://aerocalc-szin.onrender.com/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                width,
                depth,
                height,
            })
        }).then(result => {
            return result.json();
        } ).then(json_result => {
            setLoading(false)
            setOptions(json_result);
        }).catch(() => {
            setLoading(false);
        })
    }, [open, width, height, depth])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
             <DialogContent className="sm:max-w-[425px] bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="text-primary font-bold text-xl">Internal Wind Database</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Select from the building configurations closest to your input.
                    </DialogDescription>
                </DialogHeader>
                 {!loading &&
                <div className="grid gap-4 py-4">
                    <Select onValueChange={setValue}>
                        <SelectTrigger className="w-full bg-background border-border">
                            <SelectValue placeholder="Select experimental data..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                            {options.map((option: IResponse) => {
                                return <SelectItem key={option.url} value={option.url} className="hover:bg-muted cursor-pointer">
                                    Building #{option.id} — Width: {option.width}m, Height {option.height}m, Depth: {option.depth}m
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                    {selectedOption && (
                        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs space-y-1.5">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-foreground">
                                <span>Width: <strong>{selectedOption.width}m</strong></span>
                                <span>Height: <strong>{selectedOption.height}m</strong></span>
                                <span>Depth: <strong>{selectedOption.depth}m</strong></span>
                                <span>Terrain: <strong className="capitalize">{selectedOption.terrain}</strong></span>
                            </div>
                            {selectedSource ? (
                                <div className="flex gap-1.5 pt-1.5 border-t border-border text-muted-foreground">
                                    <BookMarked className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <p>
                                        {selectedSource.dataset} —{" "}
                                        <a
                                            href={selectedSource.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:text-primary"
                                        >
                                            {selectedSource.citation}
                                        </a>
                                    </p>
                                </div>
                            ) : (
                                <p className="pt-1.5 border-t border-border text-muted-foreground">Source unavailable for building #{selectedOption.id}.</p>
                            )}
                        </div>
                    )}
                </div>
                 }
                 {loading && <div className="py-12"><Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" /></div>}
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        disabled={!value}
                        onClick={() => {
                            let op: IResponse[] = options.filter(option => option.url === value)
                            if (op.length == 1){
                                const source = getWindTunnelSource(op[0].id);
                                setExperimentalFrequency(op[0].frequency)
                                setExperimentalMeanSpeed(op[0].meanspeed)
                                setSelectedBuilding(`Building #${op[0].id} — Width: ${op[0].width}m, Height: ${op[0].height}m, Depth: ${op[0].depth}m`)
                                setSelectedBuildingSource(source ? `${source.dataset} — ${source.citation}` : null)
                                setSelectedBuildingSourceLink(source ? source.link : null)
                                onConfirm(value)
                            }
                        }}
                        className="" variant="outline"
                    >
                        Confirm Selection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
