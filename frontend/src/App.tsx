import './App.css'
import GeometryCard from "@/components/inputs/GeometryCard";
import DynamicPropertiesCard from "@/components/inputs/DynamicPropertiesCard";
import WindClimateCard from "@/components/inputs/WindClimateCard";
import ExperimentalCard from "@/components/inputs/ExperimentalCard";
import OutputTabs from "@/components/outputs/OutputTabs";
import { Button } from "@/components/ui/button";
import { Play, Sun, Moon } from "lucide-react";
import { useOutputBuildingContext } from "@/contexts/useOutputBuildingContext";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";
import { useTheme } from "@/contexts/ThemeContext";

function App() {
    const { handleAnalyticalCalculation, handleExperimentalCalculation, clearExperimentalResults, exportResults } = useOutputBuildingContext();
    const { mxData, myData, mzData } = useInputBuildingContext();
    const { theme, toggleTheme } = useTheme();

    const runAnalysis = () => {
        handleAnalyticalCalculation();
        if (mxData.length > 0 || myData.length > 0 || mzData.length > 0) {
            handleExperimentalCalculation(mxData, myData, mzData);
        } else {
            clearExperimentalResults();
        }
    };

    return (
      <div className="bg-background h-screen w-full flex flex-col font-['Times_New_Roman',_Times,_serif] overflow-hidden">
          {/* Header */}
          <header className="border-b border-border bg-card/30 backdrop-blur-md z-10 py-4 px-6 flex-shrink-0">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                  <div className="flex items-center gap-4">
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleTheme}
                          className="rounded-full h-10 w-10 shrink-0"
                          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                      >
                          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      </Button>
                      <div>
                          <h1 className="text-2xl font-bold text-primary leading-tight">Cloud-based platform for wind response prediction of tall mass timber buildings</h1>
                          <p className="text-sm text-muted-foreground">McGill Timber Structures Group (TSG)</p>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <Button 
                          variant="outline"
                          onClick={exportResults}
                          className="px-6 h-12 font-bold shadow-sm transition-all active:scale-95"
                      >
                          Export Results
                      </Button>
                      <Button 
                          onClick={runAnalysis} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-lg font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all active:scale-95 shrink-0"
                      >
                          <Play className="mr-2 h-5 w-5 fill-current" />
                          Run Analysis
                      </Button>
                  </div>
              </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-[1600px] mx-auto w-full gap-6 p-6 overflow-hidden">

              {/* Left Sidebar - Inputs */}
              <aside className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar h-full pb-10">
                  <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-sm font-bold tracking-wider text-muted-foreground">Input parameters</h2>
                  </div>

                  <GeometryCard />
                  <DynamicPropertiesCard />
                  <WindClimateCard />
                  <ExperimentalCard />

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
                      <p>Ensure all dimensions and site parameters are correctly entered before running the analysis.</p>
                  </div>
              </aside>

              {/* Right Panel - Outputs */}
              <main className="lg:col-span-9 bg-card/10 border border-border rounded-xl flex flex-col h-full overflow-hidden">
                  <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                    <OutputTabs />
                  </div>
              </main>
          </div>

      </div>
    )
}

export default App
