import { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { API_ENDPOINTS } from '../../api/config';

export default function SellerAnalytics() {
  const { data: ordersData } = useQuery({ queryKey: ['admin-orders'], queryFn: () => client.get(API_ENDPOINTS.ADMIN_ORDERS).then(r=>r.data) });
  const { data: productsData } = useQuery({ queryKey: ['products-analytics'], queryFn: () => client.get(API_ENDPOINTS.PRODUCTS_LIST).then(r=>r.data) });

  const orders = ordersData?.data || ordersData?.orders || [];
  const products = productsData?.data || [];

  const stats = useMemo(() => {
    const byStatus = orders.reduce((acc, o) => { const s = (o.orderStatus||o.status||'pending'); acc[s]=(acc[s]||0)+1; return acc; }, {});
    const revenue = orders.filter(o=> (o.orderStatus||o.status)!=='cancelled').reduce((sum,o)=> sum + Number(o.totalAmount||o.totalPrice||0),0);
    const byDate = {};
    orders.forEach(o => { const d = new Date(o.createdAt).toISOString().slice(0,10); byDate[d]=(byDate[d]||0)+Number(o.totalAmount||0); });
    const dates = Object.keys(byDate).sort().slice(-14);
    return { byStatus, revenue, dates, byDate };
  }, [orders]);

  const statusPie = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'Orders by Status' },
    plotOptions: { pie: { dataLabels: { enabled: true, format: '{point.name}: {point.y}' } } },
    series: [{ name: 'Orders', data: Object.entries(stats.byStatus).map(([name,y])=>({name,y})) }],
    credits: { enabled: false },
  };
  const revenueLine = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Revenue (last 14 days)' },
    xAxis: { categories: stats.dates, title: { text: 'Date' } },
    yAxis: { title: { text: 'Rs' } },
    series: [{ name: 'Revenue', data: stats.dates.map(d=> stats.byDate[d]||0), color: '#16a34a' }],
    credits: { enabled: false },
  };
  const productStatusBar = {
    chart: { type: 'bar', backgroundColor: 'transparent' },
    title: { text: 'Products' },
    xAxis: { categories: ['Total','Public','Draft'], title: { text: null } },
    yAxis: { title: { text: 'Count' } },
    series: [{ name: 'Products', data: [products.length, products.filter(p=>p.productStatus==='public').length, products.filter(p=>p.productStatus==='draft').length], color: '#15803d' }],
    credits: { enabled: false },
  };

  if (orders.length===0 && products.length===0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <div className="bg-white border border-dashed rounded-xl p-12 text-center text-gray-500">No data yet — create products and orders to see charts.</div>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl border p-4"><HighchartsReact highcharts={Highcharts} options={statusPie} /></div>
          <div className="bg-white rounded-xl border p-4"><HighchartsReact highcharts={Highcharts} options={revenueLine} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border"><p className="text-sm text-gray-500">Total Orders</p><p className="text-3xl font-bold">{orders.length}</p></div>
        <div className="bg-white p-6 rounded-xl border"><p className="text-sm text-gray-500">Revenue</p><p className="text-3xl font-bold text-green-600">Rs {stats.revenue.toLocaleString()}</p></div>
        <div className="bg-white p-6 rounded-xl border"><p className="text-sm text-gray-500">Products</p><p className="text-3xl font-bold">{products.length}</p></div>
        <div className="bg-white p-6 rounded-xl border"><p className="text-sm text-gray-500">Pending</p><p className="text-3xl font-bold text-amber-600">{stats.byStatus.pending||0}</p></div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4"><HighchartsReact highcharts={Highcharts} options={statusPie} /></div>
        <div className="bg-white rounded-xl border p-4"><HighchartsReact highcharts={Highcharts} options={revenueLine} /></div>
      </div>
      <div className="bg-white rounded-xl border p-4"><HighchartsReact highcharts={Highcharts} options={productStatusBar} /></div>
    </div>
  );
}
