import './App.css'
import InputCard from "@/components/InputCard.tsx";
import ResultsCard from "@/components/ResultsCard.tsx";
import PSDGraph from "@/components/PSDGraph.tsx";
import MGraphs from "@/components/MGraphs.tsx";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";

function App() {
    const {csvData} = useInputBuildingContext()
    const {torsionPsds, experimentalTorsionPsds, acrossPsds, experimentalAcrossPsds, experimentalAlongPsds} = useOutputBuildingContext()

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
                  <PSDGraph psds={acrossPsds} experimentalPsds={experimentalAcrossPsds} graphType="Across"/>
              </div>
              <div className="w-full bg-white rounded-md border-transparent">
                  <PSDGraph psds={torsionPsds} experimentalPsds={experimentalTorsionPsds} graphType="Torsion"/>
              </div>
              <div className="w-full bg-white rounded-md border-transparent">
                  <PSDGraph  psds={[]} experimentalPsds={experimentalAlongPsds} graphType="Along"/>
              </div>
          </div>
          <div className="max-w-5/6 grid lg:grid-cols-2 gap-6 mt-3 mb-10 mx-auto">
              <ResultsCard/>
          </div>

      </div>

    )
}

export default App
