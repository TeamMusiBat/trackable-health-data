
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

const DEMO_USERS: User[] = [
  {
    id: "1",
    username: "asifjamali83",
    password: "Atifkhan83##",
    name: "Asif Jamali",
    email: "asif@example.com",
    active: true,
    role: "developer",
    online: true,
    lastActive: new Date(),
    phone: "+923001234567"
  },
  {
    id: "2",
    username: "master_user",
    password: "password123",
    name: "Master User",
    email: "master@example.com",
    active: true,
    role: "master",
    online: false,
    lastActive: new Date(Date.now() - 3600000),
    phone: "+923009876543"
  },
  {
    id: "3",
    username: "field_worker1",
    password: "password123",
    name: "Research Assistant 1",
    email: "worker1@example.com",
    active: true,
    role: "user",
    online: true,
    lastActive: new Date(),
    phone: "+923331234567",
    location: {
      latitude: 34.0151,
      longitude: 71.5249,
    },
  },
  {
    id: "4",
    username: "field_worker2",
    password: "password123",
    name: "Research Assistant 2",
    email: "worker2@example.com",
    active: true,
    role: "user",
    online: false,
    lastActive: new Date(Date.now() - 86400000),
    phone: "+923349876543"
  },
];

// Component for Add New User form
const AddUserForm = ({ onAddUser }: { onAddUser: (userData: any) => void }) => {
  const { currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as UserRole,
    name: "",
    email: "",
    phone: "",
    active: true
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser(newUser);
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
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
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
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {currentUser?.role === "developer" && (
                  <SelectItem value="master">Master</SelectItem>
                )}
                <SelectItem value="user">Research Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
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

// Component for Users List
const UsersList = ({ users, onDeleteUser }: { users: User[], onDeleteUser: (userId: string) => void }) => {
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
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === "developer" ? "default" :
                      user.role === "master" ? "secondary" :
                      "outline"
                    }>
                      {user.role === "developer" ? "Super Admin" :
                       user.role === "master" ? "Master" :
                       "Research Assistant"}
                    </Badge>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Location Tracking component
const LocationTracking = ({ users, onRefreshLocations }: { users: User[], onRefreshLocations: () => void }) => {
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
          
          {/* Sample marker for the one worker with location */}
          <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="mt-1 px-2 py-1 bg-background rounded-md text-xs shadow-sm">
                field_worker1
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-4">Research Assistant Status</h3>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter(user => user.role === "user")
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username}
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
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Activity Logs component
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
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{new Date().toLocaleString('en-PK', {timeZone: 'Asia/Karachi'})}</TableCell>
                <TableCell>asifjamali83</TableCell>
                <TableCell>Login</TableCell>
                <TableCell>Successful login from IP 192.168.1.1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{new Date(Date.now() - 3600000).toLocaleString('en-PK', {timeZone: 'Asia/Karachi'})}</TableCell>
                <TableCell>field_worker1</TableCell>
                <TableCell>Data Entry</TableCell>
                <TableCell>Added 5 new child screening records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{new Date(Date.now() - 7200000).toLocaleString('en-PK', {timeZone: 'Asia/Karachi'})}</TableCell>
                <TableCell>master_user</TableCell>
                <TableCell>Export</TableCell>
                <TableCell>Exported child screening data for all records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{new Date(Date.now() - 86400000).toLocaleString('en-PK', {timeZone: 'Asia/Karachi'})}</TableCell>
                <TableCell>field_worker2</TableCell>
                <TableCell>Sync</TableCell>
                <TableCell>Synchronized offline data (15 records)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          This is a demo view. In the actual implementation, this would display real activity logs from the database.
        </div>
      </CardContent>
    </Card>
  );
};

const UserManagement = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Check if user has admin permissions
  const hasAdminPermissions = 
    currentUser?.role === "developer" || currentUser?.role === "master";
    
  // Handler for adding a new user
  const handleAddUser = (userData: any) => {
    if (!userData.username || !userData.password || !userData.name) {
      toast({
        title: "Missing information",
        description: "Username, password, and name are required",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate username
    if (users.some(user => user.username === userData.username)) {
      toast({
        title: "Username already exists",
        description: "Please choose a different username",
        variant: "destructive",
      });
      return;
    }

    // Create new user with properly typed role
    const newUserEntry: User = {
      id: (users.length + 1).toString(),
      username: userData.username,
      password: userData.password,
      name: userData.name,
      email: userData.email || undefined, // Make email optional
      phone: userData.phone || undefined, // Make phone optional
      active: true,
      role: userData.role,
      online: false,
      lastActive: new Date(),
    };

    setUsers([...users, newUserEntry]);
    
    toast({
      title: "User created",
      description: `User ${userData.username} has been created successfully`,
    });
  };

  // Handler for deleting a user
  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setShowDeleteDialog(true);
  };

  const deleteUser = (id: string) => {
    // Don't allow deleting the super admin
    if (id === "1") {
      toast({
        title: "Cannot delete super admin",
        description: "The super admin user cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    setUsers(users.filter(user => user.id !== id));
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
    
    // In a real app, this would fetch the latest location data from the server
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
        
        <Tabs defaultValue="users">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="location">Location Tracking</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            {/* Add New User form above User List */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <AddUserForm onAddUser={handleAddUser} />
            </div>
            
            {/* User List */}
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
