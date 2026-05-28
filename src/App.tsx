import { AppLayout } from "./layouts/AppLayout";

function App() {
  return (
    <AppLayout
      sidebar={
        <div className="p-3">
          <p className="text-xs text-muted-foreground">Navigation</p>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">Main content</p>
    </AppLayout>
  );
}

export default App;
