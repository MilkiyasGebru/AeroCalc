import './App.css'
import InputCard from "@/components/InputCard.tsx";
import ResultsCard from "@/components/ResultsCard.tsx";
import PSDGraph from "@/components/PSDGraph.tsx";
import MGraphs from "@/components/MGraphs.tsx";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";
import {CalculateAlong} from "@/hooks/useCalculateBuildingResponse.ts";
import {frequencies} from "../CONSTANTS.ts";
// import {useEffect, useState} from "react";

function App() {
    const {csvData} = useInputBuildingContext()
    const {torsionPsds, experimentalTorsionPsds, acrossPsds, experimentalAcrossPsds} = useOutputBuildingContext()

    console.log(CalculateAlong(35.71498714,193.525,28.2309602057443,27.7681800576695,1/0.147058823529412,0.02,frequencies, 200))
    // const [x, setX] = useState<number>(0)
    // useEffect(() => {
    // const callApi = async () => {
    //     try {
    //         // Safety check: verify the API exists before calling
    //         if (window.pywebview?.api?.compute) {
    //             const result = await window.pywebview.api.compute();
    //             setX(result);
    //         }
    //     } catch (error) {
    //         console.error("API call failed:", error);
    //     }
    // };

//     if (window.pywebview?.api) {
//         callApi();
//     } else {
//         // The browser calls this automatically once 'pywebviewready' fires
//         window.addEventListener('pywebviewready', callApi);
//
//         // Cleanup: removes the listener if the component unmounts
//         // before the event even happens.
//         return () => window.removeEventListener('pywebviewready', callApi);
//     }
// }, []);
    return (

      <div className="bg-[hsl(210,20%,98%)]  min-h-screen w-full py-4">
          <h2 className="text-center max-w-[90%] mx-auto  text-4xl font-bold mb-4">Building Wind Response Calculator</h2>
          <p className="text-center max-w-[80%] mx-auto text-lg mb-4">Calculate force, acceleration, and power spectral density for wind-induced building responses</p>
          <div className="max-w-5/6 grid lg:grid-cols-2 gap-6 mt-3 mb-10 mx-auto">
              <InputCard/>

              <div className="grid lg:grid-cols-2 gap-2">
                  {(csvData.length > 0) && <MGraphs graph_data={{"val": csvData.map(data => data.MX), "Mtype": "MX"}}/>}
                  {(csvData.length > 0) && <MGraphs graph_data={{"val": csvData.map(data => data.MY), "Mtype": "MY"}}/>}
                  {(csvData.length > 0) && <MGraphs graph_data={{"val": csvData.map(data => data.MZ), "Mtype": "MZ"}}/>}

              </div>
          </div>
          <div className="max-w-5/6 grid lg:grid-cols-2 gap-3 mx-auto">
              <div className="w-full bg-white rounded-md border-transparent">
                  <PSDGraph psds={acrossPsds} experimentalPsds={experimentalAcrossPsds} graphType="Across" />
              </div>
              <div className="w-full bg-white rounded-md border-transparent">
                  <PSDGraph psds={torsionPsds} experimentalPsds={experimentalTorsionPsds} graphType="Torsion" />
              </div>
          </div>
          <div className="max-w-5/6 grid lg:grid-cols-2 gap-6 mt-3 mb-10 mx-auto">
              <ResultsCard/>
          </div>

      </div>

  )
}

export default App
