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
    // const [loading, setLoading] = useState(true);
    const { width, height, depth} = useInputBuildingContext();
    const [options, setOptions] = useState<IResponse[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    console.log("In internal database dialog 2");

    useEffect(() => {
        console.log("In internal database dialog");
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
            console.log(json_result);
            setLoading(false)
            setOptions(json_result);
        })
    }, [open])
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
             <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>Internal Wind Database</DialogTitle>
                    <DialogDescription>
                        These are the closest buildings to your input.
                    </DialogDescription>
                </DialogHeader>
                 {!loading &&
                <div className="grid gap-4 py-4">
                    <Select onValueChange={setValue}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select experimental data..." />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option: IResponse) => {
                                return <SelectItem value={option.url}>Width: {option.width}m, Height {option.height}m, Depth:{option.depth}m </SelectItem>
                            })}

                        </SelectContent>
                    </Select>
                </div>
                 }
                 {loading && <Loader2 className="animate-spin flex justify-center items-center h-16 w-16 mx-auto" />}
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        disabled={!value}
                        onClick={() => onConfirm(value)}
                        className="bg-blue-400 text-white hover:bg-blue-500"
                    >
                        Confirm Selection
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    );
}