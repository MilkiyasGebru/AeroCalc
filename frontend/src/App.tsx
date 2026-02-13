import './App.css'
import InputCard from "@/components/InputCard.tsx";
function App() {

    return (

      <div className="bg-[hsl(210,20%,98%)]  min-h-screen w-full py-4 bg-[url('/img.png')]">
          <h2 className="text-center max-w-[90%] mx-auto  text-4xl font-bold  bg-white">Cloud-based platform for wind response prediction of tall mass timber buildings</h2>
          <p className="text-center max-w-[80%] mx-auto text-lg mb-4 bg-white">Developed by: McGill Timber Structures Group ( <a className="text-cyan-400 underline" href="https://mcgilltsg.github.io/" target="_blank">McGill TSG</a> )</p>
          <div className="max-w-1/2  gap-6 mt-3 mb-10 mx-auto">
              <InputCard/>

          </div>

      </div>

    )
}

export default App
