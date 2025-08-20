import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Loader2, BarChart3, TrendingUp, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalEvents: number;
  eventsByType: { eventType: string; count: number }[];
  eventsByTab: { tab: string; count: number }[];
  dailyEvents: { date: string; count: number }[];
}

// Chart colors
const COLORS = [
  '#22c55e', // green-500 (UGGA primary)
  '#16a34a', // green-600 
  '#15803d', // green-700
  '#166534', // green-800
  '#14532d', // green-900
  '#84cc16', // lime-500
  '#65a30d', // lime-600
  '#4d7c0f', // lime-700
];

export default function AdminAnalytics() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
    tab: ''
  });
  
  const { toast } = useToast();

  const { data: analytics, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.tab) params.append('tab', filters.tab);
      
      const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', eventType: '', tab: '' });
  };

  const exportData = () => {
    if (!analytics) return;
    
    try {
      const csvData = [
        ['Metric', 'Value'],
        ['Total Events', analytics.totalEvents.toString()],
        [''],
        ['Events by Type', ''],
        ...analytics.eventsByType.map(item => [item.eventType, item.count.toString()]),
        [''],
        ['Events by Tab', ''],
        ...analytics.eventsByTab.map(item => [item.tab, item.count.toString()]),
        [''],
        ['Daily Events', ''],
        ...analytics.dailyEvents.map(item => [item.date, item.count.toString()]),
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Complete",
        description: "Analytics data has been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to load analytics data. Please try again later.</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track user engagement and resource usage across the platform.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={filters.eventType} onValueChange={(value) => handleFilterChange('eventType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All events</SelectItem>
                    <SelectItem value="tab_view">Tab Views</SelectItem>
                    <SelectItem value="search_submit">Searches</SelectItem>
                    <SelectItem value="filter_change">Filter Changes</SelectItem>
                    <SelectItem value="resource_open">Resource Opens</SelectItem>
                    <SelectItem value="outbound_click">Outbound Clicks</SelectItem>
                    <SelectItem value="template_download">Template Downloads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tab">Resource Tab</Label>
                <Select value={filters.tab} onValueChange={(value) => handleFilterChange('tab', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tabs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All tabs</SelectItem>
                    <SelectItem value="universities">Universities</SelectItem>
                    <SelectItem value="organizations">Organizations</SelectItem>
                    <SelectItem value="grants">Grants</SelectItem>
                    <SelectItem value="tools">Tools & Templates</SelectItem>
                    <SelectItem value="templates">Templates</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="bulletins">Blogs & Bulletins</SelectItem>
                    <SelectItem value="industry_news">Industry News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={resetFilters} variant="outline">
                  Reset
                </Button>
                <Button onClick={exportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalEvents?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Types</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.eventsByType?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tabs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.eventsByTab?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Tracked</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.dailyEvents?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events by Type Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.eventsByType || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="eventType" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Events by Tab Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Resource Tab</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.eventsByTab || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tab, percent }) => `${tab} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(analytics?.eventsByTab || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Events Line Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.dailyEvents || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Events by Type Table */}
          <Card>
            <CardHeader>
              <CardTitle>Event Type Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics?.eventsByType?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium capitalize">
                      {item.eventType.replace('_', ' ')}
                    </span>
                    <span className="text-gray-600">{item.count.toLocaleString()}</span>
                  </div>
                ))}
                {(!analytics?.eventsByType || analytics.eventsByType.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No event data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Events by Tab Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Tab Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics?.eventsByTab?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium capitalize">
                      {item.tab.replace('_', ' ')}
                    </span>
                    <span className="text-gray-600">{item.count.toLocaleString()}</span>
                  </div>
                ))}
                {(!analytics?.eventsByTab || analytics.eventsByTab.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No tab data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}