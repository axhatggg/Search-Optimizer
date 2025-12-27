import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Truck, Heart, Award } from "lucide-react";

const About = () => {
  const handleSearch = (query) => {
    console.log("Search query:", query);
  };

  const features = [
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Your data and payments are protected with industry-leading security measures."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Free shipping on orders over $50 with express delivery options available."
    },
    {
      icon: Heart,
      title: "Customer Care",
      description: "24/7 customer support to help you with any questions or concerns."
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "100% satisfaction guarantee with easy returns and exchanges."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} cartCount={0} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            About Cartella
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          A system that uses NLP and relevance scoring to return the most appropriate products, even if the user's query is vague, misspelled, or natural language-based.
          </p>
          <Button size="lg">
            Start Shopping
          </Button>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                At Cartella, we believe shopping should be enjoyable, convenient, and accessible to everyone. 
                A system that uses NLP and relevance scoring to return the most appropriate products, even if the user's query is vague, misspelled, or natural language-based.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
              A system that uses NLP and relevance scoring to return the most appropriate products, even if the user's query is vague, misspelled, or natural language-based.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">Happy Customers</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50K+</div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">Products Sold</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">99%</div>
                <div className="text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Why Choose Cartella?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow dark:bg-gray-800">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Akshat Gupta", role: "NLP/ML", bio: "Passionate Engineer" },
              { name: "Faique Ibrahimi", role: "Backend/ElasticSearch", bio: "Passionate Engineer" },
              { name: "Saloni Kerketta", role: "Frontend", bio: "Passionate Engineer" },
              { name: "Harsh Kumar", role: "NLP/ML", bio: "Passionate Engineer" }
            ].map((member, index) => (
              <Card key={index} className="text-center dark:bg-gray-800">
                <CardHeader>
                  <div className="mx-auto mb-4 w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-blue-600 dark:text-blue-400">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Ready to Start Shopping?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of satisfied customers and discover amazing products today.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Browse Products</Button>
            <Button variant="outline" size="lg">Contact Us</Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About; 