
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"



export default function ResultsCard() {
    const {ar, vr, experimentalAr, experimentalVr, accelartionYDirection} = useOutputBuildingContext()

    return (
        // <TableCaption>Building dynamic response</TableCaption>
        <>
        <p className="text-center m-4">Building dynamic response</p>
        <Table className="p-4">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">   </TableHead>
                    <TableHead>Across-wind response rms accelaration (milli-g)</TableHead>
                    <TableHead>Along-wind response rms accelaration (milli-g)</TableHead>
                    <TableHead className="text-right">Torsion response rms velocity (milli-rad/s)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium">Analytical</TableCell>
                    <TableCell>{ar}</TableCell>
                    <TableCell>{ar}</TableCell>
                    <TableCell className="text-right">{vr}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="font-medium">Experimental</TableCell>
                    <TableCell>{experimentalAr}</TableCell>
                    <TableCell>{accelartionYDirection}</TableCell>
                    <TableCell className="text-right">{experimentalVr}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
        </>
    )
}