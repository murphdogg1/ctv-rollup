'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, TrendingUp, Eye, Calendar, Upload, BarChart, Tag } from 'lucide-react';

// Simple dashboard that works without complex API calls
export default function SimpleDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [apiTest, setApiTest] = useState('Not tested');

  useEffect(() => {
    setIsClient(true);
    console.log('SimpleDashboard: JavaScript is executing!');
    
    // Simple API test
    fetch('/api/campaigns')
      .then(response => response.json())
      .then(data => {
        console.log('API call successful:', data);
        setApiTest(`Success! Found ${data.campaigns?.length || 0} campaigns`);
      })
      .catch(error => {
        console.error('API call failed:', error);
        setApiTest(`Failed: ${error.message}`);
      });
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CTV Rollup Dashboard</h1>
          <p className="text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CTV Rollup Dashboard</h1>
        <p className="text-muted-foreground">
          Ingest, normalize, and analyze CTV delivery logs with deduplication and rollup reporting.
        </p>
        <p className="text-sm text-green-600 mt-2">
          ✅ JavaScript is working! Client-side rendering active.
        </p>
      </div>

      {/* API Test Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>Testing connection to backend services</CardDescription>
        </CardHeader>
        <CardContent>
          <p><strong>Status:</strong> {apiTest}</p>
          <p><strong>Client:</strong> {isClient ? 'Yes' : 'No'}</p>
          <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Dashboard is working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">JavaScript</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Client-side rendering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Testing</div>
            <p className="text-xs text-muted-foreground">
              Backend connection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Production</div>
            <p className="text-xs text-muted-foreground">
              Vercel deployment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Campaigns</CardTitle>
            <CardDescription>
              Upload new CSV files and manage existing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/campaigns">
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Go to Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Normalize Data</CardTitle>
            <CardDescription>
              Map bundles, genres, and content for consistent analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/normalize">
              <Button className="w-full">
                <Tag className="w-4 h-4 mr-2" />
                Manage Mappings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Page</CardTitle>
            <CardDescription>
              Test JavaScript functionality and API connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/test">
              <Button className="w-full">
                <BarChart className="w-4 h-4 mr-2" />
                Run Tests
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">CSV/Parquet Import</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Smart Deduplication</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Multi-tier Rollups</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Export to CSV</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Campaign Management</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
