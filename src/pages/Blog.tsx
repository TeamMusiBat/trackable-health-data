
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { BlogPost } from "@/lib/types";
import { BookOpen, Calendar, Edit, Plus, User } from "lucide-react";

// Sample blog posts
const samplePosts: BlogPost[] = [
  {
    id: "1",
    title: "Importance of Child Nutrition in Early Development",
    content: `
      <p>Proper nutrition during early childhood is crucial for optimal growth and development. During the first 1,000 days of life—from conception to age two—children's brains and bodies are developing rapidly, making this period especially sensitive to nutritional deficiencies.</p>
      
      <h3>Key Nutrients for Child Development</h3>
      <ul>
        <li><strong>Protein:</strong> Essential for growth and repair of body tissues</li>
        <li><strong>Iron:</strong> Critical for cognitive development and preventing anemia</li>
        <li><strong>Zinc:</strong> Supports immune function and growth</li>
        <li><strong>Vitamin A:</strong> Crucial for vision, immune function, and cell growth</li>
        <li><strong>Iodine:</strong> Necessary for thyroid function and brain development</li>
      </ul>
      
      <p>Malnutrition during this critical period can have long-lasting effects on physical growth, cognitive development, and overall health. Studies have shown that children who experience malnutrition in early childhood are more likely to have:</p>
      
      <ul>
        <li>Delayed physical growth and reduced adult height</li>
        <li>Impaired cognitive development and lower academic achievement</li>
        <li>Weakened immune systems and increased susceptibility to illness</li>
        <li>Higher risk of chronic diseases in adulthood</li>
      </ul>
      
      <h3>Community-Based Solutions</h3>
      <p>At Track4Health, we work with communities to implement effective nutrition interventions:</p>
      
      <ul>
        <li>Regular child growth monitoring to identify at-risk children</li>
        <li>Promotion of exclusive breastfeeding for the first six months of life</li>
        <li>Education on appropriate complementary feeding practices after six months</li>
        <li>Micronutrient supplementation when needed</li>
        <li>Treatment of severe acute malnutrition (SAM) and moderate acute malnutrition (MAM)</li>
      </ul>
      
      <p>By addressing nutrition early, we can help ensure that all children have the opportunity to reach their full potential.</p>
    `,
    author: "Dr. Sarah Johnson",
    date: new Date("2023-09-15"),
    excerpt: "Learn why proper nutrition in the first 1,000 days of life is critical for a child's lifelong health and development.",
    slug: "importance-of-child-nutrition",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    tags: ["nutrition", "child health", "early development"],
    isPublished: true
  },
  {
    id: "2",
    title: "Effective Community Awareness Strategies for Health Programs",
    content: `
      <p>Community awareness is a cornerstone of successful public health initiatives. Without proper awareness, even the best-designed health programs may fail to reach those who need them most.</p>
      
      <h3>Key Strategies for Effective Health Awareness</h3>
      
      <h4>1. Understand Your Audience</h4>
      <p>Before designing awareness campaigns, it's essential to understand the specific needs, beliefs, and practices of your target community. This involves:</p>
      <ul>
        <li>Conducting community assessments</li>
        <li>Identifying key influencers and decision-makers</li>
        <li>Understanding existing health beliefs and practices</li>
        <li>Recognizing potential barriers to behavior change</li>
      </ul>
      
      <h4>2. Use Appropriate Communication Channels</h4>
      <p>Different communities respond to different communication methods. Consider using:</p>
      <ul>
        <li>Community meetings and group discussions</li>
        <li>Local media (radio, community bulletin boards)</li>
        <li>Mobile health messages</li>
        <li>Visual aids for low literacy populations</li>
        <li>Social networks and community leaders as message carriers</li>
      </ul>
      
      <h4>3. Develop Clear, Actionable Messages</h4>
      <p>Health messages should be:</p>
      <ul>
        <li>Simple and easy to understand</li>
        <li>Culturally appropriate and respectful</li>
        <li>Focused on specific, achievable actions</li>
        <li>Reinforced through multiple channels</li>
      </ul>
      
      <h4>4. Engage Community Members as Partners</h4>
      <p>Sustainable health awareness comes from community ownership:</p>
      <ul>
        <li>Train community health workers from the local population</li>
        <li>Involve community leaders in program planning</li>
        <li>Create community health committees</li>
        <li>Develop peer education programs</li>
      </ul>
      
      <h4>5. Monitor and Adapt</h4>
      <p>Regular feedback helps improve awareness strategies:</p>
      <ul>
        <li>Track message reach and understanding</li>
        <li>Measure changes in knowledge, attitudes, and practices</li>
        <li>Gather community feedback on awareness activities</li>
        <li>Adapt approaches based on what works</li>
      </ul>
      
      <p>At Track4Health, we implement these strategies through our FMT (Field Monitoring Team) and Social Mobilizer programs, ensuring health information reaches every community we serve.</p>
    `,
    author: "Fatima Ahmed",
    date: new Date("2023-10-20"),
    excerpt: "Discover effective strategies for raising health awareness in communities through targeted communication and engagement.",
    slug: "effective-community-awareness-strategies",
    image: "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    tags: ["community health", "awareness", "health education"],
    isPublished: true
  },
];

const BlogPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="relative h-48 w-full mb-4 overflow-hidden rounded-md">
          {post.image ? (
            <img 
              src={post.image} 
              alt={post.title} 
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" 
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardTitle className="text-xl font-bold">{post.title}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(post.date).toLocaleDateString()}
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-3 text-muted-foreground">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="w-full">
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
};

const BlogPostForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing information",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Blog post created",
      description: "Your blog post has been saved"
    });
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter blog post title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input 
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          placeholder="Brief summary of the post"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">Featured Image URL (Optional)</Label>
        <Input 
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea 
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your blog post content..."
          className="h-60"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Post</Button>
      </div>
    </form>
  );
};

const Blog = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>(samplePosts);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Check if user has permission to create posts
  const canCreatePosts = currentUser?.role === 'developer' || currentUser?.role === 'master';
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">Track4Health Blog</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Stay informed about child health, nutrition, and community healthcare initiatives
            </p>
            
            {canCreatePosts && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mb-8">
                    <Plus className="mr-2 h-4 w-4" />
                    New Blog Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Blog Post</DialogTitle>
                    <DialogDescription>
                      Add a new article to share knowledge with the community.
                    </DialogDescription>
                  </DialogHeader>
                  <BlogPostForm onClose={() => setDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
            
            <Tabs defaultValue="all" className="max-w-3xl">
              <TabsList>
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="awareness">Awareness</TabsTrigger>
                <TabsTrigger value="community">Community Health</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>
        
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
          
          {posts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No blog posts yet</h3>
              <p className="text-muted-foreground mt-2">
                {canCreatePosts 
                  ? "Click the 'New Blog Post' button to create one." 
                  : "Check back soon for health and nutrition insights."}
              </p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
