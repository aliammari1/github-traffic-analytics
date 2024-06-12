"use client";
import { Button } from "@/components/ui/button";
import React from "react";

const GithubAuth = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Button onClick={() => (window.location.href = "/traffic")}>
        Navigate to /traffic
      </Button>
    </div>
  );
};

export default GithubAuth;
