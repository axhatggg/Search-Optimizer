
import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Header } from "@/components/Header";
import { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminProductForm } from "@/components/AdminProductForm";
import { AdminProductList } from "@/components/AdminProductList";

// Import product images
import headphonesImage from "@/assets/headphones.jpg";
import tshirtImage from "@/assets/tshirt.jpg";
import securityCameraImage from "@/assets/security-camera.jpg";
import coffeeImage from "@/assets/coffee.jpg";
import yogaMatImage from "@/assets/yoga-mat.jpg";
import faceCreamImage from "@/assets/face-cream.jpg";
import phoneCaseImage from "@/assets/phone-case.jpg";
import bookImage from "@/assets/book.jpg";

// Initial products data
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    originalPrice: 99.99,
    image: headphonesImage,
    rating: 4.5,
    reviews: 128,
    category: "Electronics",
    isNew: true,
    isSale: true,
  },
  {
    id: 2,
    name: "Premium Cotton T-Shirt",
    price: 24.99,
    image: tshirtImage,
    rating: 4.2,
    reviews: 85,
    category: "Clothing",
    isNew: false,
    isSale: false,
  },
  {
    id: 3,
    name: "Smart Home Security Camera",
    price: 149.99,
    originalPrice: 199.99,
    image: securityCameraImage,
    rating: 4.7,
    reviews: 203,
    category: "Electronics",
    isNew: true,
    isSale: true,
  },
  {
    id: 4,
    name: "Organic Coffee Beans - 1lb",
    price: 16.99,
    image: coffeeImage,
    rating: 4.8,
    reviews: 156,
    category: "Home",
    isNew: false,
    isSale: false,
  },
];

const Admin = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(...products.map(p => p.id), 0) + 1,
    };
    
    setProducts(prev => [...prev, newProduct]);
    setShowForm(false);
    
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added successfully.`,
    });
  };

  const handleUpdateProduct = (productData: Omit<Product, 'id'>) => {
    if (!editingProduct) return;
    
    const updatedProduct: Product = {
      ...productData,
      id: editingProduct.id,
    };
    
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setShowForm(false);
    
    toast({
      title: "Product Updated",
      description: `${updatedProduct.name} has been updated successfully.`,
    });
  };

  const handleDeleteProduct = (productId: number) => {
    const productToDelete = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    toast({
      title: "Product Deleted",
      description: `${productToDelete?.name} has been deleted successfully.`,
      variant: "destructive",
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} cartCount={0} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>
            
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {showForm ? (
          <AdminProductForm
            product={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={handleCancelForm}
          />
        ) : (
          <AdminProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}
      </main>
    </div>
  );
};

export default Admin;
