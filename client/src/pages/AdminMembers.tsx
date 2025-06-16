import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type User, type Profile } from "@shared/schema";
import { Search, Users, MapPin, Calendar, Loader2 } from "lucide-react";

interface MemberWithProfile extends User {
  profile: Profile;
}

export default function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedFarmType, setSelectedFarmType] = useState<string>("");

  const { data: members, isLoading, error } = useQuery<MemberWithProfile[]>({
    queryKey: ["/api/admin/members", searchTerm, selectedState, selectedFarmType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("query", searchTerm);
      if (selectedState) params.append("state", selectedState);
      if (selectedFarmType) params.append("farmType", selectedFarmType);
      
      const response = await fetch(`/api/admin/members?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }
      
      return response.json();
    },
  });

  const allStates = Array.from(
    new Set(members?.map(member => member.profile.state).filter(Boolean) || [])
  ).sort();

  const allFarmTypes = Array.from(
    new Set(members?.map(member => member.profile.farmType).filter(Boolean) || [])
  ).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MEMBER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to load member data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-ugga-primary rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Member Directory</h1>
              <p className="text-gray-600">View and search UGGA member information</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-ugga-primary mb-2">
                {members?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-ugga-primary mb-2">
                {allStates.length}
              </div>
              <div className="text-sm text-gray-600">States Represented</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-ugga-primary mb-2">
                {allFarmTypes.length}
              </div>
              <div className="text-sm text-gray-600">Farm Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-ugga-primary mb-2">
                {members?.filter(m => m.role === "ADMIN").length || 0}
              </div>
              <div className="text-sm text-gray-600">Administrators</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All States</SelectItem>
              {allStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedFarmType} onValueChange={setSelectedFarmType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by farm type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Farm Types</SelectItem>
              {allFarmTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Members ({members?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!members || members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedState || selectedFarmType 
                  ? "No members found matching your criteria." 
                  : "No members available."
                }
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Farm Type</TableHead>
                      <TableHead>Professional</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{member.profile.name}</div>
                            <div className="text-sm text-gray-500">@{member.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-gray-900">{member.email}</div>
                            <div className="text-gray-500">{member.profile.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {member.profile.state}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.profile.farmType ? (
                            <Badge variant="secondary">{member.profile.farmType}</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {member.profile.jobTitle && (
                              <div className="font-medium">{member.profile.jobTitle}</div>
                            )}
                            {member.profile.employer && (
                              <div className="text-gray-500">{member.profile.employer}</div>
                            )}
                            {!member.profile.jobTitle && !member.profile.employer && (
                              <span className="text-gray-400">Not specified</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(member.createdAt)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
