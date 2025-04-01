
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Plus, FileSpreadsheet } from "lucide-react";
import { Badge } from "./ui/badge";
import { ChildScreeningData } from "@/lib/types";
import { useNavigate } from "react-router-dom";

interface DashboardRecentScreeningsProps {
  childScreening: ChildScreeningData[];
  onExport: () => void;
}

const DashboardRecentScreenings: React.FC<DashboardRecentScreeningsProps> = ({ 
  childScreening,
  onExport
}) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 3;
  const total = childScreening.length;
  
  const sortedScreenings = [...childScreening].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const paginatedScreenings = sortedScreenings.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );
  
  const goToNextPage = () => {
    if ((page * itemsPerPage) < total) {
      setPage(page + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const getMuacStatus = (muac: number) => {
    if (muac <= 11) return { status: "SAM", color: "text-red-600 bg-red-50" };
    if (muac <= 12) return { status: "MAM", color: "text-amber-600 bg-amber-50" };
    return { status: "Normal", color: "text-green-600 bg-green-50" };
  };
  
  const getVaccinationStatus = (status: string, dueVaccine: boolean) => {
    if (dueVaccine) return { text: "Due", icon: "🔺" };
    if (status === "Completed") return { text: "Complete", icon: "✓" };
    return { text: status, icon: "" };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Child Screening Management</CardTitle>
            <CardDescription>Recent screening records</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/child-screening')}>
              <Plus className="h-4 w-4 mr-1" />
              Add Screening
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NAME</TableHead>
                <TableHead>FATHER'S NAME</TableHead>
                <TableHead>VILLAGE</TableHead>
                <TableHead>AGE</TableHead>
                <TableHead>MUAC</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>VACCINATION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedScreenings.map((screening) => {
                const status = getMuacStatus(screening.muac);
                const vaccStatus = getVaccinationStatus(screening.vaccination || "0 - Dose", Boolean(screening.dueVaccine));
                
                return (
                  <TableRow 
                    key={screening.id} 
                    className={status.status === "SAM" 
                      ? "bg-red-50 dark:bg-red-900/20" 
                      : status.status === "MAM" 
                        ? "bg-amber-50 dark:bg-amber-900/20" 
                        : "bg-green-50 dark:bg-green-900/20"
                    }
                  >
                    <TableCell className="font-medium">{screening.name}</TableCell>
                    <TableCell>{screening.father}</TableCell>
                    <TableCell>{screening.village}</TableCell>
                    <TableCell>
                      {typeof screening.age === 'number' 
                        ? `${screening.age} years` 
                        : screening.age}
                    </TableCell>
                    <TableCell>{screening.muac} cm</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${status.color} border-transparent`}>
                        {status.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vaccStatus.icon && (
                        <span className="mr-1">{vaccStatus.icon}</span>
                      )}
                      {vaccStatus.text}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-2">
        <div className="text-xs text-muted-foreground">
          Showing {paginatedScreenings.length} of {total} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={(page * itemsPerPage) >= total}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DashboardRecentScreenings;
