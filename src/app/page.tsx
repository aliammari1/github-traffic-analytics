"use client";
import { Button } from "@/components/ui/button";
import React from "react";

const GithubAuth = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Button onClick={() => (window.location.href = "/traffic")}>
        Navigate to /traffic
      </Button>
    </div>
  );
};

export default GithubAuth;
