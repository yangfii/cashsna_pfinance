import AIAssistant from "@/components/AIAssistant";

export default function Assistant() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Financial Assistant</h1>
        <p className="text-muted-foreground">
          Get intelligent insights and advice for your financial decisions
        </p>
      </div>
      
      <AIAssistant />
    </div>
  );
}