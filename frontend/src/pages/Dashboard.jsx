import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Header from '../components/Layout/Header';
import StatCard from '../components/Dashboard/StatCard';
import LiveFeed from '../components/Dashboard/LiveFeed';
import AnomalyChart from '../components/Dashboard/AnomalyChart';
import SupplyChainMap from '../components/Dashboard/SupplyChainMap';
import { 
  Package, 
  AlertTriangle, 
  Fingerprint, 
  Activity 
} from 'lucide-react';
import { CardSkeleton } from '../components/shared/LoadingSpinner';

const Dashboard = () => {
  const { lastSensorUpdate } = useSocket();
  const [sensorHistory, setSensorHistory] = React.useState([]);

  // Accumulate sensor updates for the chart
  React.useEffect(() => {
    if (lastSensorUpdate) {
      setSensorHistory(prev => [lastSensorUpdate, ...prev].slice(0, 50));
    }
  }, [lastSensorUpdate]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/batches/stats/overview');
      return res.data.data;
    },
    refetchInterval: 10000 // Refetch stats every 10s for better real-time feel
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="Mission Control" />
      
      <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
            </>
          ) : (
            <>
              <StatCard 
                title="Active Shipments" 
                value={stats?.active || 0} 
                icon={Package} 
                color="teal" 
                trend={5.2}
              />
              <StatCard 
                title="AI Flagged" 
                value={stats?.flagged || 0} 
                icon={AlertTriangle} 
                color="red" 
                trend={-1.4}
              />
              <StatCard 
                title="Trust Protocol" 
                value="98.4" 
                unit="%" 
                icon={Fingerprint} 
                color="teal" 
              />
              <StatCard 
                title="Chain Operations" 
                value={stats?.total_batches || 0} 
                icon={Activity} 
                color="indigo" 
              />
            </>
          )}
        </div>

        {/* Real-time Intel & Spatial Tracking */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[450px]">
             <div className="xl:col-span-2 flex flex-col gap-8">
                <div className="h-[300px]">
                    <AnomalyChart data={sensorHistory} />
                </div>
                <div className="flex-1 min-h-[250px]">
                    <SupplyChainMap logs={sensorHistory} />
                </div>
             </div>
             <div className="xl:col-span-1 h-full">
                <LiveFeed />
             </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
