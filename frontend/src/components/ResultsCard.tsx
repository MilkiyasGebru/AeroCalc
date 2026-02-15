
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {CardHeader, CardTitle} from "@/components/ui/card.tsx";



export default function ResultsCard() {
    const {ar, vr, experimentalAr, experimentalVr, accelartionYDirection, experimentalAccelartionYDirection} = useOutputBuildingContext()

    return (
        // <TableCaption>Building dynamic response</TableCaption>
        <>
            <CardHeader>
                <CardTitle className="flex gap-2 items-center justify-center text-xl ">
                    Building dynamic response
                </CardTitle>
            </CardHeader>
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
                {(ar !== null) && <TableRow>
                    <TableCell className="font-medium">Analytical</TableCell>
                    <TableCell className="text-center">{ar?.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{accelartionYDirection?.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{vr?.toFixed(2)}</TableCell>
                </TableRow>}
                {(experimentalAr !== null) && <TableRow>
                    <TableCell className="font-medium">Experimental</TableCell>
                    <TableCell className="text-center">{experimentalAr?.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{experimentalAccelartionYDirection?.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{experimentalVr?.toFixed(2)}</TableCell>
                </TableRow>}

            </TableBody>
        </Table>
        </>
    )
}