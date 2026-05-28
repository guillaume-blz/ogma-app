import { AppLayout } from "./layouts/AppLayout";
import { SidebarNav } from "./layouts/SidebarNav";

function App() {
  return (
    <AppLayout sidebar={<SidebarNav />}>
      <p className="text-sm text-muted-foreground">Main content</p>
    </AppLayout>
  );
}

export default App;
