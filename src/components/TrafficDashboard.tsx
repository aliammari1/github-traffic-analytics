"use client";

import { useState, useEffect, useCallback } from "react";
import { Repository } from "@/lib/github";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, ExternalLink, ArrowLeft, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TrafficData {
  views: {
    count: number;
    uniques: number;
    views: Array<{
      timestamp: string;
      count: number;
      uniques: number;
    }>;
  };
  clones: {
    count: number;
    uniques: number;
    clones: Array<{
      timestamp: string;
      count: number;
      uniques: number;
    }>;
  };
  referrers: Array<{
    referrer: string;
    count: number;
    uniques: number;
  }>;
  paths: Array<{
    path: string;
    title: string;
    count: number;
    uniques: number;
  }>;
}

interface TrafficDashboardProps {
  repository: Repository;
  onBack: () => void;
}

export default function TrafficDashboard({ repository, onBack }: TrafficDashboardProps) {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrafficData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/traffic?owner=${repository.owner.login}&repo=${repository.name}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch traffic data");
      }
      const data = await response.json();
      setTrafficData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  }, [repository.owner.login, repository.name]);

  useEffect(() => {
    fetchTrafficData();
  }, [fetchTrafficData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">{repository.name}</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !trafficData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">{repository.name}</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <p className="text-red-500 text-lg">
                {error || "Impossible de charger les données de trafic"}
              </p>
              {error?.includes("Accès refusé") && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Information :</strong> Les données de trafic GitHub ne sont disponibles que pour les dépôts dont vous êtes propriétaire ou pour lesquels vous avez un accès push.
                  </p>
                </div>
              )}
              <Button onClick={fetchTrafficData} className="mt-4">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = trafficData.views.views.map((view) => ({
    date: format(new Date(view.timestamp), "dd/MM", { locale: fr }),
    vues: view.count,
    visiteurs: view.uniques,
  }));

  const cloneChartData = trafficData.clones.clones.map((clone) => ({
    date: format(new Date(clone.timestamp), "dd/MM", { locale: fr }),
    clones: clone.count,
    visiteurs: clone.uniques,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{repository.name}</h1>
            <p className="text-muted-foreground">{repository.owner.login}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <a 
            href={`https://github.com/${repository.full_name}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir sur GitHub
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.views.count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {trafficData.views.uniques} visiteurs uniques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clones totaux</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.clones.count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {trafficData.clones.uniques} clones uniques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étoiles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repository.stargazers_count}</div>
            <p className="text-xs text-muted-foreground">
              {repository.forks_count} forks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Référents</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.referrers.length}</div>
            <p className="text-xs text-muted-foreground">
              Sources de trafic
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vues au fil du temps</CardTitle>
            <CardDescription>
              Évolution des vues et visiteurs uniques sur les 14 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="vues" stroke="#8884d8" name="Vues" />
                <Line type="monotone" dataKey="visiteurs" stroke="#82ca9d" name="Visiteurs uniques" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clones au fil du temps</CardTitle>
            <CardDescription>
              Évolution des clones sur les 14 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cloneChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clones" fill="#8884d8" name="Clones" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Référents</CardTitle>
            <CardDescription>Sources principales du trafic</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Vues</TableHead>
                  <TableHead className="text-right">Uniques</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficData.referrers.slice(0, 5).map((referrer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {referrer.referrer || "Direct"}
                    </TableCell>
                    <TableCell className="text-right">{referrer.count}</TableCell>
                    <TableCell className="text-right">{referrer.uniques}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages populaires</CardTitle>
            <CardDescription>Contenu le plus visité</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Vues</TableHead>
                  <TableHead className="text-right">Uniques</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficData.paths.slice(0, 5).map((path, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="max-w-[200px] truncate" title={path.path}>
                        {path.path}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{path.count}</TableCell>
                    <TableCell className="text-right">{path.uniques}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
