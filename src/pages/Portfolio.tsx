
import CryptoPortfolio from "@/components/CryptoPortfolio";
import DailyPNLCalendar from "@/components/crypto/DailyPNLCalendar";
import { PortfolioIcon } from "@/components/ui/action-icons";

export default function Portfolio() {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 lg:space-y-10">
      <div className="px-1 sm:px-2 lg:px-4">
        <div className="flex items-center gap-3 mb-3 lg:mb-4">
          <PortfolioIcon size="lg" variant="inline" />
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Exchange Portfolio
          </h1>
        </div>
        <p className="text-muted-foreground text-base lg:text-lg">
          Track your cryptocurrency investments and performance
        </p>
      </div>
      
      <div className="px-1 sm:px-2 lg:px-4">
        <DailyPNLCalendar 
          positiveColor="text-green-400"
          negativeColor="text-red-400"
          positiveBgColor="bg-green-500/10 border-green-500/20"
          negativeBgColor="bg-red-500/10 border-red-500/20"
        />
      </div>
      
      <div className="px-1 sm:px-2 lg:px-4">
        <CryptoPortfolio />
      </div>
    </div>
  );
}
