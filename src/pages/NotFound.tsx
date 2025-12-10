import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="font-display text-8xl font-bold text-primary mb-4">
            404
          </h1>
          <p className="text-2xl text-foreground mb-2">Page Not Found</p>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/">
              <Home size={18} className="mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
