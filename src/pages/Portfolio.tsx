
import CryptoPortfolio from "@/components/CryptoPortfolio";
import { TrendingUp } from "lucide-react";

export default function Portfolio() {
  return (
    <div className="container-portfolio spacing-section">
      <div className="spacing-container">
        <div className="flex items-center gap-3 mb-3 lg:mb-4 text-green-600">
          <TrendingUp className="size-6" />
          <h1 className="text-h1">
            Exchange Portfolio
          </h1>
        </div>
        <p className="text-body text-muted-foreground">
          Track your cryptocurrency investments and performance
        </p>
      </div>
      
      <div className="spacing-container">
        <CryptoPortfolio />
      </div>
    </div>
  );
}
