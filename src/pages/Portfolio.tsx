import CryptoPortfolio from "@/components/CryptoPortfolio";
export default function Portfolio() {
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exchange Portfolio</h1>
        <p className="text-muted-foreground">
          Track your cryptocurrency investments and performance
        </p>
      </div>
      
      <CryptoPortfolio />
    </div>;
}