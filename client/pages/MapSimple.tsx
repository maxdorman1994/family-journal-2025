import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function MapSimple() {
  const [pins, setPins] = useState<Array<{ id: string; title: string }>>([]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Adventure Map
          </span>
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Interactive map coming soon!
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="h-[600px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Map Loading...</h3>
              <p className="text-muted-foreground">
                Interactive map functionality will be available shortly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
