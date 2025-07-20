
import CryptoPortfolio from "@/components/CryptoPortfolio";

export default function Portfolio() {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 lg:space-y-10">
      <div className="px-1 sm:px-2 lg:px-4">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3 lg:mb-4">
          Exchange Portfolio
        </h1>
        <p className="text-muted-foreground text-base lg:text-lg">
          Track your cryptocurrency investments and performance
        </p>
      </div>
      
      <div className="px-1 sm:px-2 lg:px-4">
        <CryptoPortfolio />
      </div>
    </div>
  );
}
