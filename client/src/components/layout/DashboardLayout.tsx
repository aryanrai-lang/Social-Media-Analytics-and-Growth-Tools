import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ScrollArea className="flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </ScrollArea>
    </div>
  );
};

export default DashboardLayout;
