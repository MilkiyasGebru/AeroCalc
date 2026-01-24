import './App.css'
import ValidationCard from "@/components/ValidationCard.tsx";
import InputCard from "@/components/InputCard.tsx";
import ResultsCard from "@/components/ResultsCard.tsx";
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";
import PSDGraph from "@/components/PSDGraph.tsx";


function App() {
    const {torsionPsds} = useOutputBuildingContext()


  return (

      <div className="bg-[hsl(210,20%,98%)]  min-h-screen w-full py-4">
          <h2 className="text-center max-w-[90%] mx-auto  text-4xl font-bold mb-4">Building Wind Response Calculator</h2>
          <p className="text-center max-w-[80%] mx-auto text-lg mb-4">Calculate force, acceleration, and power spectral density for wind-induced building responses</p>
          <ValidationCard />
          <div className="max-w-5/6 grid lg:grid-cols-2 gap-6 mt-3 mx-auto">
              <InputCard />
              <ResultsCard  />
          </div>
          {torsionPsds.length > 0 && (
              <div className="max-w-5/6 mx-auto bg-white rounded-lg mt-3">
                <PSDGraph />
              </div>
          )}
      </div>

  )
}

export default App
