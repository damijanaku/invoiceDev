import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Dashboard;
