import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cron: {
      routes: [{
        path: '/api/cron/sync-matches',
        schedule: '*/30 * * * *',
        method: 'GET'
      }]
    }
  }
};

export default nextConfig;
