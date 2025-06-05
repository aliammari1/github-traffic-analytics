"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";

export default function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">GitHub Traffic Analytics</CardTitle>
          <CardDescription>
            Analysez le trafic de vos dépôts GitHub avec des visualisations détaillées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => signIn("github")} 
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-4 w-4" />
            Se connecter avec GitHub
          </Button>
          <p className="text-sm text-muted-foreground">
            Entrez votre token GitHub pour commencer l&apos;analyse
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
