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
import {useEffect, useState} from "react";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import { Loader2 } from "lucide-react"

interface InternalDatabaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (selection: string) => void;
}
interface IResponse {
    width: number;
    depth: number;
    height: number;
    terrain: string;
    url: string;
    frequency: number;
}

export function InternalDatabaseDialog({ open, onOpenChange, onConfirm }: InternalDatabaseDialogProps) {
    const [value, setValue] = useState<string>("");
    const { width, height, depth} = useInputBuildingContext();
    const [options, setOptions] = useState<IResponse[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const {setExperimentalFrequency, setSelectedBuilding} = useInputBuildingContext()

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
             <DialogContent className="sm:max-w-[425px] bg-white border-border">
                <DialogHeader>
                    <DialogTitle className="text-primary font-bold text-xl">Internal Wind Database</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Select from the building configurations closest to your input.
                    </DialogDescription>
                </DialogHeader>
                 {!loading &&
                <div className="grid gap-4 py-4">
                    <Select onValueChange={setValue}>
                        <SelectTrigger className="w-full bg-white border-border">
                            <SelectValue placeholder="Select experimental data..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-border">
                            {options.map((option: IResponse) => {
                                return <SelectItem key={option.url} value={option.url} className="hover:bg-muted cursor-pointer">
                                    Width: {option.width}m, Height {option.height}m, Depth:{option.depth}m 
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>
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
                                setExperimentalFrequency(op[0].frequency)
                                setSelectedBuilding(`Width: ${op[0].width}m, Height: ${op[0].height}m, Depth: ${op[0].depth}m`)
                                onConfirm(value)
                            }
                        }}
                        className="bg-primary text-white hover:bg-primary/90"
                    >
                        Confirm Selection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
