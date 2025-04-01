
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, UserRole } from "@/lib/types";
import { Eye, EyeOff, MapPin, Plus, RefreshCw, Trash2, UserPlus } from "lucide-react";

const AddUserForm = ({ onAddUser }: { onAddUser: (userData: any) => void }) => {
  const { currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "fmt" as UserRole,
    name: "",
    email: "",
    phone: "",
    active: true,
    designation: ""
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert name to camelCase
    const nameParts = newUser.name.trim().toLowerCase().split(' ');
    const camelCaseName = nameParts.map(part => {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
    
    onAddUser({...newUser, name: camelCaseName});
  };

  // Determine available roles based on current user role
  const availableRoles = () => {
    if (currentUser?.role === "developer") {
      return [
        { value: "master", label: "Master" },
        { value: "fmt", label: "FMT" },
        { value: "social-mobilizer", label: "Social Mobilizer" }
      ];
    } else if (currentUser?.role === "master") {
      return [
        { value: "fmt", label: "FMT" },
        { value: "social-mobilizer", label: "Social Mobilizer" }
      ];
    }
    return [];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New User</CardTitle>
        <CardDescription>Create a new account for the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
              placeholder="Enter full name"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
              placeholder="Enter username"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                placeholder="Enter password"
                className="w-full"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={newUser.role}
              onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value as UserRole })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles().map(role => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={newUser.designation}
              onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
              placeholder="Enter designation"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="Enter phone number"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter email address"
              className="w-full"
            />
          </div>
          
          <Button type="submit" className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const UsersList = ({ users, onDeleteUser }: { users: User[], onDeleteUser: (userId: string) => void }) => {
  const { currentUser } = useAuth();
  
  // Filter users based on current user role
  const getVisibleUsers = () => {
    let filteredUsers = [...users];
    
    // If current user is developer, show all users
    if (currentUser?.role === 'developer') {
      return filteredUsers;
    }
    
    // For all other roles, hide the developer (Super Admin)
    return filteredUsers.filter(user => user.role !== 'developer');
  };

  const visibleUsers = getVisibleUsers();
  
  const getRoleBadgeVariant = (role: UserRole) => {
    switch(role) {
      case 'developer':
        return 'default';
      case 'master':
        return 'secondary';
      case 'fmt':
        return 'outline';
      case 'social-mobilizer':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  const getRoleDisplayName = (role: UserRole) => {
    switch(role) {
      case 'developer':
        return 'Super Admin';
      case 'master':
        return 'Master';
      case 'fmt':
        return 'FMT';
      case 'social-mobilizer':
        return 'Social Mobilizer';
      default:
        return role;
    }
  };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>User List</CardTitle>
        <CardDescription>Manage system users and their roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.length > 0 ? (
                visibleUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.designation || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          user.online ? "bg-green-500" : "bg-gray-400"
                        }`}></div>
                        {user.online ? "Online" : "Offline"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastActive ? new Date(user.lastActive).toLocaleString('en-PK', {
                        timeZone: 'Asia/Karachi'
                      }) : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.id !== "1" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const LocationTracking = ({ users, onRefreshLocations }: { users: User[], onRefreshLocations: () => void }) => {
  const { currentUser } = useAuth();
  
  // Filter to only show field workers (FMT and Social Mobilizers)
  const fieldWorkers = users.filter(user => 
    user.role === 'fmt' || user.role === 'social-mobilizer'
  );
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Research Assistant Locations</CardTitle>
          <CardDescription>
            Track the real-time location of research assistants
          </CardDescription>
        </div>
        <Button variant="outline" onClick={onRefreshLocations}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="aspect-video rounded-md bg-muted relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* This would be an actual map in a real implementation */}
            <div className="text-muted-foreground">
              Map view would display here with real-time research assistant locations
            </div>
          </div>
          
          {/* Sample marker for field workers with location */}
          {fieldWorkers.slice(0, 3).map((worker, index) => (
            <div 
              key={worker.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2`}
              style={{ 
                top: `${30 + (index * 15)}%`, 
                left: `${20 + (index * 20)}%` 
              }}
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="mt-1 px-2 py-1 bg-background rounded-md text-xs shadow-sm">
                  {worker.username}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-4">Research Assistant Status</h3>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldWorkers.length > 0 ? (
                  fieldWorkers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        {user.role === 'fmt' ? 'FMT' : 'Social Mobilizer'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            user.online ? "bg-green-500" : "bg-gray-400"
                          }`}></div>
                          {user.online ? "Online" : "Offline"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.location ? (
                          <span className="text-xs">
                            {user.location.latitude.toFixed(4)}, {user.location.longitude.toFixed(4)}
                          </span>
                        ) : (
                          "Not available"
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastActive ? new Date(user.lastActive).toLocaleString('en-PK', {
                          timeZone: 'Asia/Karachi'
                        }) : "Never"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No field workers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityLogs = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Logs</CardTitle>
        <CardDescription>
          Monitor user actions and system activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{new Date().toLocaleString('en-PK', {timeZone: 'Asia/Karachi'})}</TableCell>
                <TableCell>asifjamali83</TableCell>
                <TableCell>Super Admin</TableCell>
                <TableCell>Login</TableCell>
                <TableCell>Successful login</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{new Date(Date.now() - 3600000).toLocaleString('en-PK', {timeZone: 'Asia/Karachi'})}</TableCell>
                <TableCell>fmt_user1</TableCell>
                <TableCell>FMT</TableCell>
                <TableCell>Data Entry</TableCell>
                <TableCell>Added 5 new child screening records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{new Date(Date.now() - 7200000).toLocaleString('en-PK', {timeZone: 'Asia/Karachi'})}</TableCell>
                <TableCell>master_user</TableCell>
                <TableCell>Master</TableCell>
                <TableCell>Export</TableCell>
                <TableCell>Exported child screening data for all records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{new Date(Date.now() - 86400000).toLocaleString('en-PK', {timeZone: 'Asia/Karachi'})}</TableCell>
                <TableCell>sm_user1</TableCell>
                <TableCell>Social Mobilizer</TableCell>
                <TableCell>Sync</TableCell>
                <TableCell>Synchronized offline data (15 records)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Activity logs show recent actions performed by users in the system
        </div>
      </CardContent>
    </Card>
  );
};

const UserManagement = () => {
  const { currentUser, isAuthenticated, addUser } = useAuth();
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('track4health_users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('track4health_users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error('Failed to parse stored users', error);
      }
    }
  }, []);

  const hasAdminPermissions = 
    currentUser?.role === "developer" || currentUser?.role === "master";
    
  const handleAddUser = async (userData: any) => {
    const success = await addUser(userData);
    if (success) {
      // Refresh the users list
      const storedUsers = localStorage.getItem('track4health_users');
      if (storedUsers) {
        try {
          setUsers(JSON.parse(storedUsers));
        } catch (error) {
          console.error('Failed to parse stored users', error);
        }
      }
    }
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setShowDeleteDialog(true);
  };

  const deleteUser = (id: string) => {
    if (id === "1") {
      toast({
        title: "Cannot delete super admin",
        description: "The super admin user cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('track4health_users', JSON.stringify(updatedUsers));
    
    setUserToDelete(null);
    setShowDeleteDialog(false);
    
    toast({
      title: "User deleted",
      description: "User has been deleted successfully",
    });
  };

  const refreshLocations = () => {
    toast({
      title: "Refreshing locations",
      description: "Research Assistant locations are being updated",
    });
    
    setTimeout(() => {
      toast({
        title: "Locations updated",
        description: "Research Assistant locations have been updated",
      });
    }, 1500);
  };

  if (!isAuthenticated || !hasAdminPermissions) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => userToDelete && deleteUser(userToDelete)} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            {currentUser?.role === "developer" ? "Super Admin" : "Master"} access
          </p>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="location">Location Tracking</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AddUserForm onAddUser={handleAddUser} />
              <div className="hidden lg:block">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>User Management Guide</CardTitle>
                    <CardDescription>How to manage users in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h3 className="font-medium">Available Roles:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {currentUser?.role === "developer" && (
                            <li>
                              <strong>Master:</strong> Can manage users and access all data
                            </li>
                          )}
                          <li>
                            <strong>FMT:</strong> Field monitoring team members who can enter data
                          </li>
                          <li>
                            <strong>Social Mobilizer:</strong> Community workers who can conduct awareness sessions
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium">User Permissions:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Only Super Admin and Masters can add/remove users</li>
                          <li>Masters can only add FMT and Social Mobilizer users</li>
                          <li>Regular users can only enter and view their own data</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium">Tips:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Ensure usernames are unique and passwords are secure</li>
                          <li>Assign appropriate roles based on responsibilities</li>
                          <li>Regularly monitor user activity through the logs</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <UsersList users={users} onDeleteUser={handleDeleteUser} />
            </div>
          </TabsContent>
          
          <TabsContent value="location">
            <LocationTracking users={users} onRefreshLocations={refreshLocations} />
          </TabsContent>
          
          <TabsContent value="activity">
            <ActivityLogs />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserManagement;
