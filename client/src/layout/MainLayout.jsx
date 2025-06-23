import NavBar from "@/components/NavBar";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="relative min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <NavBar />
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
