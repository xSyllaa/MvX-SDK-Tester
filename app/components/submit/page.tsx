"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Info, PlusCircle, X, AlertCircle, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function SubmitComponentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag) && tags.length < 5) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      
      // Create preview for the first image if it's an image
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validation
      if (!title || !description || !category) {
        setSubmitError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      if (!githubUrl) {
        setSubmitError("GitHub URL is required. Please provide a link to your component repository.");
        setIsSubmitting(false);
        return;
      }

      // Submit to the API
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          tags,
          githubUrl,
          isPublic,
          // Note: authorId will be added server-side if user is authenticated
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit component');
      }
      
      // Redirect to success page
      router.push('/components/submit/success');
    } catch (error) {
      console.error("Error submitting component:", error);
      setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Share Your Component</h1>
          <p className="text-muted-foreground mt-2">
            Contribute to the community by sharing your reusable components for MultiversX development.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Component Details</CardTitle>
                <CardDescription>
                  Provide information about your component to help others discover and use it.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {submitError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Component Name <span className="text-destructive">*</span></Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Transaction Builder" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what your component does and how it can be used..." 
                    className="min-h-[120px]" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ui">UI Components</SelectItem>
                        <SelectItem value="sdk">SDK Utilities</SelectItem>
                        <SelectItem value="tools">Developer Tools</SelectItem>
                        <SelectItem value="wallet">Wallet Integration</SelectItem>
                        <SelectItem value="abi">ABI Helpers</SelectItem>
                        <SelectItem value="smart-contracts">Smart Contract Utilities</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tags">Tags ({tags.length}/5)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Tag info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add up to 5 tags to help users find your component</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input 
                        id="tags" 
                        placeholder="Add a tag..." 
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={tags.length >= 5}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddTag}
                        disabled={!currentTag || tags.length >= 5}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs py-1 px-2">
                          {tag}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 ml-1" 
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag}</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Repository URL <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Github className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="github" 
                      placeholder="https://github.com/yourusername/your-repo" 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently, components can only be shared via GitHub repositories. Please provide a link to your component's repository.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="files">Upload Files</Label>
                    <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/20">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium mb-1">Direct file uploads will be available soon</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      For now, please share your component through GitHub
                    </p>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full max-w-xs opacity-50 cursor-not-allowed"
                      disabled
                    >
                      File Uploads Coming Soon
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="public" 
                    checked={isPublic} 
                    onCheckedChange={setIsPublic} 
                  />
                  <Label htmlFor="public">Make this component public</Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Component"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how your component will appear in the library
                </CardDescription>
              </CardHeader>
              <CardContent>
                {title || description ? (
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="text-lg font-bold">{title || "Component Name"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {description || "Your component description will appear here..."}
                    </p>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {githubUrl && (
                      <div className="pt-2 text-sm">
                        <span className="text-muted-foreground">Source: </span>
                        <Link href={githubUrl} target="_blank" className="text-primary hover:underline truncate inline-block max-w-full">
                          {githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-center text-muted-foreground p-4 border rounded-lg">
                    <p>Fill in the form to see a preview of your component</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Submission Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="space-y-1">
                  <p className="font-medium">Quality Standards</p>
                  <p className="text-muted-foreground">Ensure your component works as described and includes clear documentation.</p>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium">GitHub Repository</p>
                  <p className="text-muted-foreground">Your repository should include a README with installation and usage instructions.</p>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium">Licensing</p>
                  <p className="text-muted-foreground">Components should include a license (MIT is recommended).</p>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium">Review Process</p>
                  <p className="text-muted-foreground">All submissions will be reviewed before being published to the library.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 