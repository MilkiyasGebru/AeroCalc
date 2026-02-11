import './App.css'
import InputCard from "@/components/InputCard.tsx";
import ResultsCard from "@/components/ResultsCard.tsx";


function App() {

    return (

      <div className="bg-[hsl(210,20%,98%)]  min-h-screen w-full py-4 bg-[url('img.png')]">
          <h2 className="text-center max-w-[90%] mx-auto  text-4xl font-bold mb-4">cloud-based platform for wind response prediction of tall mass timber</h2>
          <p className="text-center max-w-[80%] mx-auto text-lg mb-4">Developed by: McGill Timber Structures Group ( <a className="text-cyan-400 underline" href="https://mcgilltsg.github.io/">McGill TSG</a> )</p>
          <div className="max-w-1/2  gap-6 mt-3 mb-10 mx-auto">
              <InputCard/>

          </div>

          <div className="max-w-5/6 grid gap-6 mt-3 mb-10 mx-auto">
              <ResultsCard/>
          </div>

      </div>

    )
}

export default App
