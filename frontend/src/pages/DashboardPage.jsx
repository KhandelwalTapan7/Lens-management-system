import React, { useEffect, useState } from 'react';
import { fetchDashboard, triggerBreachScan } from '../api/apiClient';
import StatusFilter from '../components/Dashboard/StatusFilter';
import OrderTable from '../components/Dashboard/OrderTable';
import Loader from '../components/common/Loader';

const DashboardPage = () => {
  const [filters, setFilters] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = () => {
    setLoading(true);
    fetchDashboard(filters)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleScan = async () => {
    setScanning(true);
    try {
      await triggerBreachScan();
      load();
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2>Order Dashboard</h2>
        <button onClick={handleScan} disabled={scanning}>
          {scanning ? 'Scanning...' : 'Run AI Breach Scan'}
        </button>
      </div>

      {loading || !data ? (
        <Loader />
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="value">{data.totalActive}</div>
              <div>Active Orders</div>
            </div>
            <div className="summary-card danger">
              <div className="value">{data.breachedCount}</div>
              <div>SLA Breached</div>
            </div>
            <div className="summary-card warning">
              <div className="value">{data.atRiskCount}</div>
              <div>At Risk (AI Predicted)</div>
            </div>
            <div className="summary-card ok">
              <div className="value">{data.statusCounts.DELIVERED}</div>
              <div>Delivered</div>
            </div>
          </div>

          <div className="card">
            <StatusFilter filters={filters} onChange={setFilters} />
            <OrderTable orders={data.orders} onStatusUpdated={load} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
