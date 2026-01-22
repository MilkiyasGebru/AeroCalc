import './App.css'
import ValidationCard from "@/components/ValidationCard.tsx";
import InputCard from "@/components/InputCard.tsx";
import ResultsCard from "@/components/ResultsCard.tsx";
import {useBuildingParameters} from "@/hooks/useBuildingParameters.ts";
import PSDGraph from "@/components/PSDGraph.tsx";
import { GenerateFrequencies} from "@/hooks/useCalculateBuildingResponse.ts";

function App() {

    const {
        width,
        height,
        depth,
        meanSpeed,
        torsionPsds,
        acrossPsds,
        initialFrequency,
        finalFrequency,
        deltaFrequency,
        buildingDensity,
        totalFloors,
        damping,
        Tone,
        handleClick,
        setTone,
        setDamping,
        setWidth,
        setHeight,
        setDepth,
        setMeanSpeed,
        setInitialFrequency,
        setFinalFrequency,
        setDeltaFrequency,
        setTotalFloors,
        setBuildingDensity,
        ar, vr
    } = useBuildingParameters();

    // const [rms_vr_proposed,rms_a_r_Proposed] = CalculateFD(width, height, depth, meanSpeed, totalFloors, damping, GenerateFrequencies(initialFrequency, finalFrequency, deltaFrequency), acrossPsds, torsionPsds)


  return (
      <div className="bg-[hsl(210,20%,98%)]  min-h-screen w-full py-4">
          <h2 className="text-center max-w-[90%] mx-auto  text-4xl font-bold mb-4">Building Wind Response Calculator</h2>
          <p className="text-center max-w-[80%] mx-auto text-lg mb-4">Calculate force, acceleration, and power spectral density for wind-induced building responses</p>
          <ValidationCard width={width} depth={depth}/>
          <div className="max-w-5/6 grid lg:grid-cols-2 gap-6 mt-3 mx-auto">
              <InputCard width={width} height={height} depth={depth}
                         meanSpeed={meanSpeed} initialFrequency={initialFrequency} finalFrequency={finalFrequency}
                         deltaFrequency={deltaFrequency} buildingDensity={buildingDensity} totalFloors={totalFloors}
                         setBuildingDensity={setBuildingDensity} setTotalFloors={setTotalFloors}
                         setWidth={setWidth} setHeight={setHeight} setDepth={setDepth}
                         setMeanSpeed={setMeanSpeed}  setInitialFrequency={setInitialFrequency}
                         setFinalFrequency={setFinalFrequency} setDeltaFrequency={setDeltaFrequency}
                         damping={damping} setDamping={ setDamping} setTone={setTone} Tone={Tone}
                         handleClick={handleClick}
              />
              <ResultsCard rms_vr_proposed={vr} rms_a_r_Proposed={ar} />
          </div>
          {torsionPsds.length > 0 && (
              <div className="max-w-5/6 mx-auto bg-white rounded-lg mt-3">
                <PSDGraph torsion_psds={torsionPsds} across_psds={acrossPsds} frequencies={GenerateFrequencies(initialFrequency, finalFrequency, deltaFrequency)}/>
              </div>
          )}
      </div>
  )
}

export default App
