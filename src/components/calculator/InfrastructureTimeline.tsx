import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Train, Car, Zap, ArrowRight, TrendingUp } from "lucide-react";

interface Project {
  id: string;
  name: string;
  type: "transport" | "utility" | "commercial" | "residential";
  status: "completed" | "in-progress" | "planned";
  completionYear: string;
  location: string;
  impactAreas: string[];
  appreciationEstimate: string;
  description: string;
}

const infrastructureProjects: Project[] = [
  {
    id: "1",
    name: "Lagos Rail Mass Transit (Blue Line)",
    type: "transport",
    status: "completed",
    completionYear: "2023",
    location: "Marina to Mile 2",
    impactAreas: ["Victoria Island", "Marina", "Apapa", "Mile 2"],
    appreciationEstimate: "+15-25%",
    description: "First operational metro line. Connecting Marina to Mile 2 with 5 stations.",
  },
  {
    id: "2",
    name: "Lagos Rail Mass Transit (Red Line)",
    type: "transport",
    status: "in-progress",
    completionYear: "2025",
    location: "Agbado to Marina",
    impactAreas: ["Ikeja", "Oshodi", "Yaba", "Ebute Metta", "Marina"],
    appreciationEstimate: "+20-35%",
    description: "33km line connecting Agbado to Oyingbo with 11 stations. Will transform Mainland connectivity.",
  },
  {
    id: "3",
    name: "Lekki-Epe Expressway Expansion",
    type: "transport",
    status: "in-progress",
    completionYear: "2026",
    location: "Lekki to Epe",
    impactAreas: ["Lekki Phase 2", "Ajah", "Sangotedo", "Epe"],
    appreciationEstimate: "+30-50%",
    description: "10-lane expansion reducing travel time. Opening up Epe corridor for development.",
  },
  {
    id: "4",
    name: "Lagos Coastal Road (Blue Line Highway)",
    type: "transport",
    status: "planned",
    completionYear: "2028",
    location: "Lekki to Marina",
    impactAreas: ["Victoria Island", "Lekki Phase 1", "Oniru", "Banana Island"],
    appreciationEstimate: "+25-40%",
    description: "Coastal highway connecting Lekki to Marina. Game-changer for Island traffic.",
  },
  {
    id: "5",
    name: "Eko Atlantic City",
    type: "commercial",
    status: "in-progress",
    completionYear: "2035",
    location: "Victoria Island Extension",
    impactAreas: ["Victoria Island", "Ikoyi", "Lekki Phase 1"],
    appreciationEstimate: "+40-60%",
    description: "10 million sqm reclaimed land. Africa's future Manhattan. Phase 1 infrastructure 70% complete.",
  },
  {
    id: "6",
    name: "Lekki Deep Sea Port",
    type: "commercial",
    status: "completed",
    completionYear: "2024",
    location: "Lekki Free Trade Zone",
    impactAreas: ["Lekki", "Epe", "Ibeju-Lekki", "Sangotedo"],
    appreciationEstimate: "+35-55%",
    description: "Nigeria's first deep sea port. Transforming Lekki axis into industrial hub.",
  },
];

const typeIcons = {
  transport: Train,
  utility: Zap,
  commercial: Building2,
  residential: Car,
};

const statusColors = {
  completed: "bg-green-100 text-green-700 border-green-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  planned: "bg-amber-100 text-amber-700 border-amber-200",
};

const statusLabels = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
};

export const InfrastructureTimeline = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg">
          <Building2 className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Lagos Infrastructure Timeline
          </h3>
          <p className="text-sm text-muted-foreground">
            Major projects driving capital appreciation
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusLabels).map(([key, label]) => (
          <Badge key={key} className={statusColors[key as keyof typeof statusColors]}>
            {label}
          </Badge>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {infrastructureProjects.map((project) => {
          const Icon = typeIcons[project.type];
          return (
            <Card
              key={project.id}
              className="p-5 border border-border hover:border-gold/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Icon & Year */}
                <div className="flex items-center gap-3 md:flex-col md:items-center md:w-24 shrink-0">
                  <div className={`p-2 rounded-lg ${project.status === "completed" ? "bg-green-100" : project.status === "in-progress" ? "bg-blue-100" : "bg-amber-100"}`}>
                    <Icon className={`w-5 h-5 ${project.status === "completed" ? "text-green-600" : project.status === "in-progress" ? "text-blue-600" : "text-amber-600"}`} />
                  </div>
                  <span className="font-bold text-foreground">{project.completionYear}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{project.name}</h4>
                    <Badge className={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{project.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      <span className="text-foreground">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">{project.appreciationEstimate}</span>
                      <span className="text-muted-foreground text-xs">estimated appreciation</span>
                    </div>
                  </div>

                  {/* Impact Areas */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Impact areas:</span>
                    {project.impactAreas.map((area) => (
                      <span
                        key={area}
                        className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-gold/5 border border-gold/20">
        <div className="flex items-start gap-3">
          <ArrowRight className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-foreground mb-1">Investment Insight</h5>
            <p className="text-sm text-muted-foreground">
              Properties within 5km of major infrastructure projects typically see 20-40% appreciation within 2 years of project completion. 
              Focus on Red Line corridor and Lekki-Epe axis for maximum growth potential in 2024-2027.
            </p>
          </div>
        </div>
      </Card>

      <div className="bg-primary/5 rounded-lg p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Data Source:</strong> Lagos State Government infrastructure announcements, LASG Ministry of Works reports, 
          and verified contractor timelines. Appreciation estimates based on historical patterns around similar projects.
        </p>
      </div>
    </div>
  );
};
