import { useState } from "react";
import { NavigationMenuDemo } from "@/components/ui/navbar";

const Dashboard = () => {
  const [error] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8 flex flex-col">
      <div className="flex justify-center mb-4">
        <NavigationMenuDemo />
      </div>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default Dashboard;
