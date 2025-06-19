import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { type BlogPost } from "@shared/schema";

export default function Blog() {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  // Extract unique topics from posts (assuming posts have tags or categories)
  const availableTopics = posts ? 
    Array.from(new Set(posts.flatMap(post => post.contentMd.match(/#\w+/g) || []))).map(tag => tag.slice(1)) :
    [];

  const filteredPosts = posts?.filter(post => {
    if (selectedTopic === "all") return true;
    return post.contentMd.toLowerCase().includes(`#${selectedTopic.toLowerCase()}`) ||
           post.title.toLowerCase().includes(selectedTopic.toLowerCase());
  }) || [];

  // Reset to first page when filter changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (content: string, length: number = 150) => {
    const cleanContent = content.replace(/[#*`]/g, '').trim();
    return cleanContent.length > length 
      ? cleanContent.substring(0, length) + '...'
      : cleanContent;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16">
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
      <div className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-700">Unable to load blog posts. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest from Our Community</h1>
          <p className="text-lg text-gray-700 mb-8">
            Insights, tips, and success stories from greenhouse growers
          </p>
          
          {/* Topic Filter */}
          <div className="max-w-xs mx-auto">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {availableTopics.map(topic => (
                  <SelectItem key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </SelectItem>
                ))}
                <SelectItem value="grower-stories">Grower Stories</SelectItem>
                <SelectItem value="industry-insights">Industry Insights</SelectItem>
                <SelectItem value="best-practices">Best Practices</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog Posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {selectedTopic !== "all" ? "No articles found for this topic." : "No blog posts available yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paginatedPosts.map((post) => (
              <Card key={post.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-ugga-primary/10 text-ugga-primary">
                      Article
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.publishedAt)}
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {post.title}
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {getExcerpt(post.contentMd)}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" className="group p-0 h-auto text-ugga-primary hover:text-ugga-secondary">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination - only show if there are multiple pages */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
